/**
 * CareTrack - hospital map: floors, room search, step-by-step directions, admin room editor.
 */
/* ---------- hospital map, search, directions ---------- */
var M = { f: 0, sel: "", from: "", to: "", q: "", type: "", acc: false, ed: "" };
function route(a, b, acc) {
  var da = a.x + a.w / 2,
    db = b.x + b.w / 2,
    P = {},
    S2 = [],
    m = function (d) {
      return Math.max(1, Math.round(Math.abs(d) * 1.2));
    },
    dr = function (d) {
      return d > 0 ? "east" : "west";
    },
    sd = function (d, r) {
      return d > 0 == (r.s == "N") ? "left" : "right";
    },
    st = function (r) {
      return r.s == "N" ? 25 : 35;
    },
    lv = {
      f: a.f,
      t: "Leave <b>" + esc(a.n) + "</b> (" + FL[a.f] + ") and step into the corridor.",
    };
  if (a.f == b.f) {
    P[a.f] = [
      [da, st(a)],
      [da, 30],
      [db, 30],
      [db, st(b)],
    ];
    S2.push(lv);
    if (da != db)
      S2.push({
        f: a.f,
        t: "Walk about " + m(db - da) + " m " + dr(db - da) + " along the corridor.",
      });
    S2.push({
      f: a.f,
      t:
        "Arrive: <b>" +
        esc(b.n) +
        "</b> is " +
        (da == db ? "directly across the corridor" : "on your " + sd(db - da, b)) +
        ".",
    });
  } else {
    var cs = [[5, "lift"]].concat(acc ? [] : [[115, "stairs"]]).sort(function (x, y) {
        return (
          Math.abs(da - x[0]) + Math.abs(db - x[0]) - Math.abs(da - y[0]) - Math.abs(db - y[0])
        );
      })[0],
      cx = cs[0],
      cn = cs[1],
      up = b.f > a.f,
      n = Math.abs(b.f - a.f);
    P[a.f] = [
      [da, st(a)],
      [da, 30],
      [cx, 30],
    ];
    P[b.f] = [
      [cx, 30],
      [db, 30],
      [db, st(b)],
    ];
    S2.push(
      lv,
      { f: a.f, t: "Walk about " + m(cx - da) + " m " + dr(cx - da) + " to the " + cn + "." },
      {
        f: a.f,
        t:
          "Take the " +
          cn +
          " " +
          (up ? "up" : "down") +
          " " +
          n +
          " floor" +
          (n > 1 ? "s" : "") +
          " to <b>" +
          FL[b.f] +
          "</b>.",
      },
      {
        f: b.f,
        t:
          "Exit the " +
          cn +
          " and walk about " +
          m(db - cx) +
          " m " +
          dr(db - cx) +
          " along the corridor.",
      },
      { f: b.f, t: "Arrive: <b>" + esc(b.n) + "</b> is on your " + sd(db - cx, b) + "." },
    );
  }
  return { P: P, S: S2 };
}
function so(o, v) {
  return o
    .map(function (x) {
      return (
        '<option value="' + x[0] + '"' + (x[0] == v ? " selected" : "") + ">" + x[1] + "</option>"
      );
    })
    .join("");
}
function res() {
  var el = g("res");
  if (!el) return;
  var q = M.q.toLowerCase(),
    L = RM.filter(function (r) {
      return (
        (!M.type || r.t == M.type) &&
        (!q || [r.n, r.d, r.dr, r.nu, TY[r.t], FL[r.f]].join(" ").toLowerCase().indexOf(q) > -1)
      );
    });
  el.innerHTML =
    '<div class="mu">' +
    L.length +
    " result" +
    (L.length == 1 ? "" : "s") +
    "</div>" +
    L.map(function (r) {
      return (
        '<div class="it" onclick="pick(\'' +
        r.id +
        "')\"><b>" +
        esc(r.n) +
        '</b> <span class="mu">· ' +
        FL[r.f] +
        " · " +
        TY[r.t] +
        '</span><div class="mu">' +
        esc([r.dr, r.nu].filter(Boolean).join(" / ")) +
        "</div></div>"
      );
    }).join("");
}
function pick(id) {
  var r = by(id);
  if (!r) return;
  M.sel = M.to = id;
  M.f = r.f;
  render();
}
function svgV(rt) {
  var h =
    '<svg viewBox="0 0 120 60" class="map"><rect class="cor" x="8" y="25" width="104" height="10"/>';
  h +=
    '<rect class="r t-lift" x="1" y="25" width="7" height="10"/><text x="4.5" y="30.7">Lift</text><rect class="r t-stairs" x="112" y="25" width="7" height="10"/><text x="115.5" y="30.7">Stairs</text>';
  RM.filter(function (r) {
    return r.f == M.f;
  }).forEach(function (r) {
    var mx = Math.floor(r.w / 1.45),
      n = r.n.length > mx ? r.n.slice(0, mx - 1) + "…" : r.n;
    h +=
      "<g onclick=\"pick('" +
      r.id +
      '\')"><rect class="r t-' +
      r.t +
      (M.sel == r.id ? " sel" : "") +
      (M.from == r.id ? " frm" : "") +
      '" x="' +
      r.x +
      '" y="' +
      r.y +
      '" width="' +
      r.w +
      '" height="20"/><text x="' +
      (r.x + r.w / 2) +
      '" y="' +
      (r.y + 10.8) +
      '">' +
      esc(n) +
      "</text></g>";
  });
  if (rt && rt.P[M.f]) {
    var p = rt.P[M.f],
      e = p[p.length - 1];
    h +=
      '<polyline class="rt" points="' +
      p
        .map(function (a) {
          return a[0] + "," + a[1];
        })
        .join(" ") +
      '"/><circle cx="' +
      e[0] +
      '" cy="' +
      e[1] +
      '" r="1.3" fill="var(--pr)"/>';
  }
  return h + "</svg>";
}
function mapV() {
  if (!M.from) {
    var rg =
      RM.filter(function (r) {
        return r.n == "Registration";
      })[0] || RM[0];
    M.from = rg ? rg.id : "";
  }
  var adm = U.r == "admin",
    a = by(M.from),
    b = by(M.to),
    s = by(M.sel),
    rt = a && b && a != b ? route(a, b, M.acc) : null,
    srt = RM.slice().sort(function (x, y) {
      return x.f - y.f;
    });
  var opt = function (v) {
    return srt
      .map(function (r) {
        return (
          '<option value="' +
          r.id +
          '"' +
          (r.id == v ? " selected" : "") +
          ">" +
          esc(r.n) +
          " (" +
          FL[r.f] +
          ")</option>"
        );
      })
      .join("");
  };
  var ch = [["", "All"]]
    .concat(
      Object.keys(TY).map(function (k) {
        return [k, TY[k]];
      }),
    )
    .map(function (c) {
      return (
        '<button class="chip' +
        (M.type == c[0] ? " on" : "") +
        '" onclick="M.type=\'' +
        c[0] +
        "';render()\">" +
        c[1] +
        "</button>"
      );
    })
    .join("");
  var h =
    '<div class="mg"><div><div class="card"><b>Find a room</b><input id="q" style="margin-top:8px" placeholder="Room, department, doctor, nurse…" value="' +
    esc(M.q) +
    '" oninput="M.q=this.value;res()"><div class="chips">' +
    ch +
    '</div></div><div class="card" id="res"></div></div><div>';
  h +=
    '<div class="chips" style="margin:0 0 8px">' +
    FL.map(function (n, i) {
      return (
        '<button class="chip' +
        (M.f == i ? " on" : "") +
        '" onclick="M.f=' +
        i +
        ';render()">' +
        n +
        "</button>"
      );
    }).join("") +
    "</div>" +
    svgV(rt);
  h +=
    '<div style="margin:6px 0 10px">' +
    Object.keys(TY)
      .map(function (k) {
        return '<span class="lg t-' + k + '"><i class="dot"></i>' + TY[k] + "</span>";
      })
      .join("") +
    "</div>";
  h +=
    '<div class="card"><b>Directions</b><div class="f2"><label>From<select onchange="M.from=this.value;render()">' +
    opt(M.from) +
    '</select></label><label>To<select onchange="pick(this.value)"><option value="">Choose…</option>' +
    opt(M.to) +
    '</select></label></div><label class="ck"><input type="checkbox" ' +
    (M.acc ? "checked" : "") +
    ' onchange="M.acc=this.checked;render()"> Accessible route (lifts only, no stairs)</label>';
  h += rt
    ? '<ol class="steps">' +
      rt.S.map(function (x) {
        return '<li onclick="M.f=' + x.f + ';render()">' + x.t + "</li>";
      }).join("") +
      "</ol>"
    : '<div class="mu" style="margin-top:8px">' +
      (a && b && a == b
        ? "You are already here."
        : "Pick a destination to see step-by-step directions.") +
      "</div>";
  h += "</div>";
  if (s)
    h +=
      '<div class="card"><div class="row"><b>' +
      esc(s.n) +
      '</b><span class="pill ok">' +
      FL[s.f] +
      '</span></div><div class="mu">' +
      TY[s.t] +
      (s.d ? " · " + esc(s.d) : "") +
      " · " +
      (s.s == "N" ? "north" : "south") +
      " side of corridor</div>" +
      (s.dr ? "<div>Doctor: " + esc(s.dr) + "</div>" : "") +
      (s.nu ? "<div>Nurse: " + esc(s.nu) + "</div>" : "") +
      (s.b ? "<div>Beds: " + s.b + "</div>" : "") +
      '<div class="row2"><button class="b s" onclick="M.from=\'' +
      s.id +
      "';render()\">Start from here</button>" +
      (adm
        ? '<button class="b s" onclick="M.ed=\'' +
          s.id +
          "';render();g('rn').focus()\">Edit</button><button class=\"b s\" onclick=\"delRoom('" +
          s.id +
          "')\">Delete</button>"
        : "") +
      "</div></div>";
  if (adm) {
    var e = by(M.ed) || { f: M.f, s: "N", n: "", t: "ward", d: "", dr: "", nu: "", w: 14, b: 0 },
      tp = Object.keys(TY).map(function (k) {
        return [k, TY[k]];
      });
    h +=
      '<div class="card"><b>' +
      (M.ed ? "Edit room" : "Add room / location") +
      '</b><div class="f3"><label>Floor<select id="rf">' +
      so(
        FL.map(function (n, i) {
          return [i, n];
        }),
        e.f,
      ) +
      '</select></label><label>Side<select id="rs">' +
      so(
        [
          ["N", "North"],
          ["S", "South"],
        ],
        e.s,
      ) +
      '</select></label><label>Type<select id="rt">' +
      so(tp, e.t) +
      '</select></label></div><div class="f3"><label>Name<input id="rn" value="' +
      esc(e.n) +
      '"></label><label>Department<input id="rd" value="' +
      esc(e.d) +
      '"></label><label>Width (6-40)<input id="rw" type="number" value="' +
      e.w +
      '"></label></div><div class="f3"><label>Doctor<input id="rdr" value="' +
      esc(e.dr) +
      '"></label><label>Nurse<input id="rnu" value="' +
      esc(e.nu) +
      '"></label><label>Beds<input id="rb" type="number" value="' +
      e.b +
      '"></label></div><div id="fm"></div><div class="row2"><button class="b" onclick="saveRoom()">' +
      (M.ed ? "Update" : "Add room") +
      "</button>" +
      (M.ed ? '<button class="b s" onclick="M.ed=\'\';render()">Cancel</button>' : "") +
      "</div></div>";
  }
  return h + "</div></div>";
}
function saveRoom() {
  var v = function (i) {
      return g(i).value.trim();
    },
    f = +g("rf").value,
    s = g("rs").value,
    w = +v("rw"),
    n = v("rn"),
    m = g("fm"),
    e = by(M.ed);
  if (!n || !(w >= 6 && w <= 40)) {
    m.innerHTML = '<div class="msg er">Name and a width between 6 and 40 are required.</div>';
    return;
  }
  var used = RM.filter(function (r) {
    return r.f == f && r.s == s && r != e;
  }).reduce(function (a, r) {
    return a + r.w;
  }, 0);
  if (used + w > 100) {
    m.innerHTML =
      '<div class="msg er">Not enough space on that side of the floor (' +
      (100 - used) +
      " units free).</div>";
    return;
  }
  var o = {
    f: f,
    s: s,
    n: n,
    t: v("rt"),
    d: v("rd"),
    dr: v("rdr"),
    nu: v("rnu"),
    w: w,
    b: Math.max(0, +v("rb") || 0),
  };
  if (e) Object.assign(e, o);
  else {
    o.id = "r" + Date.now();
    RM.push(o);
    M.sel = o.id;
  }
  M.ed = "";
  M.f = f;
  pack();
  sv(KR, RM);
  toast(e ? "Room updated" : "Room added");
  render();
}
function delRoom(id) {
  if (M.dc != id) {
    M.dc = id;
    toast("Click Delete again to confirm");
    return;
  }
  M.dc = "";
  RM = RM.filter(function (r) {
    return r.id != id;
  });
  ["sel", "to", "from"].forEach(function (k) {
    if (M[k] == id) M[k] = "";
  });
  M.ed = "";
  pack();
  sv(KR, RM);
  toast("Room deleted");
  render();
}
