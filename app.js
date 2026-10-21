/* Latihan TKA TJKT — frontend. Semua soal, penilaian, riwayat, dan laporan berasal dari backend Apps Script.
   Tidak ada kunci jawaban di file ini. */
(() => {
"use strict";

const subjects = [
  "IoT dan Teknologi Telekomunikasi", "Jaringan Komputer dan Konfigurasi", "K3LH dan Budaya Kerja",
  "Keamanan Siber dan Jaringan", "Media Optik", "Media Seluler", "Media Satelit", "Media Tembaga",
  "Profesi dan Dunia Kerja TJKT", "Sistem Operasi, Server, dan Cloud"
];
const icons = ["⌁", "⌘", "✚", "◇", "◎", "◉", "◌", "⌁", "♙", "▣"];
const names = {
  home: "Beranda", subjects: "Soal per Subjek", materi: "Materi", simulation: "Simulasi TKA",
  report: "Laporan Nilai", import: "Impor Siswa", quiz: "Sesi Latihan", result: "Hasil Latihan"
};
const PRACTICE = { count: 20, minutes: 30, minSub: 5 }, SIM = { count: 25, minutes: 50 };   // minSub = batas minimal soal agar submateri bisa dipilih (sama dengan MIN_SUBTOPIC_COUNT di Code.gs)
const $ = s => document.querySelector(s);
const cfg = window.TKA_CONFIG || { apiUrl: "" };
const materi = window.TKA_MATERI || [];

let user = null, page = "home", attempt = null, history = [], pending = null, result = null, timer = null;
let report = null, reportFilter = { kelas: "", jenis: "" };

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
function store(key, val) { try { val == null ? sessionStorage.removeItem(key) : sessionStorage.setItem(key, JSON.stringify(val)); } catch {} }
function load(key) { try { return JSON.parse(sessionStorage.getItem(key) || "null"); } catch { return null; } }
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
        return { ...r.user, token: r.token, wajib_ganti_password: r.wajib_ganti_password, history: r.history || [] };
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
  if (user && user.wajib_ganti_password && p !== "home") {
    page = "home"; toast("Ganti password di Beranda terlebih dahulu."); render(); return;
  }
  page = p;
  $("#crumb").textContent = names[p] || p;
  document.querySelectorAll(".nav").forEach(b => b.classList.toggle("active", b.dataset.page === p));
  $("#sidebar").classList.remove("open");
  if (p === "report") loadReport();
  render();
}

function login(u) {
  const { history: h, ...rest } = u;           // riwayat ikut dalam respons login; tidak perlu permintaan tambahan
  history = Array.isArray(h) ? h : [];
  user = { ...rest, wajib_ganti_password: !!(u.wajib_ganti_password || u.must_change_password) };
  store("tka_user", user);
  $("#login").classList.add("hidden");
  $("#username").textContent = user.nama;
  $("#role").textContent = user.role === "guru" ? "Guru / Administrator" : "Peserta latihan";
  $("#avatar").textContent = (user.nama || "S")[0].toUpperCase();
  document.querySelectorAll(".teacher").forEach(x => x.classList.toggle("hidden", user.role !== "guru"));
  go("home");
  restoreAttempt();
}

/* ---------- halaman ---------- */
function home() {
  const isGuru = user.role === "guru";
  const pw = user.wajib_ganti_password ? `<div class="panel password-panel"><p class="eyebrow">TINDAKAN WAJIB</p><h2>Ganti Password Awal</h2><p class="muted">Untuk keamanan akun, buat password baru terlebih dahulu. Menu latihan dan simulasi akan terbuka setelah password berhasil diperbarui.</p><form id="changepasswordform" class="password-form"><label>Password baru</label><input id="newpassword" type="password" minlength="8" autocomplete="new-password" placeholder="Minimal 8 karakter" required><label>Konfirmasi password baru</label><input id="confirmpassword" type="password" minlength="8" autocomplete="new-password" placeholder="Ketik ulang password baru" required><p id="passworderr" class="error hidden"></p><button class="primary" type="submit">Simpan Password Baru</button></form></div>` : "";
  const tiles = subjects.slice(0, 6).map((s, i) => {
    const last = history.find(x => x.jenis === "latihan" && x.subjek === s);
    return `<button class="tile" data-subject="${esc(s)}"><span class="symbol">${icons[i]}</span><span><strong>${esc(s)}</strong><small>${last ? `Nilai terakhir: ${esc(last.nilai)} • ${esc(fmtDate(last.tanggal))}` : "Belum pernah dicoba"}</small></span></button>`;
  }).join("");
  const acts = history.length ? history.slice(0, 4).map(x => `<div class="activity"><span class="symbol">✓</span><div><b>${esc(x.jenis === "simulasi" ? "Simulasi TKA" : x.subjek)}</b><small>${esc(fmtDate(x.tanggal))} • ${esc(x.jumlah_soal)} soal</small></div><strong>${esc(x.nilai)}</strong></div>`).join("")
    : `<p class="muted">Belum ada aktivitas. Mulai latihan untuk melihat progresmu di sini.</p>`;
  return `${pw}<div class="welcome"><div><p class="eyebrow">RUANG LATIHAN TKA</p><h1>Halo, ${esc(user.nama)}! 👋</h1><p>Persiapkan diri menghadapi Tes Kompetensi Akademik dengan berlatih secara terarah. Pilih subjek, kerjakan soal, dan evaluasi hasil belajarmu.</p>${isGuru ? `<button data-go="report">Lihat laporan nilai　→</button>` : `<button data-go="subjects">Mulai latihan　→</button>`}</div><div class="welcomeart">▤</div></div>
<div class="stats"><div class="stat"><span>Total latihan</span><strong>${isGuru ? "—" : history.length}</strong><small>Tersimpan di server</small></div><div class="stat"><span>Nilai rata-rata</span><strong>${isGuru ? "—" : avgOf(history)}</strong><small>Seluruh sesi</small></div><div class="stat"><span>Subjek tersedia</span><strong>${subjects.length}</strong><small>Bidang kompetensi TJKT</small></div><div class="stat"><span>Durasi simulasi</span><strong>${SIM.minutes} <small>menit</small></strong><small>${SIM.count} soal</small></div></div>
<div class="sectionhead"><h2>Jelajahi subjek</h2><button class="link" data-go="subjects">Lihat semua →</button></div>
<div class="dashgrid"><div class="panel"><div class="tiles">${tiles}</div></div><div class="panel"><div class="sectionhead"><h2>Aktivitas terbaru</h2></div>${acts}</div></div>`;
}

function topicsOf(subject) { return materi.filter(m => m.subjek === subject); }

function subjectPage() {
  const cards = subjects.map((s, i) => {
    const tp = topicsOf(s), total = tp.reduce((a, m) => a + m.jumlah, 0);
    const opts = [`<option value="">Semua submateri (${total} soal)</option>`]
      .concat(tp.map(m => m.jumlah >= PRACTICE.minSub
        ? `<option value="${esc(m.submateri)}">${esc(m.submateri)} (${m.jumlah})</option>`
        : `<option value="${esc(m.submateri)}" disabled>${esc(m.submateri)} (${m.jumlah} soal, minimal ${PRACTICE.minSub})</option>`)).join("");
    return `<article class="subjectcard"><div class="subjecttop"><span class="symbol">${icons[i]}</span><span class="pill">SUBJEK ${String(i + 1).padStart(2, "0")}</span></div><h3>${esc(s)}</h3><p>Latih pemahaman konsep dan kompetensi pada bidang ini.</p><select class="subselect" data-sel="${i}" aria-label="Pilih submateri">${opts}</select><button class="secondary" data-subject="${esc(s)}" data-idx="${i}">Pilih subjek →</button></article>`;
  }).join("");
  return `<div class="pagehead"><div><p class="eyebrow">BANK LATIHAN</p><h1>Soal per Subjek</h1><p>Pilih bidang dan, jika perlu, submateri. Sesi berisi hingga ${PRACTICE.count} soal selama ${PRACTICE.minutes} menit.</p></div><span class="chip">◷ ${PRACTICE.count} soal / ${PRACTICE.minutes} menit</span></div><div class="subjectgrid">${cards}</div>`;
}

/* ---------- Materi (bacaan) ----------
   Isi halaman ada di materi/fragment.html + materi/js/*.js. Berkas dimuat saat menu Materi pertama kali dibuka. */
const MATERI_BASE = "materi/";
let materiAssets = null, materiHtml = null;
function loadMateriAssets() {
  if (materiAssets) return materiAssets;
  const css = f => new Promise((ok, no) => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = MATERI_BASE + f; l.onload = ok; l.onerror = () => no(Error("Gagal memuat " + f)); document.head.appendChild(l); });
  const js = f => new Promise((ok, no) => { const e = document.createElement("script"); e.src = MATERI_BASE + f; e.onload = ok; e.onerror = () => no(Error("Gagal memuat " + f)); document.head.appendChild(e); });
  const chain = (list, fn) => list.reduce((p, f) => p.then(() => fn(f)), Promise.resolve());   // skrip dimuat berurutan
  materiAssets = Promise.all([css("css/materi-profesi.css"), css("css/materi-k3lh.css")])
    .then(() => css("css/materi-embed.css"))
    .then(() => chain(["js/profesi-data.js", "js/materi-profesi.js", "js/k3lh-data.js", "js/materi-k3lh.js", "js/materi-switch.js"], js))
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
  const rows = (r.nilai_terbaru || []).map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.nama)}</td><td>${esc(x.kelas)}</td><td>${x.jenis === "simulasi" ? "Simulasi" : "Latihan"}</td><td>${esc(x.jenis === "simulasi" ? "Semua subjek" : x.subjek)}</td><td>${esc(x.jumlah_benar)}/${esc(x.jumlah_soal)}</td><td><span class="score">${esc(x.nilai)}</span></td><td>${esc(fmtDate(x.tanggal))}</td></tr>`).join("");
  return `${head}<div class="stats"><div class="stat"><span>Jumlah percobaan</span><strong>${r.total_percobaan}</strong></div><div class="stat"><span>Nilai rata-rata</span><strong>${r.rata_rata}</strong></div><div class="stat"><span>Nilai tertinggi</span><strong>${r.nilai_tertinggi}</strong></div><div class="stat"><span>Sumber data</span><strong style="font-size:16px">Database</strong></div></div>
<div class="sectionhead"><h2>Ringkasan per kelas</h2></div><div class="tablewrap" style="margin-bottom:20px"><table><thead><tr><th>KELAS</th><th>PERCOBAAN</th><th>RATA-RATA</th><th>TERTINGGI</th></tr></thead><tbody>${kelasRows || `<tr><td colspan="4">Belum ada data.</td></tr>`}</tbody></table></div>
<div class="sectionhead"><h2>100 nilai terbaru</h2></div><div class="tablewrap"><table><thead><tr><th>NO</th><th>NAMA</th><th>KELAS</th><th>JENIS</th><th>SUBJEK</th><th>BENAR</th><th>NILAI</th><th>TANGGAL</th></tr></thead><tbody>${rows || `<tr><td colspan="8">Belum ada data.</td></tr>`}</tbody></table></div>`;
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
function start(type, subject, sub) {
  if (user.role !== "siswa") { toast("Akun guru tidak mengerjakan latihan."); return; }
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

function normalizeQuestion(q) {
  const letters = ["A", "B", "C", "D", "E"];
  const blank = t => { t = String(t == null ? "" : t).trim(); return !t || /^[—–-]$/.test(t); };   // "—" = opsi kosong
  const opts = letters.map(l => ({ l, t: q["opsi_" + l.toLowerCase()] })).filter(o => !blank(o.t));
  return { id: q.question_id, tipe: q.tipe || "pg", text: q.stimulus_isi_soal || "Soal", opts, sub: q.sub_subjek || "", pus: /pusmendik/i.test(q.asal_data || "") };
}
function buildAttempt(d, answers = {}, index = 0) {
  const isSim = d.jenis === "simulasi";
  return { id: d.attempt_id, type: isSim ? "simulasi" : "latihan", subject: isSim ? null : d.subjek, sub: d.sub_subjek || "",
    questions: (d.questions || []).map(normalizeQuestion), answers, index, endAt: new Date(d.batas_waktu).getTime() };
}
function saveAttempt() { if (attempt) store("tka_attempt", { id: attempt.id, answers: attempt.answers, index: attempt.index }); }

function begin(type, subject, sub) {
  toast("Menyiapkan soal…");
  api(type === "simulasi" ? "startSimulation" : "startPractice", { subjek: subject, sub_subjek: sub || "" })
    .then(d => { attempt = buildAttempt(d); saveAttempt(); go("quiz"); startTimer(); })
    .catch(e => toast(e.message));
}
function restoreAttempt() {
  const saved = load("tka_attempt");
  if (!saved || !user || user.role !== "siswa" || user.wajib_ganti_password) return Promise.resolve(false);
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
  toast("Mengirim jawaban…");
  api("finishAttempt", { attempt_id: a.id, answers: a.answers })
    .then(d => {
      result = { nilai: d.nilai, benar: d.jumlah_benar, total: d.jumlah_soal, expired, subject: a.subject, type: a.type };
      history.unshift({ jenis: d.jenis, subjek: d.subjek, sub_subjek: d.sub_subjek, jumlah_benar: d.jumlah_benar, jumlah_soal: d.jumlah_soal, nilai: d.nilai, tanggal: d.tanggal });
      attempt = null; store("tka_attempt", null);
      go("result");
    })
    .catch(e => {
      toast("Pengiriman gagal: " + e.message);
      if (/waktu|ditutup|kedaluwarsa/i.test(e.message)) { attempt = null; store("tka_attempt", null); go("home"); }
      else if (a === attempt) startTimer();
    })
    .finally(() => { finishing = false; });
}

function resultPage() {
  const r = result || { nilai: "—", benar: "—", total: "—" };
  return `<div class="panel result"><div class="circle">${esc(r.nilai)}</div><p class="eyebrow">SESI SELESAI</p><h2>${r.expired ? "Waktu pengerjaan habis" : "Latihan selesai!"}</h2><p class="muted">Jawaban benar ${esc(r.benar)} dari ${esc(r.total)} soal pada ${esc(r.subject || "Simulasi TKA")}.</p><p class="muted">Nilai sudah tersimpan di database.</p><div class="actions"><button class="primary" data-go="subjects">Latihan subjek lain</button><button class="secondary" data-go="home">Kembali ke beranda</button></div></div>`;
}

/* ---------- render & event ---------- */
function render() {
  const c = $("#content");
  const views = { home, subjects: subjectPage, materi: materiPage, simulation, report: reportPage, import: importStudentsPage, quiz, result: resultPage };
  c.innerHTML = (views[page] || resultPage)();
  if (page === "materi") mountMateri();

  const cpf = $("#changepasswordform");
  if (cpf) cpf.onsubmit = e => {
    e.preventDefault();
    const a = $("#newpassword").value, b = $("#confirmpassword").value, err = $("#passworderr");
    const fail = m => { err.textContent = m; err.classList.remove("hidden"); };
    err.classList.add("hidden");
    if (a.length < 8) return fail("Password baru minimal 8 karakter.");
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
  api("getDashboard").then(d => login({ ...saved, wajib_ganti_password: d.wajib_ganti_password, history: d.history })).catch(() => { clearSession(); showLogin(); });
}
})();
