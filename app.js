/* Latihan TKA TJKT — frontend. Semua soal, penilaian, riwayat, dan laporan berasal dari backend Apps Script.
   Tidak ada kunci jawaban di file ini. */
(() => {
"use strict";

const subjects = [
  "IoT dan Teknologi Telekomunikasi", "Jaringan Komputer dan Konfigurasi", "K3LH dan Budaya Kerja",
  "Keamanan Siber dan Jaringan", "Media Optik", "Media Seluler", "Media Satelit", "Media Tembaga",
  "Profesi dan Dunia Kerja TJKT", "Sistem Operasi, Server, dan Cloud"
];
const icons = [
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 9.8a5 5 0 0 1 7 0M5.5 6.8a9 9 0 0 1 13 0"/><circle cx="12" cy="13" r="1.4"/><rect x="8.5" y="16.5" width="7" height="4.5" rx="1.2"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2.3"/><circle cx="5" cy="19" r="2.3"/><circle cx="19" cy="19" r="2.3"/><path d="M12 7.3v4.2M12 11.5 6.2 17M12 11.5l5.8 5.5"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 16a7.5 7.5 0 0 1 15 0"/><path d="M3 16h18v2.8H3z"/><path d="M12 8.5V13M9.2 9.2 9.6 13M14.8 9.2 14.4 13"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.8 6v5.4c0 4.4 3.1 7.9 7.2 9.6 4.1-1.7 7.2-5.2 7.2-9.600V6z"/><rect x="9.2" y="10.8" width="5.6" height="4.4" rx="1"/><path d="M10.5 10.8V9.6a1.5 1.5 0 0 1 3 0v1.2"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11.5V21M8.8 21h6.4M9.2 21 12 12l2.8 9"/><circle cx="12" cy="9" r="1.5"/><path d="M8.3 6a5.5 5.5 0 0 0 0 6M15.7 6a5.5 5.5 0 0 1 0 6M5.6 4a9.5 9.5 0 0 0 0 10M18.4 4a9.5 9.5 0 0 1 0 10"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-45 12 12)"><rect x="9.8" y="8.5" width="4.4" height="7" rx="1"/><rect x="2.5" y="9" width="5.5" height="6" rx=".8"/><rect x="16" y="9" width="5.5" height="6" rx=".8"/><path d="M8 12h1.8M14.200 12H16M12 15.5v2.5"/></g><path d="M16.5 19.5a4 4 0 0 0 3-3" /></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="8" width="15" height="11.5" rx="1.5"/><path d="M9 8V4.500h6V8M8.5 19.500V15.500M11 19.500V15.500M13 19.500V15.500M15.5 19.500V15.5"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M5 20.500a7 7 0 0 1 14 0"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17.500a4 4 0 0 1-.5-7.9 5.5 5.5 0 0 1 10.7 1.300A3.3 3.3 0 0 1 17 17.500z"/><path d="M9.5 20.500h5M12 17.500v3"/></svg>`
];   // satu logo (SVG) per materi, urutannya sama dengan daftar subjects
const names = {
  home: "Beranda", subjects: "Soal per Subjek", materi: "Materi", simulation: "Simulasi TKA",
  report: "Laporan Nilai", import: "Impor Siswa", quiz: "Sesi Latihan", result: "Hasil Latihan"
};
const PRACTICE = { count: 20, minutes: 30, minSub: 5 }, SIM = { count: 25, minutes: 50 };   // minSub = batas minimal soal agar submateri bisa dipilih (sama dengan MIN_SUBTOPIC_COUNT di Code.gs)
const $ = s => document.querySelector(s);
const cfg = window.TKA_CONFIG || { apiUrl: "" };
const materi = window.TKA_MATERI || [];

let user = null, page = "home", attempt = null, history = [], pending = null, result = null, timer = null, board = null;
let report = null, reportFilter = { kelas: "", jenis: "" }, reviewFilter = "wrong";

/* ---------- util ---------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function toast(s) {
  const e = $("#toast");
  e.textContent = s; e.classList.remove("hidden");
  clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.add("hidden"), 3500);
}
function fmtDate(v) { const d = new Date(v); return isNaN(d) ? String(v || "") : d.toLocaleDateString("id-ID"); }
function fmt(n) { return String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0"); }
function getStorage() {
  try {
    const k = "__tka_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return localStorage;
  } catch {
    return sessionStorage;
  }
}
const storage = getStorage();
function store(key, val) {
  try {
    if (val == null) {
      storage.removeItem(key);
      try { sessionStorage.removeItem(key); } catch {}
    } else {
      const s = JSON.stringify(val);
      storage.setItem(key, s);
      try { sessionStorage.setItem(key, s); } catch {}
    }
  } catch {}
}
function load(key) {
  try {
    const v = storage.getItem(key);
    if (v != null) return JSON.parse(v);
    return JSON.parse(sessionStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function historyKey() {
  const id = user ? (user.nis || user.username || "siswa") : "siswa";
  return "tka_hist_" + String(id).toLowerCase();
}
function saveHistory() {
  if (user) {
    store(historyKey(), history);
  }
}
function loadHistory() {
  if (user) {
    const saved = load(historyKey());
    if (Array.isArray(saved) && saved.length) {
      history = saved;
    }
  }
}
function mergeHistory(serverList) {
  if (!Array.isArray(serverList)) return;
  const map = new Map();
  serverList.forEach(x => {
    if (!x) return;
    const k = String(x.attempt_id || (x.subjek + "_" + x.tanggal));
    map.set(k, {
      attempt_id: x.attempt_id || "",
      jenis: x.jenis || "latihan",
      subjek: x.subjek || "",
      sub_subjek: x.sub_subjek || "",
      jumlah_benar: x.jumlah_benar != null ? Number(x.jumlah_benar) : 0,
      jumlah_soal: x.jumlah_soal != null ? Number(x.jumlah_soal) : 0,
      nilai: x.nilai != null ? Number(x.nilai) : 0,
      tanggal: x.tanggal || new Date().toISOString()
    });
  });
  (history || []).forEach(x => {
    if (!x) return;
    const k = String(x.attempt_id || (x.subjek + "_" + x.tanggal));
    if (!map.has(k)) {
      map.set(k, x);
    }
  });
  history = Array.from(map.values()).sort((a, b) => new Date(b.tanggal || 0).getTime() - new Date(a.tanggal || 0).getTime());
  saveHistory();
  if (page === "home" || page === "result") render();
}

let syncingHistory = false;
function syncHistory() {
  if (!user || !user.token || !cfg.apiUrl || syncingHistory) return Promise.resolve(history);
  syncingHistory = true;
  return api("getHistory")
    .then(d => {
      if (Array.isArray(d?.history)) mergeHistory(d.history);
      return history;
    })
    .catch(() => {
      return api("getDashboard")
        .then(d => {
          if (Array.isArray(d?.history)) mergeHistory(d.history);
          if (d?.leaderboard && Array.isArray(d.leaderboard.rows)) {
            board = d.leaderboard;
            if (page === "home") render();
          }
          return history;
        })
        .catch(() => history);
    })
    .finally(() => { syncingHistory = false; });
}
const avgOf = rows => rows.length ? Math.round(rows.reduce((s, x) => s + Number(x.nilai || 0), 0) / rows.length) : "—";

/* ---------- API ---------- */
function api(action, payload = {}) {
  if (!cfg.apiUrl) return Promise.reject(Error("Backend belum dikonfigurasi."));
  return fetch(cfg.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, token: user?.token, ...payload })
  })
    .then(r => { if (!r.ok) throw Error("Server tidak merespons (HTTP " + r.status + ")."); return r.json(); })
    .then(r => {
      if (!r.ok) {
        const msg = typeof r.error === "string" ? r.error : r.error?.message || "Permintaan gagal.";
        if (action !== "login" && /^Sesi/i.test(msg)) forceLogout(msg);
        throw Error(msg);
      }
      if (action === "login") {
        if (!r.user || !r.token) throw Error("Respons login dari backend tidak lengkap.");
        return { ...r.user, token: r.token, wajib_ganti_password: false, history: r.history || [], leaderboard: r.leaderboard || null };
      }
      return r;
    });
}

/* ---------- sesi & navigasi ---------- */
function showLogin(msg) {
  $("#login").classList.remove("hidden");
  const err = $("#loginerr");
  if (msg) { err.textContent = msg; err.classList.remove("hidden"); } else err.classList.add("hidden");
}
function clearSession() {
  clearInterval(timer); attempt = null; user = null; history = []; report = null; result = null;
  store("tka_user", null); store("tka_attempt", null);
}
function forceLogout(msg) { clearSession(); showLogin(msg); }

function go(p) {
  if (false) {
    page = "home"; toast("Ganti password di Beranda terlebih dahulu."); render(); return;
  }
  page = p;
  $("#crumb").textContent = names[p] || p;
  document.querySelectorAll(".nav").forEach(b => b.classList.toggle("active", b.dataset.page === p));
  $("#sidebar").classList.remove("open");
  if (p === "report") loadReport();
  if (p === "home" && user) syncHistory();
  render();
}

function login(u) {
  const { history: h, leaderboard: lb, ...rest } = u;   // riwayat dan papan nilai ikut dalam respons login; tidak perlu permintaan tambahan
  user = { ...rest, wajib_ganti_password: false };
  store("tka_user", user);
  loadHistory();
  if (Array.isArray(h) && h.length) {
    mergeHistory(h);
  }
  board = lb && Array.isArray(lb.rows) ? lb : board;
  $("#login").classList.add("hidden");
  const displayName = user.nama || user.username || (user.role === "guru" ? "Guru" : "Siswa");
  $("#username").textContent = displayName;
  const roleText = user.role === "guru" ? "Guru / Administrator" : "Peserta latihan";
  const userTag = user.username && user.nama && user.username !== user.nama ? ` • @${user.username}` : "";
  $("#role").textContent = roleText + userTag;
  $("#avatar").textContent = (displayName || "S")[0].toUpperCase();
  document.querySelectorAll(".teacher").forEach(x => x.classList.toggle("hidden", user.role !== "guru"));
  go("home");
  restoreAttempt();
  syncHistory();
}

/* ---------- halaman ---------- */
function boardPanel() {
  const rows = board ? board.rows.slice().sort((x, y) => (y.nilai_tertinggi ?? -1) - (x.nilai_tertinggi ?? -1) || String(x.kelas).localeCompare(String(y.kelas))) : [];
  const upd = board && board.diperbarui ? new Date(board.diperbarui) : null;
  const when = upd && !isNaN(upd) ? upd.toLocaleString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) + " WIB" : "";
  const body = rows.length ? rows.map((r, i) => {
    const has = r.nilai_tertinggi !== null && r.nilai_tertinggi !== undefined, mine = user && r.kelas === user.kelas;
    return `<div class="boardrow ${mine ? "mine" : ""}"><span class="boardrank">${has ? i + 1 : "–"}</span><div class="boardmain"><div class="boardline"><b>${esc(r.kelas)}${mine ? " <em>kelasmu</em>" : ""}</b><strong>${has ? esc(r.nilai_tertinggi) : "—"}</strong></div><div class="boardbar"><span style="width:${has ? Math.max(2, Math.min(100, r.nilai_tertinggi)) : 0}%"></span></div>${has ? `<small>${r.jenis === "simulasi" ? "Simulasi TKA" : "Latihan subjek"}</small>` : `<small>Belum ada nilai</small>`}</div></div>`;
  }).join("") : `<p class="muted">Papan nilai belum tersedia. Akan muncul setelah diperbarui pukul 07.00 WIB.</p>`;
  return `<div class="sectionhead" style="margin-top:25px"><h2>Nilai tertinggi per kelas</h2><span class="muted boardwhen">Diperbarui setiap pukul 07.00 WIB${when ? " · terakhir " + esc(when) : ""}</span></div><div class="panel board">${body}</div>`;
}

function home() {
  const isGuru = user.role === "guru";
  const pw = "";
  const lastRev = load("tka_last_review");
  const tiles = subjects.slice(0, 6).map((s, i) => {
    const last = history.find(x => x.jenis === "latihan" && x.subjek === s);
    return `<button class="tile" data-subject="${esc(s)}"><span class="symbol">${icons[i]}</span><span><strong>${esc(s)}</strong><small>${last ? `Nilai terakhir: ${esc(last.nilai)} • ${esc(fmtDate(last.tanggal))}` : "Belum pernah dicoba"}</small></span></button>`;
  }).join("");
  const acts = history.length ? history.slice(0, 4).map(x => `<div class="activity"><span class="symbol">✓</span><div><b>${esc(x.jenis === "simulasi" ? "Simulasi TKA" : x.subjek)}</b><small>${esc(fmtDate(x.tanggal))} • ${esc(x.jumlah_soal)} soal</small></div><strong>${esc(x.nilai)}</strong></div>`).join("")
    : `<p class="muted">Belum ada aktivitas. Mulai latihan untuk melihat progresmu di sini.</p>`;
  const displayName = user.nama || user.username || (isGuru ? "Guru" : "Siswa");
  return `${pw}<div class="welcome"><div><p class="eyebrow">RUANG LATIHAN TKA</p><h1>Halo, ${esc(displayName)}! 👋</h1><p>Persiapkan diri menghadapi Tes Kompetensi Akademik dengan berlatih secara terarah. Pilih subjek, kerjakan soal, dan evaluasi hasil belajarmu.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button data-go="subjects">Mulai latihan　→</button>${lastRev ? `<button class="secondary" id="open-last-review">Pembahasan Terakhir ↗</button>` : ""}${isGuru ? `<button class="secondary" data-go="report">Lihat laporan nilai　→</button>` : ""}</div></div><div class="welcomeart">▤</div></div>
<div class="stats"><div class="stat"><span>Total latihan</span><strong>${history.length}</strong><small>Tersimpan di server</small></div><div class="stat"><span>Nilai rata-rata</span><strong>${avgOf(history)}</strong><small>Seluruh sesi</small></div><div class="stat"><span>Subjek tersedia</span><strong>${subjects.length}</strong><small>Bidang kompetensi TJKT</small></div><div class="stat"><span>Durasi simulasi</span><strong>${SIM.minutes} <small>menit</small></strong><small>${SIM.count} soal</small></div></div>
<div class="sectionhead"><h2>Jelajahi subjek</h2><button class="link" data-go="subjects">Lihat semua →</button></div>
<div class="dashgrid"><div class="panel"><div class="tiles">${tiles}</div></div><div class="panel"><div class="sectionhead"><h2>Aktivitas terbaru</h2>${lastRev ? `<button class="link" id="act-last-review" style="font-size:11px">Review terakhir →</button>` : ""}</div>${acts}</div></div>${boardPanel()}`;
}

function topicsOf(subject) { return materi.filter(m => m.subjek === subject); }

function subjectPage() {
  const cards = subjects.map((s, i) =>
    `<article class="subjectcard simple"><span class="symbol big">${icons[i]}</span><h3>${esc(s)}</h3><button class="primary" data-subject="${esc(s)}" data-idx="${i}">Mulai →</button></article>`
  ).join("");
  return `<div class="pagehead"><div><h1>Soal per Subjek</h1></div></div><div class="subjectgrid">${cards}</div>`;
}

/* ---------- Materi (bacaan) ----------
   Isi halaman ada di materi/fragment.html, materi/materi.css, dan materi/materi.js. Berkas dimuat saat menu Materi pertama kali dibuka. */
const MATERI_BASE = "materi/";
let materiAssets = null, materiHtml = null;
function loadMateriAssets() {
  if (materiAssets) return materiAssets;
  const css = f => new Promise((ok, no) => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = MATERI_BASE + f; l.onload = ok; l.onerror = () => no(Error("Gagal memuat " + f)); document.head.appendChild(l); });
  const js = f => new Promise((ok, no) => { const e = document.createElement("script"); e.src = MATERI_BASE + f; e.onload = ok; e.onerror = () => no(Error("Gagal memuat " + f)); document.head.appendChild(e); });
  materiAssets = Promise.all([css("materi.css"), js("materi.js")])
    .then(() => fetch(MATERI_BASE + "fragment.html").then(r => { if (!r.ok) throw Error("Gagal memuat isi materi (HTTP " + r.status + ")."); return r.text(); }))
    .then(t => { materiHtml = t; });
  materiAssets.catch(() => { materiAssets = null; });   // boleh dicoba lagi bila gagal
  return materiAssets;
}
function materiPage() { return `<div id="materihost" class="muted">Memuat materi…</div>`; }
function mountMateri() {
  loadMateriAssets().then(() => {
    const host = $("#materihost");
    if (!host || page !== "materi") return;          // pengguna sudah pindah halaman
    host.outerHTML = materiHtml;
    window.MP_mountAll($("#materi-profesi"), { base: MATERI_BASE, hash: false });
  }).catch(e => { const h = $("#materihost"); if (h) h.textContent = e.message + " Muat ulang halaman untuk mencoba lagi."; });
}

function simulation() {
  return `<div class="pagehead"><div><p class="eyebrow">UJI KESIAPAN</p><h1>Simulasi TKA</h1><p>Biasakan diri mengerjakan tes dalam waktu terbatas.</p></div></div><div class="simbanner"><div><p class="eyebrow">SIMULASI MENYELURUH</p><h2>Uji kesiapanmu dalam satu sesi</h2><p>Kerjakan soal secara mandiri, atur waktu dengan baik, dan periksa jawaban sebelum menyelesaikan sesi. Soal dipilih acak dari seluruh subjek.</p><button class="primary" id="startsim">Mulai simulasi →</button></div><div class="simicon">◷</div></div><div class="rules"><div><strong>${SIM.count} soal</strong><span>Jumlah soal simulasi</span></div><div><strong>${SIM.minutes} menit</strong><span>Batas waktu</span></div><div><strong>1 sesi</strong><span>Tidak dapat dilanjutkan setelah selesai</span></div></div><div class="panel" style="margin-top:17px"><b>Petunjuk pengerjaan</b><p class="muted">1. Baca soal dengan cermat.<br>2. Perhatikan jenis soal: satu jawaban, beberapa jawaban, atau Benar/Salah per pernyataan.<br>3. Gunakan navigasi nomor soal.<br>4. Sesi berakhir saat menekan Selesai atau waktu habis.<br>5. Nilai dihitung server dan tersimpan di database.</p></div>`;
}

function reportPage() {
  if (user.role !== "guru") return `<p class="muted">Halaman hanya dapat diakses guru.</p>`;
  const r = report;
  const kelasOpts = [`<option value="">Semua kelas</option>`].concat((r?.kelas_tersedia || []).map(k => `<option ${k === reportFilter.kelas ? "selected" : ""}>${esc(k)}</option>`)).join("");
  const filters = `<div class="filters"><select id="fkelas" class="subselect" style="width:auto">${kelasOpts}</select><select id="fjenis" class="subselect" style="width:auto"><option value="">Semua jenis</option><option value="latihan" ${reportFilter.jenis === "latihan" ? "selected" : ""}>Latihan</option><option value="simulasi" ${reportFilter.jenis === "simulasi" ? "selected" : ""}>Simulasi</option></select><button class="primary" id="fapply">Terapkan</button></div>`;
  const head = `<div class="pagehead"><div><p class="eyebrow">MONITORING</p><h1>Laporan Nilai</h1><p>Hasil percobaan siswa dari database.</p></div></div>${filters}`;
  if (!r) return head + `<p class="muted">Memuat laporan…</p>`;
  const kelasRows = (r.per_kelas || []).map(k => `<tr><td>${esc(k.kelas)}</td><td>${k.jumlah_percobaan}</td><td>${k.rata_rata}</td><td>${k.nilai_tertinggi}</td></tr>`).join("");
  const rows = (r.nilai_terbaru || []).map((x, i) => {
    const userLabel = x.nama || x.username || (x.nis ? 'NIS ' + x.nis : '—');
    const userSub = (x.username || x.nis) && (x.username || x.nis) !== x.nama ? (x.username ? `@${x.username}` : `NIS: ${x.nis}`) : '';
    return `<tr><td>${i + 1}</td><td><b>${esc(userLabel)}</b>${userSub ? `<br><small class="muted">${esc(userSub)}</small>` : ''}</td><td>${esc(x.kelas)}</td><td>${x.jenis === "simulasi" ? "Simulasi" : "Latihan"}</td><td>${esc(x.jenis === "simulasi" ? "Semua subjek" : x.subjek)}</td><td>${esc(x.jumlah_benar)}/${esc(x.jumlah_soal)}</td><td><span class="score">${esc(x.nilai)}</span></td><td>${esc(fmtDate(x.tanggal))}</td></tr>`;
  }).join("");
  return `${head}<div class="stats"><div class="stat"><span>Jumlah percobaan</span><strong>${r.total_percobaan}</strong></div><div class="stat"><span>Nilai rata-rata</span><strong>${r.rata_rata}</strong></div><div class="stat"><span>Nilai tertinggi</span><strong>${r.nilai_tertinggi}</strong></div><div class="stat"><span>Sumber data</span><strong style="font-size:16px">Database</strong></div></div>
<div class="sectionhead"><h2>Ringkasan per kelas</h2></div><div class="tablewrap" style="margin-bottom:20px"><table><thead><tr><th>KELAS</th><th>PERCOBAAN</th><th>RATA-RATA</th><th>TERTINGGI</th></tr></thead><tbody>${kelasRows || `<tr><td colspan="4">Belum ada data.</td></tr>`}</tbody></table></div>
<div class="sectionhead"><h2>100 nilai terbaru</h2></div><div class="tablewrap"><table><thead><tr><th>NO</th><th>NAMA / USER</th><th>KELAS</th><th>JENIS</th><th>SUBJEK</th><th>BENAR</th><th>NILAI</th><th>TANGGAL</th></tr></thead><tbody>${rows || `<tr><td colspan="8">Belum ada data.</td></tr>`}</tbody></table></div>`;
}
function loadReport() {
  report = null;
  api("getReport", { kelas: reportFilter.kelas, jenis: reportFilter.jenis })
    .then(d => { report = d; if (page === "report") render(); })
    .catch(e => { toast(e.message); });
}

function importStudentsPage() {
  if (user.role !== "guru") return `<p class="muted">Halaman hanya dapat diakses guru.</p>`;
  return `<div class="pagehead"><div><p class="eyebrow">ADMINISTRASI AKUN</p><h1>Impor Siswa</h1><p>Unggah CSV daftar siswa. Password awal diproses backend menjadi hash sebelum disimpan.</p></div></div><div class="panel"><form id="importstudentsform"><label>File CSV siswa</label><input id="studentscsv" type="file" accept=".csv,text/csv" required><p class="muted">Kolom yang dikenali: KELAS, NIS, NAMA LENGKAP, USER, PASSWORD. Pemisah titik koma maupun koma dapat dibaca.</p><div class="notice"><b>Perlindungan data</b><p>File hanya dikirim ke Apps Script saat kamu menekan tombol impor. Jangan unggah CSV berisi password ke GitHub dan hapus file setelah impor.</p></div><button class="primary" id="importstudentsbutton" type="submit">Impor akun siswa</button></form><div id="importstudentsresult" class="muted" style="margin-top:16px"></div></div>`;
}

function parseCSV(text) {
  text = text.replace(/^\uFEFF/, "");
  const first = text.split(/\r?\n/, 1)[0] || "";
  const delim = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ";" : ",";
  const rows = []; let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted;
    } else if (c === delim && !quoted) { row.push(field); field = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); if (row.some(v => v.trim())) rows.push(row); row = []; field = "";
    } else field += c;
  }
  row.push(field); if (row.some(v => v.trim())) rows.push(row);
  if (rows.length < 2) throw Error("CSV tidak memiliki baris data.");
  const headers = rows.shift().map(h => h.trim().toUpperCase());
  const index = Object.fromEntries(headers.map((h, i) => [h, i]));
  const get = (r, ...keys) => { for (const k of keys) if (index[k] !== undefined) return String(r[index[k]] ?? "").trim(); return ""; };
  return rows.map(r => ({ nis: get(r, "NIS"), nama: get(r, "NAMA LENGKAP", "NAMA"), kelas: get(r, "KELAS"), username: get(r, "USER", "USERNAME"), password: get(r, "PASSWORD") }))
    .filter(r => r.nis && r.username && r.password);
}

/* ---------- sesi latihan ---------- */
let bankDataPromise = null;
function loadBankData() {
  if (bankDataPromise) return bankDataPromise;
  bankDataPromise = fetch("BankSoal-import.csv")
    .then(r => { if (!r.ok) throw Error("Gagal memuat bank soal."); return r.text(); })
    .then(t => {
      t = t.replace(/^\uFEFF/, "");
      const rows = []; let row = [], field = "", quoted = false;
      for (let i = 0; i < t.length; i++) {
        const c = t[i];
        if (c === '"') {
          if (quoted && t[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted;
        } else if (c === "," && !quoted) { row.push(field); field = ""; }
        else if ((c === "\n" || c === "\r") && !quoted) {
          if (c === "\r" && t[i + 1] === "\n") i++;
          row.push(field); if (row.some(v => v.trim())) rows.push(row); row = []; field = "";
        } else field += c;
      }
      row.push(field); if (row.some(v => v.trim())) rows.push(row);
      const headers = rows.shift().map(h => h.trim().toLowerCase());
      const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
      const get = (r, k) => idx[k] !== undefined ? String(r[idx[k]] ?? "").trim() : "";
      return rows.map(r => ({
        question_id: get(r, "question_id"),
        nomor_soal_asli: get(r, "nomor_soal_asli"),
        subjek: get(r, "subjek"),
        sub_subjek: get(r, "sub_subjek"),
        bentuk_soal: get(r, "bentuk_soal"),
        stimulus_isi_soal: get(r, "stimulus_isi_soal"),
        opsi_a: get(r, "opsi_a"),
        opsi_b: get(r, "opsi_b"),
        opsi_c: get(r, "opsi_c"),
        opsi_d: get(r, "opsi_d"),
        opsi_e: get(r, "opsi_e"),
        kunci: get(r, "kunci"),
        kunci_opsi: get(r, "kunci_opsi"),
        aktif: get(r, "aktif"),
        asal_data: get(r, "asal_data")
      })).filter(q => q.question_id && String(q.aktif).toUpperCase() === "TRUE");
    });
  return bankDataPromise;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function checkAnswer(answer, q) {
  const key = String(q.kunci_opsi || q.kunci || "").trim();
  if (!key) return false;
  const tipe = deriveType(q);
  const up = v => String(v == null ? "" : v).trim().toUpperCase();
  if (tipe === "pg") {
    const m = key.toUpperCase().match(/^([A-E])(?:[.\s)]|$)/);
    const want = m ? m[1] : key.toUpperCase();
    return up(answer) === want;
  }
  if (tipe === "multi") {
    const want = key.split(/[;,|]/).map(up).filter(Boolean).sort().join("|");
    const got = (Array.isArray(answer) ? answer : []).map(up).filter(Boolean).sort().join("|");
    return want !== "" && want === got;
  }
  if (tipe === "kategori") {
    const want = {};
    key.split(/[;,|]/).forEach(p => { const m = p.split("="); if (m.length === 2) want[up(m[0])] = up(m[1]); });
    const got = {};
    if (Array.isArray(answer)) answer.forEach(p => { const m = String(p).split("="); if (m.length === 2) got[up(m[0])] = up(m[1]); });
    else if (answer && typeof answer === "object") Object.keys(answer).forEach(k => { got[up(k)] = up(answer[k]); });
    const letters = Object.keys(want);
    return letters.length > 0 && letters.every(l => got[l] === want[l]);
  }
  return false;
}

function startLocalAttempt(type, subject, sub) {
  return loadBankData().then(bank => {
    let pool = bank;
    const isSim = type === "simulasi";
    if (!isSim) {
      pool = pool.filter(q => q.subjek === subject && (!sub || q.sub_subjek === sub));
    }
    const count = isSim ? SIM.count : PRACTICE.count;
    let picked;
    if (isSim) {
      const pus = shuffle(pool.filter(q => /pusmendik/i.test(q.asal_data || "")));
      const other = shuffle(pool.filter(q => !/pusmendik/i.test(q.asal_data || "")));
      picked = shuffle(pus.slice(0, 4).concat(other.slice(0, count - 4)));
    } else {
      picked = shuffle(pool).slice(0, count);
    }
    if (!picked.length) throw Error("Soal untuk materi ini belum tersedia.");
    const now = Date.now(), minutes = isSim ? SIM.minutes : PRACTICE.minutes;
    const endAt = now + minutes * 60000;
    const attemptId = "local_" + Math.random().toString(36).slice(2, 10);
    const keysMap = {};
    picked.forEach(q => { keysMap[q.question_id] = q; });
    attempt = {
      id: attemptId,
      type: isSim ? "simulasi" : "latihan",
      subject: isSim ? null : subject,
      sub: sub || "",
      questions: picked.map(normalizeQuestion),
      answers: {},
      index: 0,
      endAt,
      local: true,
      keys: keysMap
    };
    saveAttempt();
    go("quiz");
    startTimer();
    toast("Sesi latihan dimulai (mode pratinjau guru).");
  }).catch(e => toast(e.message));
}

function finishLocalAttempt(a, expired = false) {
  const keys = a.keys || {};
  let correct = 0;
  const questions = a.questions || [];
  const review = [];
  questions.forEach(q => {
    const rawQ = keys[q.id];
    const userAns = a.answers[q.id] !== undefined ? a.answers[q.id] : null;
    const isCorrect = rawQ ? checkAnswer(userAns, rawQ) : false;
    if (isCorrect) correct++;
    review.push({
      question_id: q.id,
      question: q,
      is_correct: isCorrect,
      user_answer: userAns,
      kunci: rawQ ? (rawQ.kunci_opsi || rawQ.kunci || "") : "",
      tipe: q.tipe
    });
  });
  const total = questions.length;
  const score = total ? Math.round(correct / total * 100) : 0;
  const hasWrong = review.some(x => !x.is_correct);
  reviewFilter = hasWrong ? "wrong" : "all";
  result = {
    nilai: score,
    benar: correct,
    total,
    expired,
    subject: a.subject,
    type: a.type,
    sub: a.sub || "",
    review
  };
  store("tka_last_review", result);
  const completedAttempt = {
    attempt_id: a.id,
    jenis: a.type || "latihan",
    subjek: a.subject || (a.type === "simulasi" ? "Simulasi TKA" : ""),
    sub_subjek: a.sub || "",
    jumlah_benar: correct,
    jumlah_soal: total,
    nilai: score,
    tanggal: new Date().toISOString()
  };
  const existing = (history || []).filter(x => x.attempt_id !== completedAttempt.attempt_id);
  history = [completedAttempt, ...existing];
  saveHistory();
  attempt = null; store("tka_attempt", null);
  go("result");
}

function start(type, subject, sub) {
  if (!user) { toast("Silakan login terlebih dahulu."); return; }
  const isSim = type === "simulasi";
  let n = isSim ? SIM.count : PRACTICE.count;
  if (!isSim && sub) {
    const m = materi.find(x => x.subjek === subject && x.submateri === sub); n = Math.min(n, m ? m.jumlah : n);
    if (m && m.jumlah < PRACTICE.minSub) { toast(`Submateri ini baru punya ${m.jumlah} soal (minimal ${PRACTICE.minSub}). Pilih submateri lain atau semua submateri.`); return; }
  }
  pending = () => begin(type, subject, sub);
  $("#ctitle").textContent = isSim ? "Mulai Simulasi TKA?" : "Mulai latihan?";
  $("#ctext").textContent = isSim ? `${SIM.count} soal, durasi ${SIM.minutes} menit.` : `${n} soal, durasi ${PRACTICE.minutes} menit.${sub ? " Submateri: " + sub : ""}`;
  $("#accept").textContent = "Mulai sekarang";
  $("#confirm").classList.remove("hidden");
}

function deriveType(q) {
  // 1. Server sudah mengirim tipe yang valid — gunakan langsung.
  if (q.tipe === "multi" || q.tipe === "kategori" || q.tipe === "pg") return q.tipe;
  // 2. Fallback: deteksi dari label bentuk_soal yang dikirim server.
  const bentuk = String(q.bentuk_soal || "").toLowerCase();
  if (/kategori|benar\s*\/\s*salah/.test(bentuk)) return "kategori";
  if (/multi|mcma/.test(bentuk)) return "multi";
  if (/^pg$|^pilihan ganda$/.test(bentuk.trim())) return "pg";
  if (/^pgk/.test(bentuk)) return "multi";
  // 3. Fallback terakhir: cek kata kunci di teks soal.
  const stem = String(q.stimulus_isi_soal || "").toLowerCase();
  if (/benar\s+(atau|dan)\s+salah/.test(stem)) return "kategori";
  if (/jawaban\s+(benar\s+)?lebih\s+dari\s+satu|lebih\s+dari\s+satu\s+jawaban/.test(stem)) return "multi";
  return "pg";
}
function normalizeQuestion(q) {
  const letters = ["A", "B", "C", "D", "E"];
  const blank = t => { t = String(t == null ? "" : t).trim(); return !t || /^[—–-]$/.test(t); };   // "—" = opsi kosong
  const opts = letters.map(l => ({ l, t: q["opsi_" + l.toLowerCase()] })).filter(o => !blank(o.t));
  return { id: q.question_id, tipe: deriveType(q), text: q.stimulus_isi_soal || "Soal", opts, sub: q.sub_subjek || "", pus: /pusmendik/i.test(q.asal_data || "") };
}
function buildAttempt(d, answers = {}, index = 0) {
  const isSim = d.jenis === "simulasi";
  return { id: d.attempt_id, type: isSim ? "simulasi" : "latihan", subject: isSim ? null : d.subjek, sub: d.sub_subjek || "",
    questions: (d.questions || []).map(normalizeQuestion), answers, index, endAt: new Date(d.batas_waktu).getTime() };
}
function saveAttempt() {
  if (attempt) {
    store("tka_attempt", {
      id: attempt.id,
      answers: attempt.answers,
      index: attempt.index,
      local: !!attempt.local,
      type: attempt.type,
      subject: attempt.subject,
      sub: attempt.sub,
      questions: attempt.questions,
      endAt: attempt.endAt,
      keys: attempt.keys
    });
  }
}

function begin(type, subject, sub) {
  toast("Menyiapkan soal…");
  api(type === "simulasi" ? "startSimulation" : "startPractice", { subjek: subject, sub_subjek: sub || "" })
    .then(d => { attempt = buildAttempt(d); saveAttempt(); go("quiz"); startTimer(); })
    .catch(e => {
      if (user?.role === "guru") {
        return startLocalAttempt(type, subject, sub);
      }
      toast(e.message);
    });
}
function restoreAttempt() {
  const saved = load("tka_attempt");
  if (!saved || !user || user.wajib_ganti_password) return Promise.resolve(false);
  if (saved.local) {
    attempt = saved;
    go("quiz");
    startTimer();
    toast("Sesi latihan dilanjutkan.");
    return Promise.resolve(true);
  }
  return api("getAttempt", { attempt_id: saved.id })
    .then(d => { attempt = buildAttempt(d, saved.answers || {}, saved.index || 0); go("quiz"); startTimer(); toast("Sesi latihan dilanjutkan."); return true; })
    .catch(() => { store("tka_attempt", null); return false; });
}

const isAnswered = (q, a) => q.tipe === "multi" ? !!(a && a.length) : q.tipe === "kategori" ? !!a && q.opts.every(o => a[o.l]) : !!a;
function answeredCount() { return attempt.questions.filter(q => isAnswered(q, attempt.answers[q.id])).length; }

function quiz() {
  if (!attempt) return `<p>Tidak ada sesi aktif.</p>`;
  const q = attempt.questions[attempt.index], a = attempt.answers[q.id];
  const left = Math.max(0, Math.ceil((attempt.endAt - Date.now()) / 1000)), done = answeredCount(), total = attempt.questions.length;
  const hint = q.tipe === "multi" ? "Pilih semua jawaban yang benar." : q.tipe === "kategori" ? "Tentukan Benar atau Salah untuk setiap pernyataan." : "Pilih satu jawaban.";
  let body;
  if (q.tipe === "kategori") {
    body = q.opts.map(o => `<div class="catrow"><span class="letter">${o.l}</span><span class="cattext">${esc(o.t)}</span><span class="catbtns">${["BENAR", "SALAH"].map(v => `<button type="button" class="catbtn ${a && a[o.l] === v ? "on" : ""}" data-cat="${o.l}" data-val="${v}">${v === "BENAR" ? "Benar" : "Salah"}</button>`).join("")}</span></div>`).join("");
  } else {
    const on = l => q.tipe === "multi" ? (a || []).includes(l) : a === l;
    body = q.opts.map(o => `<div class="option ${on(o.l) ? "selected" : ""}" data-option="${o.l}" role="${q.tipe === "multi" ? "checkbox" : "radio"}" aria-checked="${on(o.l)}"><span class="letter">${o.l}</span><span>${esc(o.t)}</span></div>`).join("");
  }
  return `<div class="pagehead"><div><p class="eyebrow">${attempt.type === "simulasi" ? "SIMULASI TKA" : "LATIHAN PER SUBJEK"}</p><h1>${esc(attempt.subject || "Simulasi TKA")}</h1><p>Periksa jawaban sebelum menyelesaikan sesi.</p></div><span class="chip">● Sesi berlangsung</span></div>
<div class="quizlayout"><div class="quizbox"><div class="quizbar"><span>SOAL ${String(attempt.index + 1).padStart(2, "0")} / ${total}</span><span class="timer ${left < 300 ? "warn" : ""}" id="timer">◷ ${fmt(left)}</span></div>
<div class="question">${esc(q.text)}</div>${q.sub ? `<p class="muted">${esc(q.sub)}</p>` : ""}${q.pus ? '<span class="pill">SUMBER: PUSMENDIK</span>' : ""}<p class="hint">${hint}</p><div>${body}</div>
<div class="quizcontrols"><button class="secondary" id="prev" ${attempt.index === 0 ? "disabled" : ""}>← Sebelumnya</button><button class="secondary" id="clear">Hapus jawaban</button>${attempt.index < total - 1 ? `<button class="primary" id="next">Berikutnya →</button>` : `<button class="primary" id="finish">Selesaikan ✓</button>`}</div></div>
<aside class="quizside"><h3>Navigasi soal</h3><p>${done} dari ${total} soal dijawab</p><div class="progress"><span style="width:${done / total * 100}%"></span></div><div class="qmap">${attempt.questions.map((x, i) => `<button class="qnum ${isAnswered(x, attempt.answers[x.id]) ? "answered" : ""} ${i === attempt.index ? "current" : ""}" data-q="${i}">${i + 1}</button>`).join("")}</div><p>Hijau = dijawab. Sesi tidak dapat dilanjutkan setelah selesai.</p><button class="primary full" id="finishside">Selesaikan sesi</button></aside></div>`;
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (!attempt) { clearInterval(timer); return; }
    const left = Math.ceil((attempt.endAt - Date.now()) / 1000), el = $("#timer");
    if (el) { el.textContent = "◷ " + fmt(Math.max(0, left)); el.classList.toggle("warn", left < 300); }
    if (left <= 0) { clearInterval(timer); finish(true); }
  }, 1000);
}

let finishing = false;
function finish(expired = false) {
  if (!attempt || finishing) return;
  finishing = true;
  const a = attempt; clearInterval(timer);
  if (a.local) {
    finishing = false;
    finishLocalAttempt(a, expired);
    return;
  }
  toast("Mengirim jawaban…");
  api("finishAttempt", { attempt_id: a.id, answers: a.answers })
    .then(async d => {
      const questions = a.questions || [];
      let serverRev = Array.isArray(d.review) ? d.review : [];
      if (!serverRev.length) {
        try {
          const bank = await loadBankData();
          const bankMap = new Map(bank.map(q => [q.question_id, q]));
          serverRev = questions.map(q => {
            const rawQ = bankMap.get(q.id);
            const userAns = a.answers[q.id] !== undefined ? a.answers[q.id] : null;
            const isCorrect = rawQ ? checkAnswer(userAns, rawQ) : false;
            return {
              question_id: q.id,
              is_correct: isCorrect,
              user_answer: userAns,
              kunci: rawQ ? (rawQ.kunci_opsi || rawQ.kunci || "") : "",
              tipe: q.tipe
            };
          });
        } catch (_) {}
      }
      const revMap = new Map(serverRev.map(r => [String(r.question_id || "").trim(), r]));
      const review = questions.map(q => {
        const qId = String(q.id || "").trim();
        const r = revMap.get(qId);
        const userAns = a.answers[q.id] !== undefined ? a.answers[q.id] : null;
        return {
          question_id: q.id,
          question: q,
          is_correct: r ? !!r.is_correct : false,
          user_answer: userAns,
          kunci: r ? (r.kunci || "") : "",
          tipe: q.tipe
        };
      });
      const hasWrong = review.some(x => !x.is_correct);
      reviewFilter = hasWrong ? "wrong" : "all";
      result = {
        nilai: d.nilai,
        benar: d.jumlah_benar,
        total: d.jumlah_soal,
        expired,
        subject: a.subject,
        type: a.type,
        sub: a.sub || "",
        review
      };
      store("tka_last_review", result);
      const completedAttempt = {
        attempt_id: d.attempt_id || a.id,
        jenis: d.jenis || a.type || "latihan",
        subjek: d.subjek || a.subject || (a.type === "simulasi" ? "Simulasi TKA" : ""),
        sub_subjek: d.sub_subjek || a.sub || "",
        jumlah_benar: d.jumlah_benar != null ? Number(d.jumlah_benar) : (result.benar || 0),
        jumlah_soal: d.jumlah_soal != null ? Number(d.jumlah_soal) : a.questions.length,
        nilai: d.nilai != null ? Number(d.nilai) : 0,
        tanggal: d.tanggal || new Date().toISOString()
      };
      const existing = (history || []).filter(x => x.attempt_id !== completedAttempt.attempt_id);
      history = [completedAttempt, ...existing];
      saveHistory();

      attempt = null; store("tka_attempt", null);
      go("result");
      setTimeout(syncHistory, 500);
    })
    .catch(e => {
      if (user?.role === "guru") {
        finishing = false;
        finishLocalAttempt(a, expired);
        return;
      }
      toast("Pengiriman gagal: " + e.message);
      if (/waktu|ditutup|kedaluwarsa/i.test(e.message)) { attempt = null; store("tka_attempt", null); go("home"); }
      else if (a === attempt) startTimer();
    })
    .finally(() => { finishing = false; });
}

function retryWrongQuestions() {
  const r = result || load("tka_last_review");
  if (!r || !r.review) return;
  const wrong = r.review.filter(x => !x.is_correct);
  if (!wrong.length) { toast("Semua soal sudah benar! Kerja bagus."); return; }

  const keysMap = {};
  wrong.forEach(x => {
    keysMap[x.question_id] = {
      question_id: x.question_id,
      kunci: x.kunci,
      kunci_opsi: x.kunci,
      bentuk_soal: x.tipe === "multi" ? "PGK MCMA" : (x.tipe === "kategori" ? "PGK Kategori" : "PG")
    };
  });

  const minutes = Math.max(5, Math.ceil(wrong.length * 1.5));
  const now = Date.now();
  attempt = {
    id: "remedial_" + Math.random().toString(36).slice(2, 10),
    type: "latihan",
    subject: (r.subject || "Latihan") + " (Remedial)",
    sub: "Ulangi " + wrong.length + " Soal Salah",
    questions: wrong.map(x => x.question),
    answers: {},
    index: 0,
    endAt: now + minutes * 60000,
    local: true,
    keys: keysMap
  };
  saveAttempt();
  go("quiz");
  startTimer();
  toast(`Memulai latihan ulang ${wrong.length} soal salah.`);
}

function renderReviewCard(item, num) {
  const q = item.question || {};
  const isCorrect = !!item.is_correct;
  const userAns = item.user_answer;
  const key = String(item.kunci || "").trim();
  const tipe = item.tipe || q.tipe || "pg";
  const isBlank = userAns == null || (Array.isArray(userAns) && !userAns.length) || (tipe === "kategori" && (!userAns || typeof userAns !== "object" || !Object.keys(userAns).length));

  let badge = "";
  if (isCorrect) {
    badge = `<span class="review-badge correct">✓ Benar</span>`;
  } else if (isBlank) {
    badge = `<span class="review-badge skipped">⚠️ Tidak Dijawab</span>`;
  } else {
    badge = `<span class="review-badge wrong">✕ Salah</span>`;
  }

  let optionsHtml = "";

  if (tipe === "kategori") {
    const wantMap = {};
    key.split(/[;,|]/).forEach(p => {
      const m = p.split("=");
      if (m.length === 2) wantMap[m[0].trim().toUpperCase()] = m[1].trim().toUpperCase();
    });
    const gotMap = {};
    if (Array.isArray(userAns)) {
      userAns.forEach(p => {
        const m = String(p).split("=");
        if (m.length === 2) gotMap[m[0].trim().toUpperCase()] = m[1].trim().toUpperCase();
      });
    } else if (userAns && typeof userAns === "object") {
      Object.keys(userAns).forEach(k => { gotMap[k.trim().toUpperCase()] = String(userAns[k]).trim().toUpperCase(); });
    }

    const rows = (q.opts || []).map(o => {
      const want = wantMap[o.l] || "—";
      const got = gotMap[o.l] || "(Kosong)";
      const isMatch = got === want;
      return `<tr class="${isMatch ? "cat-row-ok" : "cat-row-err"}">
        <td class="cat-col-l"><b>${esc(o.l)}</b></td>
        <td class="cat-col-text">${esc(o.t)}</td>
        <td class="cat-col-ans ${isMatch ? "badge-ans-ok" : "badge-ans-err"}">${esc(got)}</td>
        <td class="cat-col-key badge-ans-ok"><b>${esc(want)}</b></td>
      </tr>`;
    }).join("");

    optionsHtml = `<div class="cat-table-wrap">
      <table class="cat-review-table">
        <thead>
          <tr>
            <th style="width:36px">No</th>
            <th>Pernyataan</th>
            <th>Pilihan Anda</th>
            <th>Kunci Seharusnya</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  } else if (tipe === "multi") {
    const wantSet = new Set(key.split(/[;,|]/).map(v => v.trim().toUpperCase()).filter(Boolean));
    const gotSet = new Set((Array.isArray(userAns) ? userAns : [userAns]).map(v => String(v || "").trim().toUpperCase()).filter(Boolean));

    optionsHtml = (q.opts || []).map(o => {
      const isExpected = wantSet.has(o.l);
      const isChosen = gotSet.has(o.l);
      let optClass = "review-opt";
      let tag = "";

      if (isExpected && isChosen) {
        optClass += " is-correct";
        tag = `<span class="opt-tag tag-correct">✓ Pilihan Benar</span>`;
      } else if (isExpected && !isChosen) {
        optClass += " is-key";
        tag = `<span class="opt-tag tag-key">✓ Kunci (Harus Dipilih)</span>`;
      } else if (!isExpected && isChosen) {
        optClass += " is-wrong";
        tag = `<span class="opt-tag tag-wrong">✕ Keliru Dipilih</span>`;
      }

      return `<div class="${optClass}">
        <span class="letter">${esc(o.l)}</span>
        <span class="opt-text">${esc(o.t)}</span>
        ${tag}
      </div>`;
    }).join("");
  } else {
    const m = key.toUpperCase().match(/^([A-E])(?:[.\s)]|$)/);
    const keyLetter = m ? m[1] : key.toUpperCase();
    const userLetter = userAns ? String(userAns).trim().toUpperCase() : "";

    optionsHtml = (q.opts || []).map(o => {
      const isKey = o.l === keyLetter;
      const isChosen = o.l === userLetter;
      let optClass = "review-opt";
      let tag = "";

      if (isKey && isChosen) {
        optClass += " is-correct";
        tag = `<span class="opt-tag tag-correct">✓ Jawaban Anda (Benar)</span>`;
      } else if (isKey && !isChosen) {
        optClass += " is-key";
        tag = `<span class="opt-tag tag-key">✓ Kunci Jawaban</span>`;
      } else if (!isKey && isChosen) {
        optClass += " is-wrong";
        tag = `<span class="opt-tag tag-wrong">✕ Jawaban Anda (Salah)</span>`;
      }

      return `<div class="${optClass}">
        <span class="letter">${esc(o.l)}</span>
        <span class="opt-text">${esc(o.t)}</span>
        ${tag}
      </div>`;
    }).join("");
  }

  return `
  <article class="review-card ${isCorrect ? "card-correct" : "card-wrong"}">
    <div class="rcard-head">
      <div class="rcard-meta">
        <span class="rcard-num">Soal ${num}</span>
        ${q.sub ? `<span class="rcard-sub">${esc(q.sub)}</span>` : ""}
        ${q.pus ? `<span class="pill">PUSMENDIK</span>` : ""}
      </div>
      ${badge}
    </div>
    <div class="rcard-question">${esc(q.text || "Soal")}</div>
    <div class="rcard-options">${optionsHtml}</div>
    ${q.sub ? `
    <div class="rcard-foot">
      <span>Submateri: <b>${esc(q.sub)}</b></span>
      <button type="button" class="link-materi" data-go="materi">Pelajari di Menu Materi →</button>
    </div>` : ""}
  </article>`;
}

function resultPage() {
  const r = result || load("tka_last_review") || { nilai: "—", benar: "—", total: "—", review: [] };
  result = r;
  const reviewList = r.review || [];

  if (reviewList.length && reviewList.some(x => !x.kunci)) {
    loadBankData().then(bank => {
      const bankMap = new Map(bank.map(q => [q.question_id, q]));
      let anyFixed = false;
      reviewList.forEach(item => {
        if (!item.kunci) {
          const rawQ = bankMap.get(item.question_id);
          if (rawQ) {
            item.kunci = rawQ.kunci_opsi || rawQ.kunci || "";
            item.is_correct = checkAnswer(item.user_answer, rawQ);
            anyFixed = true;
          }
        }
      });
      if (anyFixed) {
        store("tka_last_review", result);
        if (page === "result") render();
      }
    }).catch(() => {});
  }

  const total = r.total || reviewList.length || 0;
  const countBenar = reviewList.filter(x => x.is_correct).length;
  const countSalah = reviewList.filter(x => !x.is_correct).length;
  const benar = r.benar != null ? r.benar : countBenar;
  const salah = Math.max(0, total - benar);
  const hasWrong = reviewList.some(x => !x.is_correct);
  const missingServerReview = (Number(r.benar) > 0 && countBenar === 0) || (reviewList.length > 0 && reviewList.every(x => !x.kunci));

  let filtered = reviewList;
  if (reviewFilter === "wrong") {
    filtered = reviewList.filter(x => !x.is_correct);
  } else if (reviewFilter === "correct") {
    filtered = reviewList.filter(x => x.is_correct);
  }

  let cardsHtml = "";
  if (!reviewList.length) {
    cardsHtml = `<div class="review-empty"><p class="muted">Detail evaluasi butir soal tidak tersedia untuk sesi ini.</p></div>`;
  } else if (!filtered.length) {
    if (reviewFilter === "wrong") {
      cardsHtml = `<div class="review-empty success-box">
        <div style="font-size:38px;margin-bottom:10px">🎉</div>
        <h3>Luar Biasa! Tidak Ada Soal yang Salah</h3>
        <p class="muted">Semua soal pada sesi ini berhasil Anda jawab dengan benar.</p>
      </div>`;
    } else if (reviewFilter === "correct" && missingServerReview) {
      cardsHtml = `<div class="review-empty">
        <p class="muted" style="line-height:1.7"><b>Kunci evaluasi belum terkirim dari server Apps Script.</b><br>
        Server mencatat Anda benar <b>${esc(benar)}</b> soal, namun rincian soal benar belum dapat ditampilkan karena backend Apps Script belum mengembalikan data review.<br>
        <small style="color:var(--navy)">Solusi: Buka script.google.com, perbarui Code.gs, lalu klik <b>Deploy &gt; Manage deployments &gt; New version</b>.</small></p>
      </div>`;
    } else {
      cardsHtml = `<div class="review-empty"><p class="muted">Tidak ada soal pada kategori filter ini.</p></div>`;
    }
  } else {
    cardsHtml = filtered.map(item => renderReviewCard(item, reviewList.indexOf(item) + 1)).join("");
  }

  return `<div class="result-layout">
    <div class="panel result">
      <div class="circle ${r.nilai >= 75 ? "pass" : "fail"}">${esc(r.nilai)}</div>
      <p class="eyebrow">SESI SELESAI</p>
      <h2>${r.expired ? "Waktu pengerjaan habis" : "Latihan selesai!"}</h2>
      <p class="muted">Jawaban benar <b>${esc(benar)}</b> dari <b>${esc(total)}</b> soal pada ${esc(r.subject || "Simulasi TKA")}.</p>
      <div class="result-stats">
        <div class="rstat correct"><span>Benar</span><strong>${esc(benar)}</strong></div>
        <div class="rstat wrong"><span>Salah / Kosong</span><strong>${esc(salah)}</strong></div>
        <div class="rstat score"><span>Nilai Akhir</span><strong>${esc(r.nilai)}</strong></div>
      </div>
      <p class="muted" style="margin-top:10px">Total latihan yang sudah dikerjakan: <b>${history.length}</b> sesi</p>
      <div class="actions">
        ${hasWrong ? `<button type="button" class="primary btn-remedial" id="btn-remedial">⚡ Latih Ulang Soal Salah (${salah})</button>` : ""}
        <button type="button" class="${hasWrong ? "secondary" : "primary"}" data-go="subjects">Latihan subjek lain</button>
        <button type="button" class="secondary" data-go="home">Kembali ke beranda</button>
      </div>
    </div>

    <div class="review-section">
      <div class="review-head">
        <div>
          <h2>Pembahasan & Evaluasi Soal</h2>
          <p class="muted">Tinjau jawaban Anda untuk memahami konsep yang keliru.</p>
        </div>
        ${reviewList.length ? `
        <div class="review-filters">
          <button type="button" class="rfilter-btn ${reviewFilter === "wrong" ? "active" : ""}" data-filter="wrong">
            ❌ Salah (${countSalah})
          </button>
          <button type="button" class="rfilter-btn ${reviewFilter === "correct" ? "active" : ""}" data-filter="correct">
            ✅ Benar (${countBenar})
          </button>
          <button type="button" class="rfilter-btn ${reviewFilter === "all" ? "active" : ""}" data-filter="all">
            📋 Semua (${total})
          </button>
        </div>` : ""}
      </div>
      ${missingServerReview ? `<div class="notice-backend-warn"><b>⚠️ Info Guru/Pengembang:</b> Kunci evaluasi per soal belum dikirim oleh backend Apps Script. Harap buka <b>script.google.com</b>, pastikan <code>Code.gs</code> sudah diperbarui, lalu lakukan <b>Deploy &gt; Manage deployments &gt; Edit &gt; New version &gt; Deploy</b>.</div>` : ""}
      <div class="review-cards">
        ${cardsHtml}
      </div>
    </div>
  </div>`;
}

/* ---------- render & event ---------- */
function render() {
  const c = $("#content");
  const views = { home, subjects: subjectPage, materi: materiPage, simulation, report: reportPage, import: importStudentsPage, quiz, result: resultPage };
  c.innerHTML = (views[page] || resultPage)();
  if (page === "materi") mountMateri();

  const cpf = $("#changepasswordform");
  if (cpf) cpf.querySelectorAll("input").forEach(i => i.oninput = () => $("#passworderr").classList.add("hidden"));
  if (cpf) cpf.onsubmit = e => {
    e.preventDefault();
    const a = $("#newpassword").value, b = $("#confirmpassword").value, err = $("#passworderr");
    const fail = m => { err.textContent = m; err.classList.remove("hidden"); };
    err.classList.add("hidden");
    if (a.length < 8) return fail("[browser] Password baru minimal 8 karakter (terbaca " + a.length + ").");
    if (a !== b) return fail("Konfirmasi password belum cocok.");
    const btn = cpf.querySelector("button[type=submit]"); btn.disabled = true;
    api("changePassword", { new_password: a, confirm_password: b })
      .then(() => { user.wajib_ganti_password = false; store("tka_user", user); toast("Password berhasil diperbarui."); render(); })
      .catch(x => { fail(x.message || "Password gagal diperbarui."); btn.disabled = false; });
  };

  const isf = $("#importstudentsform");
  if (isf) isf.onsubmit = async e => {
    e.preventDefault();
    const file = $("#studentscsv").files[0], btn = $("#importstudentsbutton"), out = $("#importstudentsresult");
    if (!file) return;
    btn.disabled = true; out.textContent = "Membaca file CSV…";
    try {
      const rows = parseCSV(await file.text());
      if (!rows.length) throw Error("Tidak ada baris siswa valid. Periksa kolom NIS, USER, dan PASSWORD.");
      out.textContent = `Mengirim ${rows.length} akun ke backend…`;
      const d = await api("importStudents", { students: rows });
      out.textContent = `Selesai. Berhasil ditambahkan: ${d.imported ?? 0}. Dilewati: ${d.skipped ?? 0}. ${d.message || ""}`;
      toast("Proses impor selesai.");
    } catch (err) { out.textContent = "Impor gagal: " + (err.message || "Terjadi kesalahan."); }
    finally { btn.disabled = false; }
  };

  c.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  c.querySelectorAll("[data-subject]").forEach(b => b.onclick = () => {
    const sel = b.dataset.idx !== undefined ? c.querySelector(`[data-sel="${b.dataset.idx}"]`) : null;
    start("latihan", b.dataset.subject, sel ? sel.value : "");
  });
  $("#startsim")?.addEventListener("click", () => start("simulasi", null));
  $("#fapply")?.addEventListener("click", () => { reportFilter = { kelas: $("#fkelas").value, jenis: $("#fjenis").value }; loadReport(); render(); });

  if (page === "result") {
    c.querySelectorAll(".rfilter-btn").forEach(btn => {
      btn.onclick = () => {
        reviewFilter = btn.dataset.filter;
        render();
      };
    });
    $("#btn-remedial")?.addEventListener("click", retryWrongQuestions);
  }

  if (page === "home") {
    const openRev = () => {
      const lastRev = load("tka_last_review");
      if (lastRev) {
        result = lastRev;
        const hasWrong = (lastRev.review || []).some(x => !x.is_correct);
        reviewFilter = hasWrong ? "wrong" : "all";
        go("result");
      }
    };
    $("#open-last-review")?.addEventListener("click", openRev);
    $("#act-last-review")?.addEventListener("click", openRev);
  }

  if (page === "quiz" && attempt) {
    const q = attempt.questions[attempt.index], set = v => { if (v === undefined || (Array.isArray(v) && !v.length)) delete attempt.answers[q.id]; else attempt.answers[q.id] = v; saveAttempt(); render(); };
    $("#prev")?.addEventListener("click", () => { attempt.index--; saveAttempt(); render(); });
    $("#next")?.addEventListener("click", () => { attempt.index++; saveAttempt(); render(); });
    $("#clear")?.addEventListener("click", () => set(undefined));
    c.querySelectorAll("[data-option]").forEach(b => b.onclick = () => {
      const l = b.dataset.option;
      if (q.tipe === "multi") { const cur = new Set(attempt.answers[q.id] || []); cur.has(l) ? cur.delete(l) : cur.add(l); set([...cur].sort()); }
      else set(l);
    });
    c.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => set({ ...(attempt.answers[q.id] || {}), [b.dataset.cat]: b.dataset.val }));
    c.querySelectorAll("[data-q]").forEach(b => b.onclick = () => { attempt.index = +b.dataset.q; saveAttempt(); render(); });
    $("#finish")?.addEventListener("click", confirmFinish);
    $("#finishside")?.addEventListener("click", confirmFinish);
  }
}

function confirmFinish() {
  pending = () => finish(false);
  $("#ctitle").textContent = "Selesaikan sesi?";
  $("#ctext").textContent = `Jawaban terisi ${answeredCount()} dari ${attempt.questions.length}. Setelah selesai, sesi tidak dapat dilanjutkan.`;
  $("#accept").textContent = "Ya, selesaikan";
  $("#confirm").classList.remove("hidden");
}

/* ---------- inisialisasi ---------- */
document.querySelectorAll(".nav").forEach(b => b.onclick = () => go(b.dataset.page));
$("#menu").onclick = () => $("#sidebar").classList.toggle("open");
$("#logout").onclick = () => { if (user) api("logout").catch(() => {}); clearSession(); showLogin(); };
$("#cancel").onclick = () => $("#confirm").classList.add("hidden");
$("#accept").onclick = () => { const f = pending; pending = null; $("#confirm").classList.add("hidden"); if (f) f(); };

$("#loginform").onsubmit = e => {
  e.preventDefault();
  const u = $("#nis").value.trim(), p = $("#pin").value, err = $("#loginerr"), btn = e.target.querySelector("button");
  err.classList.add("hidden"); btn.disabled = true; btn.textContent = "Memproses…";
  api("login", { username: u, password: p })
    .then(d => { $("#pin").value = ""; login(d); })
    .catch(x => { err.textContent = x.message; err.classList.remove("hidden"); })
    .finally(() => { btn.disabled = false; btn.textContent = "Masuk ke aplikasi →"; });
};

// Pulihkan sesi setelah halaman dimuat ulang (token masih berlaku di server).
const saved = load("tka_user");
if (saved && saved.token && cfg.apiUrl) {
  user = saved;
  loadHistory();
  login({ ...saved, wajib_ganti_password: false, history: history });
  api("getDashboard")
    .then(d => {
      if (Array.isArray(d?.history)) mergeHistory(d.history);
      if (d?.leaderboard && Array.isArray(d.leaderboard.rows)) {
        board = d.leaderboard;
        if (page === "home") render();
      }
    })
    .catch(() => {});
}
})();
