# Latihan TKA TJKT — Frontend

Frontend statis HTML/CSS/JavaScript. Cocok untuk pratinjau dan dasar integrasi GitHub Pages.

## Jalankan pratinjau
Buka `index.html` di browser.
- Siswa demo: `demo` / `1234`
- Guru demo: `guru` / `1234`

Mode pratinjau memakai soal contoh sintetis; bukan bank soal resmi dan nilainya tidak disimpan di database.

## Hubungkan backend
Setelah Apps Script Web App dibuat dan diuji, isi `config.js`:

```js
window.TKA_CONFIG = { apiUrl: "URL_WEB_APP_APPS_SCRIPT", demoMode: false };
```

Kontrak action frontend saat ini: `login`, `logout`, `startPractice`, `startSimulation`, `finishAttempt`, dan `getReport`. Sesuaikan `app.js` dengan API backend final jika nama action/payload berbeda.

## Penting
- Ini belum menjadi sistem produksi dan belum terhubung ke Google Spreadsheet.
- Jangan menaruh kunci jawaban bank soal di JavaScript frontend.
- Sebelum digunakan siswa sungguhan, hubungkan backend, uji CORS, autentikasi, batas waktu, penilaian server, dan akses guru.
- Jawaban pratinjau hanya berada di memori halaman dan bisa hilang jika halaman dimuat ulang.


## Wajib ganti password pada Home
- Jika respons login backend mengandung `wajib_ganti_password: true` (atau `must_change_password: true`), formulir ganti password tampil di Home.
- Navigasi ke latihan dan simulasi ditahan sampai perubahan berhasil.
- Frontend memanggil endpoint Apps Script `changePassword` dengan `{ new_password, confirm_password }` beserta token sesi. Backend wajib memvalidasi sesi dan status akun, menyimpan hash+salt password baru, lalu mengubah `wajib_ganti_password` menjadi `FALSE`.
- Frontend tidak menyimpan password baru dan tidak dapat mengubah password saat backend belum dikonfigurasi.
- Login backend menerima `{ username, password }` dan sebaiknya mengembalikan `token`, `nama`, `role`, serta `wajib_ganti_password`.
- Ini perubahan frontend saja; backend Apps Script harus menerapkan endpoint dan aturan akses yang sama.


## Pembaruan bank soal offline
- `question-bank.js` berisi 570 baris dari `soal kumpulan tka tjkt 8.csv`, termasuk opsi A–E.
- Mode offline mengambil soal dari bank CSV, bukan lagi 10 soal contoh.
- Simulasi offline berisi 25 soal acak dan selalu menyertakan 4 soal berlabel `Pusmendik (6 soal)` dari CSV.
- Untuk latihan per subjek, soal dipilih acak dari kolom `MATERI UTAMA`.
- Ini tetap mode demo lokal: data/nilai tersimpan hanya pada sesi browser dan bukan bukti ujian yang aman. Kunci jawaban berada di file frontend sehingga jangan gunakan mode ini untuk ujian berpengawasan atau penilaian resmi.


## Pembaruan UI
- Menu Materi mengelompokkan submateri yang tercatat pada bank soal CSV.
- Beranda menampilkan nilai terakhir untuk setiap subjek yang pernah dicoba pada sesi browser saat ini.
- Nilai lokal demo menggunakan sessionStorage, sehingga bukan arsip permanen dan tidak tersinkron ke guru.


## Bank soal terbaru
Frontend ini memuat `question-bank.js` yang dibangun dari `soal kumpulan tka tjkt 10.csv` (678 baris). Untuk memperbarui bank soal berikutnya, regenerasi file `question-bank.js` dari CSV baru dengan mempertahankan nama file ini, lalu commit ke repository `tkamudah`.
