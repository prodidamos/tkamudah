/* Pengalih antar-materi dalam satu halaman.
   Tambah materi baru: (1) tambah <section class="mp-materi" id="materi-N" hidden> di fragment.html,
   (2) hilangkan atribut disabled pada tombol nomor N di .mp-switch. */
(window.MP_MOUNTS = window.MP_MOUNTS || []).push(function (root, opts) {
  var useHash = !opts || opts.hash !== false;
  var secs = root.querySelectorAll(".mp-materi"), btns = root.querySelectorAll(".mp-sw[data-m]");
  var titles = { 1: "Materi 1 — Profesi dan Dunia Kerja TJKT", 2: "Materi 2 — K3LH dan Budaya Kerja" };
  function show(n, scroll) {
    var ok = false;
    secs.forEach(function (s) { var on = s.id === "materi-" + n; s.hidden = !on; ok = ok || on; });
    if (!ok) return show(1, scroll);
    btns.forEach(function (b) { var on = b.dataset.m == n; b.classList.toggle("is-on", on); if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    if (useHash && titles[n]) document.title = titles[n];
    if (scroll) root.scrollIntoView({ block: "start" });
  }
  function fromHash(scroll) {
    var m = useHash && /^#materi-(\d+)/.exec(location.hash); show(m ? m[1] : 1, scroll && !!m);
  }
  btns.forEach(function (b) {
    b.addEventListener("click", function (e) {
      if (b.disabled) return; e.preventDefault();
      if (useHash) history.replaceState(null, "", "#materi-" + b.dataset.m);
      show(b.dataset.m, true);
    });
  });
  root.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-go]"); if (!a) return;
    e.preventDefault(); if (useHash) history.replaceState(null, "", "#materi-" + a.dataset.go); show(a.dataset.go, true);
  });
  if (useHash) window.addEventListener("hashchange", function () { if (root.isConnected) fromHash(true); });
  fromHash(false);
});

/* Memasang semua modul ke elemen .mp. opts: { base: "materi/", hash: true|false } */
window.MP_mountAll = function (root, opts) {
  opts = opts || {};
  (window.MP_MOUNTS || []).forEach(function (fn) { fn(root, opts); });
  if (opts.base) root.querySelectorAll('img[src^="img/"]').forEach(function (i) { i.setAttribute("src", opts.base + i.getAttribute("src")); });
};
