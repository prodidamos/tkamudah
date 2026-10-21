/* Render halaman Materi 1. Tidak perlu diubah untuk sekadar mengganti isi:
   edit js/profesi-data.js. Skrip ini hanya memakai elemen ber-atribut data-mp-*. */
(window.MP_MOUNTS = window.MP_MOUNTS || []).push(function (root, opts) {
  if (!window.MP_PROFESI) return;
  var B = (opts && opts.base) || "";   // awalan folder gambar, mis. "materi/"

  var P = window.MP_PROFESI, T = window.MP_TAHAP;
  var $ = function (s) { return root.querySelector(s); };
  var tahapNama = {}; T.forEach(function (t) { tahapNama[t.id] = t.nama; });

  var ico = {
    tugas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3.5 17.2a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.1-5.4l-2.4 2.4-2.2-.6-.6-2.2 2.4-2.4z"/></svg>',
    alat:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8.2 4.5-.1-2 1.7-1.3-1.8-3.1-2 .8a7.6 7.6 0 0 0-1.7-1l-.3-2.1H9.9l-.3 2.1c-.6.2-1.2.6-1.7 1l-2-.8-1.8 3.1L5.8 11l-.1 2 .1 0-1.7 1.3 1.8 3.1 2-.8c.5.4 1.1.8 1.7 1l.3 2.1h4.2l.3-2.1c.6-.2 1.2-.6 1.7-1l2 .8 1.8-3.1-1.7-1.3z" fill-rule="evenodd"/></svg>',
    hasil: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm-1.2 13.2L6.6 12l1.4-1.4 2.8 2.8 5.2-5.2 1.4 1.4-6.6 6.6z"/></svg>'
  };

  /* ---------- tombol tahap (juga berfungsi sebagai filter) ---------- */
  var steps = $("[data-mp-steps]");
  steps.innerHTML = '<button type="button" class="mp-step is-on" data-t="semua"><span class="mp-step__n">∗</span><span class="mp-step__t">Semua</span><span class="mp-step__c">' + P.length + ' profesi</span></button>' +
    T.map(function (t, i) {
      var n = P.filter(function (p) { return p.bidang === t.id; }).length;
      return '<button type="button" class="mp-step" data-t="' + t.id + '"><span class="mp-step__n">' + (i + 1) + '</span><span class="mp-step__t">' + t.nama + '</span><span class="mp-step__c">' + n + ' profesi</span></button>';
    }).join("");

  /* ---------- deretan avatar ---------- */
  $("[data-mp-avatars]").innerHTML = P.map(function (p) {
    return '<a class="mp-av" href="#prof-' + p.no + '" title="' + p.no + '. ' + p.nama + '" style="--c:' + p.warna + '"><img src="' + B + p.avatar + '" alt="' + p.nama + '" width="60" height="60" loading="lazy"></a>';
  }).join("");

  /* ---------- kartu profesi ---------- */
  $("[data-mp-grid]").innerHTML = P.map(function (p) {
    return '<article class="mp-card" id="prof-' + p.no + '" data-t="' + p.bidang + '" style="--c:' + p.warna + ';--bg:' + p.latar + '">' +
      '<figure class="mp-card__fig"><img src="' + B + p.gambar + '" alt="Ilustrasi ' + p.nama + '" width="286" height="136" loading="lazy"><span class="mp-card__no">' + p.no + '</span><figcaption class="mp-card__tag">' + tahapNama[p.bidang] + '</figcaption></figure>' +
      '<div class="mp-card__body">' +
        '<h3 class="mp-card__h">' + p.nama + '</h3><p class="mp-card__sub">' + p.sebutan + '</p>' +
        '<p class="mp-card__sum">' + p.ringkas + '</p>' +
        '<dl class="mp-facts">' +
          fact("tugas", "Tugas Utama", p.tugas) + fact("alat", "Alat Kerja", p.alat) + fact("hasil", "Hasil Kerja", p.hasil) +
        '</dl></div></article>';
  }).join("");
  function fact(k, l, v) {
    return '<div class="mp-fact mp-fact--' + k + '"><dt>' + ico[k] + '<span>' + l + '</span></dt><dd>' + v + '</dd></div>';
  }

  /* ---------- tabel ringkasan ---------- */
  $("[data-mp-table]").innerHTML = P.map(function (p) {
    return '<tr style="--c:' + p.warna + '"><th scope="row"><a href="#prof-' + p.no + '"><b>' + p.no + '</b>' + p.nama + '</a></th>' +
      '<td data-l="Tahap">' + tahapNama[p.bidang] + '</td><td data-l="Tugas Utama">' + p.tugas + '</td><td data-l="Alat Kerja">' + p.alat + '</td><td data-l="Hasil Kerja">' + p.hasil + '</td></tr>';
  }).join("");

  /* ---------- filter ---------- */
  var info = $("[data-mp-info]"), cards = root.querySelectorAll(".mp-card"), btns = steps.querySelectorAll(".mp-step");
  function filter(id) {
    btns.forEach(function (b) { b.classList.toggle("is-on", b.dataset.t === id); b.setAttribute("aria-pressed", b.dataset.t === id); });
    cards.forEach(function (c) { c.hidden = !(id === "semua" || c.dataset.t === id); });
    var t = T.filter(function (x) { return x.id === id; })[0];
    info.textContent = t ? t.info : "Satu proyek jaringan melibatkan banyak peran. Pilih salah satu tahap untuk melihat profesi di dalamnya.";
  }
  steps.addEventListener("click", function (e) {
    var b = e.target.closest(".mp-step"); if (b) filter(b.dataset.t);
  });
  filter("semua");

  /* ---------- lompat ke kartu dari avatar / tabel ---------- */
  root.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#prof-"]'); if (!a) return;
    var el = document.getElementById(a.getAttribute("href").slice(1)); if (!el) return;
    e.preventDefault();
    if (el.hidden) filter("semua");
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    el.classList.remove("is-flash"); void el.offsetWidth; el.classList.add("is-flash");
  });
});
