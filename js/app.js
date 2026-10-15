/**
 * CareTrack - login, role-based tabs and app start-up. Loaded last.
 */
/* ---------- login, roles, shell ---------- */
function loginV() {
  return (
    '<div class="login"><div class="card"><h1>🌡️ CareTrack</h1><div class="mu">Quarantine &amp; Treatment Centre</div><label>Email<input id="le" type="email" autocomplete="username"></label><label>Password<input id="lp" type="password" autocomplete="current-password" onkeydown="if(event.key==\'Enter\')login()"></label><div id="lm"></div><div class="row2"><button class="b" onclick="login()">Login</button><button class="b s" onclick="visitor()">Visitor (map only)</button></div><div class="mu" style="margin-top:12px">Demo accounts – click to fill:</div><div class="chips">' +
    USERS.map(function (u, i) {
      return '<button class="chip" onclick="fillU(' + i + ')">' + u.r + "</button>";
    }).join("") +
    "</div></div></div>"
  );
}
function fillU(i) {
  g("le").value = USERS[i].e;
  g("lp").value = USERS[i].p;
}
function login() {
  var e = g("le").value.trim().toLowerCase(),
    p = g("lp").value,
    u = USERS.filter(function (x) {
      return x.e == e && x.p == p;
    })[0];
  if (!u) {
    g("lm").innerHTML = '<div class="msg er">Wrong email or password.</div>';
    return;
  }
  U = u;
  sv(KU, u.e);
  TAB = "";
  render();
}
function visitor() {
  U = { r: "visitor", n: "Visitor" };
  sv(KU, "visitor");
  TAB = "";
  render();
}
function logout() {
  U = null;
  PV = 0;
  try {
    localStorage.removeItem(KU);
  } catch (e) {}
  render();
}
function render() {
  var a = g("root");
  if (!U) {
    a.innerHTML = loginV();
    return;
  }
  var tabs = TABS[U.r];
  if (tabs.indexOf(TAB) < 0) TAB = tabs[0];
  var v =
    PV && U.r != "visitor"
      ? patientV()
      : TAB == "Map"
        ? mapV()
        : TAB == "Rounds"
          ? nurseV()
          : TAB == "Patients"
            ? doctorV()
            : adminV();
  a.innerHTML =
    '<header><div class="row"><h1>🌡️ CareTrack</h1><div><span class="mu">' +
    esc(U.n) +
    '</span> <span class="pill ok">' +
    U.r +
    '</span> <button class="b s" onclick="logout()">' +
    (U.r == "visitor" ? "Login" : "Logout") +
    "</button></div></div><nav>" +
    tabs
      .map(function (t) {
        return (
          '<button class="' +
          (TAB == t ? "on" : "") +
          '" onclick="TAB=\'' +
          t +
          "';PV=0;openId=null;render()\">" +
          t +
          "</button>"
        );
      })
      .join("") +
    '</nav></header><main class="' +
    (TAB == "Map" || PV ? "wide" : "") +
    '">' +
    v +
    "</main>";
  if (TAB == "Map") res();
}
(function () {
  var u = ld(KU, function () {
    return "";
  });
  if (u == "visitor") U = { r: "visitor", n: "Visitor" };
  else
    U =
      USERS.filter(function (x) {
        return x.e == u;
      })[0] || null;
  render();
})();
