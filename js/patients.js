/**
 * CareTrack - patients: daily vitals entry, discharge rules, doctor/nurse/admin views, history and charts.
 */
/* ---------- patients ---------- */
function off(n, h) {
  var d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h || 9, 0, 0, 0);
  return d.getTime();
}
function rd(l) {
  var o = [];
  l.forEach(function (x) {
    (x[0]
      ? [
          [9, x[1]],
          [18, x[1] - 0.1],
        ]
      : [[9, x[1]]]
    ).forEach(function (y) {
      var v = +y[1].toFixed(1);
      o.push({
        t: off(x[0], y[0]),
        v: v,
        o2: Math.round(98 - (v - 36.8) * 2.2),
        hr: Math.round(72 + (v - 36.8) * 14),
        sb: 118 + Math.round((v - 36.8) * 3),
        db: 78,
        rr: Math.round(16 + (v - 36.8) * 2),
        note: "",
      });
    });
  });
  return o;
}
function seedP() {
  return {
    closed: { disc: 38, dead: 6 },
    p: [
      {
        id: 1,
        name: "Aarav Mehta",
        age: 34,
        room: "101",
        st: "in",
        r: rd([
          [4, 38.6],
          [3, 37.2],
          [2, 36.9],
          [1, 36.8],
          [0, 36.7],
        ]),
      },
      {
        id: 2,
        name: "Diya Rao",
        age: 52,
        room: "102",
        st: "in",
        r: rd([
          [3, 38.9],
          [2, 38.2],
          [1, 37.6],
        ]),
      },
      {
        id: 3,
        name: "Rohan Shah",
        age: 41,
        room: "103",
        st: "in",
        r: rd([
          [3, 37.1],
          [2, 37.0],
          [1, 37.3],
        ]),
      },
      {
        id: 4,
        name: "Meera Iyer",
        age: 67,
        room: "104",
        st: "in",
        r: rd([
          [2, 39.4],
          [1, 39.1],
          [0, 39.5],
        ]),
      },
      {
        id: 5,
        name: "Karan Patel",
        age: 29,
        room: "105",
        st: "in",
        r: rd([
          [1, 37.8],
          [0, 38.3],
        ]),
      },
      {
        id: 6,
        name: "Sana Khan",
        age: 38,
        room: "106",
        st: "in",
        r: rd([
          [3, 36.9],
          [2, 37.4],
          [1, 37.2],
          [0, 37.0],
        ]),
      },
      {
        id: 7,
        name: "Vikram Das",
        age: 45,
        room: "107",
        st: "appr",
        r: rd([
          [3, 37.0],
          [2, 36.8],
          [1, 36.9],
          [0, 36.8],
        ]),
      },
    ],
  };
}
var S = ld(K, seedP);
function dk(d) {
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}
function info(p) {
  var by = {},
    i,
    a;
  p.r.forEach(function (x) {
    var k = dk(new Date(x.t));
    (by[k] = by[k] || []).push(x.v);
  });
  var td = by[dk(new Date())] || [],
    el = true;
  for (i = 1; i <= 3; i++) {
    a = by[dk(new Date(off(i)))];
    if (!a || Math.max.apply(0, a) >= FEV) el = false;
  }
  if (td.length && Math.max.apply(0, td) >= FEV) el = false;
  var fd = 0;
  for (i = 0; i < 10; i++) {
    a = by[dk(new Date(off(i)))];
    if (a && Math.max.apply(0, a) >= FEV) fd++;
    else if (i > 0) break;
  }
  return {
    measured: td.length > 0,
    elig: el,
    fd: fd,
    last: p.r.length ? p.r[p.r.length - 1] : null,
  };
}
function stats() {
  var act = S.p.filter(function (p) {
      return p.st == "in" || p.st == "appr";
    }).length,
    c = S.closed,
    t = c.disc + c.dead;
  return { act: act, mort: t ? (c.dead / t) * 100 : 0, succ: t ? (c.disc / t) * 100 : 100 };
}
function pillT(v) {
  return v >= FEV
    ? '<span class="pill er">' + v.toFixed(1) + "°C fever</span>"
    : v < 35
      ? '<span class="pill wa">' + v.toFixed(1) + "°C low</span>"
      : '<span class="pill ok">' + v.toFixed(1) + "°C</span>";
}
function trend(p) {
  return (
    p.r
      .slice(-5)
      .map(function (x) {
        return x.v.toFixed(1);
      })
      .join(" → ") || "no readings yet"
  );
}
function nurseV() {
  var L = S.p
      .filter(function (p) {
        return p.st == "in";
      })
      .sort(function (a, b) {
        return info(a).measured - info(b).measured;
      }),
    pend = L.filter(function (p) {
      return !info(p).measured;
    }).length;
  var h =
    '<div class="card row"><div><b>Today\'s rounds</b><div class="mu">' +
    pend +
    " of " +
    L.length +
    ' patients still need a reading</div></div><span class="pill ' +
    (pend ? "wa" : "ok") +
    '">' +
    (pend ? "Pending" : "All done") +
    "</span></div>";
  L.forEach(function (p) {
    var i = info(p);
    h +=
      '<div class="card"><div class="row"><div><b>Room ' +
      esc(p.room) +
      " · " +
      esc(p.name) +
      '</b> <span class="mu">' +
      p.age +
      'y</span><div class="mu">' +
      trend(p) +
      "</div></div><div>" +
      (i.measured
        ? '<span class="pill ok">Done today</span>'
        : '<span class="pill wa">Due</span>') +
      " " +
      (i.last ? pillT(i.last.v) : "") +
      "</div></div>";
    if (openId == p.id) h += formV(p.id);
    else
      h +=
        '<div class="row2"><button class="b" onclick="openId=' +
        p.id +
        ';render()">' +
        (i.measured ? "Add another reading" : "Record vitals") +
        "</button>" +
        hb(p.id) +
        "</div>";
    h += "</div>";
  });
  return h;
}
function hb(id) {
  return '<button class="b s" onclick="PV=' + id + ';render()">History &amp; charts</button>';
}
function formV(id) {
  return (
    '<div class="f3"><label>Temp °C *<input id="tv" type="number" step="0.1" inputmode="decimal"></label><label>SpO2 %<input id="o2" type="number"></label><label>Pulse /min<input id="hr" type="number"></label></div><div class="f3"><label>BP systolic<input id="sb" type="number"></label><label>BP diastolic<input id="db" type="number"></label><label>Resp. rate /min<input id="rr" type="number"></label></div><label>Note<input id="nt" placeholder="Symptoms, medication..."></label><div id="vm"></div><div class="row2"><button class="b" onclick="rec(' +
    id +
    ')">Save</button><button class="b s" onclick="openId=null;render()">Cancel</button></div>'
  );
}
function err(m) {
  g("vm").innerHTML = '<div class="msg er">' + m + "</div>";
}
function rec(id, force) {
  var n = function (k) {
      var x = g(k).value.trim();
      return x === "" ? null : +x;
    },
    v = n("tv"),
    o2 = n("o2"),
    hr = n("hr"),
    sb = n("sb"),
    db = n("db"),
    rr = n("rr"),
    vm = g("vm"),
    p = S.p.filter(function (x) {
      return x.id == id;
    })[0],
    i = info(p),
    w = [],
    bad = function (x, a, b) {
      return x !== null && (isNaN(x) || x < a || x > b);
    };
  if (v === null || isNaN(v) || v < 30 || v > 45) {
    err("Enter a valid temperature between 30 and 45 °C.");
    return;
  }
  if (
    bad(o2, 50, 100) ||
    bad(hr, 30, 220) ||
    bad(sb, 60, 250) ||
    bad(db, 30, 150) ||
    bad(rr, 5, 60) ||
    (sb === null) != (db === null)
  ) {
    err(
      "Check vitals: SpO2 50-100, pulse 30-220, BP 60-250 / 30-150 (enter both values), respiratory rate 5-60.",
    );
    return;
  }
  if (sb !== null && db >= sb) {
    err("Diastolic must be lower than systolic.");
    return;
  }
  if (v < 34 || v > 42) w.push("Temperature looks implausible - please re-measure.");
  if (i.last && Math.abs(v - i.last.v) >= 1.5)
    w.push(
      "Temperature differs by " + Math.abs(v - i.last.v).toFixed(1) + "°C from the last reading.",
    );
  if (w.length && !force) {
    vm.innerHTML =
      '<div class="msg wa">' +
      w.join(" ") +
      '</div><div class="row2"><button class="b" onclick="rec(' +
      id +
      ',1)">Confirm &amp; save anyway</button></div>';
    return;
  }
  p.r.push({
    t: Date.now(),
    v: v,
    o2: o2,
    hr: hr,
    sb: sb,
    db: db,
    rr: rr,
    note: g("nt").value.trim(),
  });
  sv(K, S);
  openId = null;
  var al = [];
  if (v >= FEV) al.push("fever");
  if (o2 !== null && o2 < 94) al.push("low SpO2");
  if (hr !== null && (hr > 120 || hr < 45)) al.push("abnormal pulse");
  toast(al.length ? "Saved - ALERT to doctor: " + al.join(", ") : "Vitals saved for " + p.name);
  render();
}
function doctorV() {
  var L = S.p.filter(function (p) {
      return p.st == "in";
    }),
    A = [],
    B = [],
    C = [],
    h = "";
  L.forEach(function (p) {
    var i = info(p);
    if (!i.measured) C.push(p);
    else if (i.elig) A.push(p);
    else B.push(p);
  });
  h += "<h2>Ready for discharge review (" + A.length + ")</h2>";
  A.forEach(function (p) {
    h +=
      '<div class="card"><div class="row"><div><b>' +
      esc(p.name) +
      "</b> · Rm " +
      esc(p.room) +
      '<div class="mu">' +
      trend(p) +
      '</div></div><span class="pill ok">3+ days fever-free</span></div><div class="row2"><button class="b" onclick="appr(' +
      p.id +
      ')">Approve discharge</button>' +
      hb(p.id) +
      "</div></div>";
  });
  if (!A.length) h += '<div class="card mu">None right now.</div>';
  h += "<h2>Still under treatment (" + B.length + ")</h2>";
  B.forEach(function (p) {
    var i = info(p);
    h +=
      '<div class="card"><div class="row"><div><b>' +
      esc(p.name) +
      "</b> · Rm " +
      esc(p.room) +
      '<div class="mu">' +
      trend(p) +
      "</div></div>" +
      (i.fd
        ? '<span class="pill er">Fever ' + i.fd + " day" + (i.fd > 1 ? "s" : "") + "</span>"
        : '<span class="pill wa">Monitoring</span>') +
      '</div><div class="row2"><button class="b s" disabled>Discharge locked</button>' +
      hb(p.id) +
      "</div></div>";
  });
  h += "<h2>Not measured yet – don't visit (" + C.length + ")</h2>";
  C.forEach(function (p) {
    h +=
      '<div class="card row" style="opacity:.7"><b>' +
      esc(p.name) +
      " · Rm " +
      esc(p.room) +
      '</b><span class="pill wa">Waiting for nurse</span>' +
      hb(p.id) +
      "</div>";
  });
  return h;
}
function appr(id) {
  var p = S.p.filter(function (x) {
    return x.id == id;
  })[0];
  if (!info(p).elig) return;
  p.st = "appr";
  sv(K, S);
  toast("Approved – admin notified");
  render();
}
function adminV() {
  var s = stats(),
    cp = CAP(),
    q = S.p.filter(function (p) {
      return p.st == "appr";
    }),
    act = S.p.filter(function (p) {
      return p.st == "in";
    }),
    h = "";
  h +=
    '<div class="grid"><div class="card stat"><b>' +
    s.act +
    "/" +
    cp +
    '</b><span class="mu">Beds used</span><div class="bar"><i style="width:' +
    Math.min(100, (s.act / cp) * 100) +
    '%"></i></div></div><div class="card stat"><b style="color:var(--' +
    (s.mort > 15 ? "er" : "ok") +
    ')">' +
    s.mort.toFixed(1) +
    '%</b><span class="mu">Mortality (max 15%)</span></div><div class="card stat"><b style="color:var(--' +
    (s.succ < 85 ? "er" : "ok") +
    ')">' +
    s.succ.toFixed(1) +
    '%</b><span class="mu">Success (min 85%)</span></div></div>';
  if (s.succ < 85)
    h +=
      '<div class="msg er">Success rate is below the 85% benchmark – review critical patients.</div>';
  h += "<h2>Discharge queue (" + q.length + ")</h2>";
  q.forEach(function (p) {
    h +=
      '<div class="card row"><div><b>' +
      esc(p.name) +
      "</b> · Rm " +
      esc(p.room) +
      '<div class="mu">Doctor approved</div></div><button class="b" onclick="fin(' +
      p.id +
      ",'disc')\">Confirm discharge</button>" +
      hb(p.id) +
      "</div>";
  });
  if (!q.length) h += '<div class="card mu">No approved discharges waiting.</div>';
  h +=
    '<h2>Admit patient</h2><div class="card"><div class="f"><input id="an" placeholder="Name"><input id="aa" type="number" placeholder="Age"><input id="ar" placeholder="Room/bed"></div><div class="row2"><button class="b" onclick="adm()">Admit</button></div><div id="am"></div></div><h2>Record outcome</h2>';
  act.forEach(function (p) {
    h +=
      '<div class="card row"><span>' +
      esc(p.name) +
      " · Rm " +
      esc(p.room) +
      '</span><button class="b s" onclick="fin(' +
      p.id +
      ",'dead')\">Mark deceased</button>" +
      hb(p.id) +
      "</div>";
  });
  return (
    h +
    '<div class="row2"><button class="b s" onclick="S=seedP();sv(K,S);render()">Reset patient demo data</button><button class="b s" onclick="RM=seedRooms();pack();sv(KR,RM);M.sel=M.to=\'\';render()">Reset hospital map</button></div>'
  );
}
function fin(id, k) {
  S.p.forEach(function (p) {
    if (p.id == id) p.st = k == "disc" ? "out" : "dead";
  });
  S.closed[k]++;
  sv(K, S);
  toast(k == "disc" ? "Discharged – bed freed" : "Outcome recorded");
  render();
}
function adm() {
  var n = g("an").value.trim(),
    a = parseInt(g("aa").value),
    r = g("ar").value.trim(),
    e = "";
  if (!n || !(a >= 0 && a <= 120) || isNaN(a) || !r) e = "Name, valid age and room are required.";
  else if (stats().act >= CAP()) e = "Centre is at full capacity (" + CAP() + " beds).";
  else if (
    S.p.some(function (p) {
      return (p.st == "in" || p.st == "appr") && p.room == r;
    })
  )
    e = "Room " + esc(r) + " is already occupied.";
  if (e) {
    g("am").innerHTML = '<div class="msg er">' + e + "</div>";
    return;
  }
  S.p.push({ id: Date.now(), name: n, age: a, room: r, st: "in", r: [] });
  sv(K, S);
  toast("Admitted " + n);
  render();
}
function fd(t) {
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
function ft(t) {
  return new Date(t).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function vp(t, bad) {
  return '<span class="pill ' + (bad ? "er" : "ok") + '">' + t + "</span> ";
}
function ch(R, ti, ser, lo, hi, th) {
  var t0 = R.length ? R[0].t : 0,
    t1 = R.length ? R[R.length - 1].t : 1,
    X = function (t) {
      return t1 == t0 ? 160 : 28 + ((t - t0) / (t1 - t0)) * 258;
    },
    Y = function (v) {
      return +(105 - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * 95).toFixed(1);
    },
    s =
      '<div class="card" style="margin:0"><b>' +
      ti +
      '</b><svg viewBox="0 0 300 130" style="width:100%;display:block">';
  [lo, (lo + hi) / 2, hi].forEach(function (v) {
    s +=
      '<line x1="28" x2="292" y1="' +
      Y(v) +
      '" y2="' +
      Y(v) +
      '" stroke="var(--bd)"/><text x="24" y="' +
      (Y(v) + 3) +
      '" font-size="9" text-anchor="end" fill="var(--mu)">' +
      Math.round(v * 10) / 10 +
      "</text>";
  });
  if (th != null)
    s +=
      '<line x1="28" x2="292" y1="' +
      Y(th) +
      '" y2="' +
      Y(th) +
      '" stroke="var(--er)" stroke-dasharray="4 3"/>';
  ser.forEach(function (e) {
    var pt = R.filter(function (r) {
      return r[e.k] != null;
    });
    if (!pt.length) return;
    s +=
      '<polyline fill="none" stroke="' +
      e.c +
      '" stroke-width="2" points="' +
      pt
        .map(function (r) {
          return X(r.t).toFixed(1) + "," + Y(r[e.k]);
        })
        .join(" ") +
      '"/>';
    pt.forEach(function (r) {
      s +=
        '<circle cx="' +
        X(r.t).toFixed(1) +
        '" cy="' +
        Y(r[e.k]) +
        '" r="2.6" fill="' +
        e.c +
        '"><title>' +
        e.n +
        " " +
        r[e.k] +
        " - " +
        ft(r.t) +
        "</title></circle>";
    });
  });
  s +=
    '<text x="28" y="125" font-size="9" fill="var(--mu)">' +
    (R.length ? fd(t0) : "") +
    '</text><text x="292" y="125" font-size="9" text-anchor="end" fill="var(--mu)">' +
    (R.length ? fd(t1) : "") +
    '</text></svg><div class="mu">' +
    ser
      .map(function (e) {
        return '<span style="color:' + e.c + '">&#9679; ' + e.n + "</span> ";
      })
      .join("") +
    "</div></div>";
  return s;
}
function patientV() {
  var p = S.p.filter(function (x) {
    return x.id == PV;
  })[0];
  if (!p) {
    PV = 0;
    return "";
  }
  var R = p.r,
    L = R.length ? R[R.length - 1] : null,
    i = info(p),
    pl = "";
  if (L)
    pl =
      pillT(L.v) +
      " " +
      (L.o2 != null ? vp("SpO2 " + L.o2 + "%", L.o2 < 94) : "") +
      (L.hr != null ? vp("Pulse " + L.hr, L.hr > 120 || L.hr < 45) : "") +
      (L.sb != null ? vp("BP " + L.sb + "/" + L.db, L.sb > 160 || L.sb < 90) : "") +
      (L.rr != null ? vp("RR " + L.rr, L.rr > 24 || L.rr < 10) : "") +
      '<span class="mu"> as of ' +
      ft(L.t) +
      "</span>";
  var h =
    '<div class="row2" style="margin:0 0 8px"><button class="b s" onclick="PV=0;render()">&larr; Back</button></div><div class="card"><div class="row"><div><b style="font-size:17px">' +
    esc(p.name) +
    '</b> <span class="mu">' +
    p.age +
    "y · Room " +
    esc(p.room) +
    " · " +
    { in: "Admitted", appr: "Discharge approved", out: "Discharged", dead: "Deceased" }[p.st] +
    " · " +
    R.length +
    " readings</span></div>" +
    (i.elig
      ? '<span class="pill ok">Fever-free 3+ days</span>'
      : i.fd
        ? '<span class="pill er">Fever ' + i.fd + " day" + (i.fd > 1 ? "s" : "") + "</span>"
        : '<span class="pill wa">Monitoring</span>') +
    '</div><div style="margin-top:8px">' +
    (pl || '<span class="mu">No readings yet.</span>') +
    "</div></div>";
  if (!R.length) return h;
  h +=
    '<div class="cg">' +
    ch(
      R,
      "Temperature (°C) - red line: fever 38",
      [{ k: "v", c: "#ef4444", n: "Temp" }],
      35,
      41,
      38,
    ) +
    ch(R, "SpO2 (%) - red line: 94", [{ k: "o2", c: "#0ea5e9", n: "SpO2" }], 85, 100, 94) +
    ch(R, "Pulse (beats/min)", [{ k: "hr", c: "#8b5cf6", n: "Pulse" }], 40, 140, null) +
    ch(
      R,
      "Blood pressure (mmHg)",
      [
        { k: "sb", c: "#f97316", n: "Systolic" },
        { k: "db", c: "#14b8a6", n: "Diastolic" },
      ],
      50,
      180,
      null,
    ) +
    ch(
      R,
      "Respiratory rate (/min) - red line: 24",
      [{ k: "rr", c: "#22c55e", n: "RR" }],
      8,
      40,
      24,
    ) +
    "</div><h2>Previous readings</h2>";
  var x = function (v) {
    return v == null ? "–" : v;
  };
  h +=
    '<div class="card tw"><table><tr><th>Date &amp; time</th><th>Temp °C</th><th>SpO2 %</th><th>Pulse</th><th>BP</th><th>RR</th><th>Note</th></tr>' +
    R.slice()
      .reverse()
      .map(function (r) {
        return (
          "<tr><td>" +
          ft(r.t) +
          '</td><td class="' +
          (r.v >= FEV ? "er-t" : "") +
          '">' +
          r.v.toFixed(1) +
          '</td><td class="' +
          (r.o2 != null && r.o2 < 94 ? "er-t" : "") +
          '">' +
          x(r.o2) +
          "</td><td>" +
          x(r.hr) +
          "</td><td>" +
          (r.sb == null ? "–" : r.sb + "/" + r.db) +
          "</td><td>" +
          x(r.rr) +
          "</td><td>" +
          esc(r.note || "") +
          "</td></tr>"
        );
      })
      .join("") +
    "</table></div>";
  return h;
}
