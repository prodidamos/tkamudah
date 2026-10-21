/* Render Materi 2 (K3LH dan Budaya Kerja). Isi diedit di js/k3lh-data.js. */
(window.MP_MOUNTS = window.MP_MOUNTS || []).push(function (rootAll) {
  var root = rootAll.querySelector("#materi-2");
  if (!root || !window.K3_HIERARKI) return;
  var $ = function (s) { return root.querySelector(s); };

  var I = {
    helm:    '<path d="M8 30a16 16 0 0 1 32 0z"/><path d="M5 35h38"/><path d="M24 14v9"/>',
    glove:   '<path d="M15 40V22a2.5 2.5 0 0 1 5 0V13a2.5 2.5 0 0 1 5 0v-1a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v15l3-3a2.5 2.5 0 0 1 3.5 3.5L35 40z"/>',
    harness: '<circle cx="24" cy="9" r="4"/><path d="M15 18h18M17 18l14 18M31 18 17 36M17 36h14M24 18v-5"/>',
    esd:     '<rect x="6" y="14" width="22" height="11" rx="5.5"/><path d="M28 19.5c8 0 10 3 10 8v6M31 33h14M33.5 37h9M36 41h4"/>',
    apar:    '<rect x="15" y="17" width="17" height="25" rx="4"/><path d="M19 17v-5h9v5M28 12h7l4 4M37 16v9"/>',
    lock:    '<rect x="11" y="21" width="26" height="19" rx="3"/><path d="M16 21v-6a8 8 0 0 1 16 0v6M24 29v5"/>'
  };
  var svg = function (k) { return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[k] + '</svg>'; };

  /* Hierarki */
  var W = [100, 84, 68, 52, 38];
  $("[data-k3-ladder]").innerHTML = window.K3_HIERARKI.map(function (h, i) {
    return '<li class="k3-rung" style="--w:' + W[i] + '%;--i:' + i + '"><div class="k3-rung__bar"><span class="k3-rung__n">' + (i + 1) + '</span><b>' + h.nama + '</b></div>' +
      '<div class="k3-rung__txt"><p>' + h.def + '</p><p class="k3-rung__ex"><i>Contoh di TJKT</i>' + h.contoh + '</p></div></li>';
  }).join("");

  /* Perlengkapan */
  $("[data-k3-apd]").innerHTML = window.K3_APD.map(function (a) {
    return '<article class="k3-gear"><div class="k3-gear__ic">' + svg(a.ikon) + '</div><h3>' + a.nama + '</h3><p>' + a.def + '</p><p class="k3-gear__use"><i>Dipakai saat</i>' + a.saat + '</p></article>';
  }).join("");

  /* 5R */
  $("[data-k3-5r]").innerHTML = window.K3_5R.map(function (r, i) {
    return '<article class="k3-r"><div class="k3-r__top"><span class="k3-r__l">' + r.r.charAt(0) + '</span><div><h3>' + r.r + '</h3><span class="k3-r__key">' + r.kunci + '</span></div></div>' +
      '<p>' + r.def + '</p><p class="k3-r__ex"><i>Contoh</i>' + r.contoh + '</p><p class="k3-r__bad"><i>Keliru</i>' + r.keliru + '</p></article>';
  }).join("");

  /* Kasus */
  $("[data-k3-kasus]").innerHTML = window.K3_KASUS.map(function (k, i) {
    return '<article class="k3-case"><header><span class="k3-case__tag">' + k.tag + '</span><h3>' + k.judul + '</h3></header>' +
      '<p class="k3-case__s">' + k.situasi + '</p>' +
      '<p class="k3-case__ok"><i>Tindakan tepat</i>' + k.tepat + '</p>' +
      '<p class="k3-case__no"><i>Yang keliru</i>' + k.keliru + '</p></article>';
  }).join("");

  var nk = $("[data-k3-n=kasus]"); if (nk) nk.textContent = window.K3_KASUS.length;

  /* Kata kunci */
  $("[data-k3-kunci]").innerHTML = window.K3_KUNCI.map(function (k) {
    return '<tr><td>' + k[0] + '</td><th scope="row">' + k[1] + '</th></tr>';
  }).join("");

  /* Glosarium + pencarian */
  var gl = $("[data-k3-glos]"), q = $("[data-k3-q]"), empty = $("[data-k3-empty]");
  function drawG(f) {
    f = (f || "").toLowerCase();
    var rows = window.K3_ISTILAH.filter(function (x) { return !f || (x.t + " " + x.d + " " + x.g).toLowerCase().indexOf(f) > -1; });
    gl.innerHTML = rows.map(function (x) {
      return '<tr><th scope="row">' + x.t + '</th><td data-l="Kelompok"><span class="k3-pill">' + x.g + '</span></td><td data-l="Arti">' + x.d + '</td></tr>';
    }).join("");
    empty.hidden = rows.length > 0;
  }
  drawG();
  q.addEventListener("input", function () { drawG(q.value); });

  /* Daftar isi: tandai topik yang sedang dibaca */
  var links = root.querySelectorAll(".k3-toc a"), secs = [];
  links.forEach(function (a) { var s = document.getElementById(a.getAttribute("href").slice(1)); if (s) secs.push([a, s]); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (l) { l.classList.remove("is-on"); }); secs.forEach(function (p) { if (p[1] === e.target) p[0].classList.add("is-on"); }); } });
    }, { rootMargin: "-30% 0px -60% 0px" });
    secs.forEach(function (p) { io.observe(p[1]); });
  }
});
