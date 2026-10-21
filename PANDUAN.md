# Materi (bacaan) di dalam aplikasi

Menu **Materi** memuat `materi/fragment.html` dan skrip di `materi/js/` saat pertama kali dibuka.

- **Mengubah teks Materi 1**: `materi/js/profesi-data.js`.
- **Mengubah teks Materi 2**: bacaan di `materi/fragment.html` (bagian `id="materi-2"`); daftar hierarki, perlengkapan, 5R, situasi kerja, dan istilah di `materi/js/k3lh-data.js`.
- **Warna dan font**: variabel di atas `materi/css/materi-profesi.css`; penyesuaian khusus aplikasi di `materi/css/materi-embed.css`.
- **Menambah Materi 3–10**: tambah `<section class="mp-materi" id="materi-N" hidden>` di `fragment.html`, lalu hapus `disabled` pada tombol nomor N di `.mp-switch`.
- Semua class dan CSS berada di bawah `.mp`, tata letak mengikuti lebar area materi (container query), sehingga aman dari CSS aplikasi.
