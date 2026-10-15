/**
 * CareTrack - shared configuration, helpers and hospital data (4 floors, 36 rooms, 74 beds).
 */
var K = "ct_pat_v3",
  KR = "ct_rooms_v2",
  KU = "ct_user",
  FEV = 38,
  TAB = "",
  U = null,
  openId = null,
  CUT = 0,
  PV = 0;
var FL = ["Ground floor", "Floor 1", "Floor 2", "Floor 3"];
var TY = {
  opd: "OPD",
  cabin: "Doctor cabin",
  nurse: "Nurse station",
  ward: "Ward",
  icu: "ICU",
  pharmacy: "Pharmacy",
  emergency: "Emergency",
  other: "Other",
};
var USERS = [
  { e: "nurse@caretrack.in", p: "nurse123", r: "nurse", n: "Nurse Asha Pillai" },
  { e: "doctor@caretrack.in", p: "doctor123", r: "doctor", n: "Dr. Anand Kale" },
  { e: "amruta@caretrack.in", p: "admin123", r: "admin", n: "Amruta Gavade" },
];
var TABS = {
  nurse: ["Rounds", "Map"],
  doctor: ["Patients", "Map"],
  admin: ["Dashboard", "Map"],
  visitor: ["Map"],
};
var g = function (i) {
  return document.getElementById(i);
};
function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}
function ld(k, f) {
  try {
    var s = localStorage.getItem(k);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return f();
}
function sv(k, v) {
  try {
    localStorage.setItem(k, typeof v == "string" ? v : JSON.stringify(v));
  } catch (e) {}
}
function toast(m) {
  var t = g("toast");
  t.textContent = m;
  t.style.display = "block";
  setTimeout(function () {
    t.style.display = "none";
  }, 2600);
}
/* ---------- hospital data: 4 floors, 36 rooms, 74 patient beds ---------- */
var RAW = [
  "0N|Emergency Room|emergency|Emergency|Dr. Rahul Verma|Nurse Pooja Nair|24|0",
  "0N|Trauma Bay|emergency|Emergency|Dr. Neha Kulkarni|Nurse Sunita Rao|16|0",
  "0N|Pharmacy|pharmacy|Pharmacy|Mr. Anil Joshi||16|0",
  "0N|Registration|other|Administration||Ms. Kavita Shah|14|0",
  "0S|OPD 1 General Medicine|opd|General Medicine|Dr. Sameer Desai|Nurse Asha Pillai|18|0",
  "0S|OPD 2 Paediatrics|opd|Paediatrics|Dr. Ritu Menon|Nurse Lata Patil|18|0",
  "0S|OPD 3 Orthopaedics|opd|Orthopaedics|Dr. Vivek Rao|Nurse Meena Das|18|0",
  "0S|Nurse Station G|nurse|Nursing||Nurse Asha Pillai|14|0",
  "0S|Lab & X-Ray|other|Diagnostics|Dr. Isha Gupta||16|0",
  "1N|General Ward A|ward|Medicine|Dr. Sameer Desai|Nurse Kiran More|22|10",
  "1N|General Ward B|ward|Medicine|Dr. Ritu Menon|Nurse Lata Patil|22|10",
  "1N|Nurse Station 1|nurse|Nursing||Nurse Kiran More|14|0",
  "1N|Dr Cabin 101|cabin|Medicine|Dr. Sameer Desai||12|0",
  "1N|Dr Cabin 102|cabin|Paediatrics|Dr. Ritu Menon||12|0",
  "1S|Isolation Ward 1|ward|Infectious Disease|Dr. Anand Kale|Nurse Divya Iyer|18|4",
  "1S|Isolation Ward 2|ward|Infectious Disease|Dr. Anand Kale|Nurse Divya Iyer|18|4",
  "1S|Isolation Ward 3|ward|Infectious Disease|Dr. Anand Kale|Nurse Divya Iyer|18|4",
  "1S|Fever Clinic|opd|Infectious Disease|Dr. Anand Kale|Nurse Divya Iyer|16|0",
  "2N|ICU 1|icu|Critical Care|Dr. Meera Bhat|Nurse Rohini Jain|26|6",
  "2N|ICU 2|icu|Critical Care|Dr. Meera Bhat|Nurse Rohini Jain|26|6",
  "2N|ICU Nurse Station|nurse|Critical Care||Nurse Rohini Jain|14|0",
  "2N|Dr Cabin 201|cabin|Critical Care|Dr. Meera Bhat||12|0",
  "2S|Isolation Ward 4|ward|Infectious Disease|Dr. Anand Kale|Nurse Divya Iyer|18|4",
  "2S|Ward C|ward|Medicine|Dr. Sameer Desai|Nurse Kiran More|22|8",
  "2S|Ward D|ward|Medicine|Dr. Ritu Menon|Nurse Lata Patil|22|8",
  "2S|Dr Cabin 202|cabin|Infectious Disease|Dr. Anand Kale||12|0",
  "2S|Nurse Station 2|nurse|Nursing||Nurse Divya Iyer|14|0",
  "3N|Recovery Ward|ward|Recovery|Dr. Anand Kale|Nurse Divya Iyer|30|10",
  "3N|Discharge Desk|other|Administration||Ms. Kavita Shah|14|0",
  "3N|Admin Office|other|Administration||Ms. Kavita Shah|16|0",
  "3N|Head Doctor Cabin|cabin|Administration|Dr. Prakash Nene||14|0",
  "3N|Dr Cabin 301|cabin|Medicine|Dr. Sameer Desai||12|0",
  "3S|Dr Cabin 302|cabin|Paediatrics|Dr. Ritu Menon||12|0",
  "3S|Nurse Station 3|nurse|Nursing||Nurse Kiran More|14|0",
  "3S|Staff Room|other|Staff|||18|0",
  "3S|Records Room|other|Administration|||16|0",
];
function seedRooms() {
  return RAW.map(function (l, i) {
    var a = l.split("|");
    return {
      id: "r" + (i + 1),
      f: +a[0][0],
      s: a[0][1],
      n: a[1],
      t: a[2],
      d: a[3],
      dr: a[4],
      nu: a[5],
      w: +a[6],
      b: +a[7],
    };
  });
}
var RM = ld(KR, seedRooms);
function pack() {
  var x = {};
  RM.forEach(function (r) {
    var k = r.f + r.s;
    x[k] = x[k] || 10;
    r.x = x[k];
    x[k] += r.w;
    r.y = r.s == "N" ? 5 : 35;
  });
}
pack();
function by(id) {
  return RM.filter(function (r) {
    return r.id == id;
  })[0];
}
function CAP() {
  return RM.reduce(function (a, r) {
    return a + r.b;
  }, 0);
}
