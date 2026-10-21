# Materi (bacaan) di dalam aplikasi

Menu **Materi** memuat tiga berkas saat pertama kali dibuka:

- `materi/fragment.html` — isi Materi 1–10 (satu `<section class="mp-materi" id="materi-N">` per materi).
- `materi/materi.css` — semua gaya (di bawah `.mp`, aman dari CSS aplikasi). Warna dan font: variabel di bagian atas berkas.
- `materi/materi.js` — pengalih antar-materi dan judul tab. Judul tiap materi ada di objek `titles`.
- `materi/img/` — gambar karakter Materi 1.

Menambah materi baru: tambah `<section class="mp-materi" id="materi-N" hidden>` di `fragment.html`, aktifkan tombol nomor N di `.mp-switch` (hapus `disabled` dan isi nama), tambah judulnya di `titles`.
