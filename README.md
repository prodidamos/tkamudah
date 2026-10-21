# Latihan TKA TJKT — Frontend

Frontend statis HTML/CSS/JavaScript untuk GitHub Pages. Semua soal, penilaian, riwayat, dan laporan berasal dari backend Google Apps Script (`Code.gs`). **Tidak ada mode demo dan tidak ada kunci jawaban di frontend.**

## Berkas (aman di-commit)
- `index.html`, `styles.css`, `app.js` — antarmuka.
- `config.js` — `apiUrl` Web App Apps Script dan `demoMode: false`.
- `question-bank.js` — hanya indeks materi (subjek, submateri, jumlah **soal aktif**) untuk dropdown dan halaman Latihan. Dibuat dari `soal kumpulan tka tjkt 11.csv`.
- `materi/` — halaman bacaan Materi 1 (Profesi dan Dunia Kerja TJKT) dan Materi 2 (K3LH dan Budaya Kerja), dimuat oleh menu **Materi**. Lihat `materi/PANDUAN.md`.

## Berkas privat (JANGAN di-commit ke repository publik)
- `Code.gs` — backend; berisi ID spreadsheet.
- `BankSoal-import.csv` — isi sheet `BankSoal`; berisi kunci jawaban.
- CSV siswa untuk impor — berisi password awal; hapus setelah impor.

## Kontrak API (POST `text/plain`, respons `{ ok: true, ... }` atau `{ ok: false, error }`)
`login`, `logout`, `getDashboard`, `getHistory`, `getReport`, `startPractice`, `startSimulation`, `getAttempt`, `finishAttempt`, `changePassword`, `importStudents`.

Format jawaban pada `finishAttempt` (`answers` = objek `{ question_id: jawaban }`):
- PG: `"B"`
- PGK MCMA / Multi Jawaban: `["A","C"]`
- PGK Kategori: `{ "A": "BENAR", "B": "SALAH", "C": "BENAR" }`

Jenis soal (`tipe`: `pg` / `multi` / `kategori`) ditentukan server dari kunci dan label `bentuk_soal` (semua varian penulisan label dikenali). Penilaian semua-atau-tidak-sama-sekali per soal.

## Perilaku
- Wajib ganti password awal; sesi bertahan saat halaman dimuat ulang (`sessionStorage`).
- Latihan per subjek: submateri opsional. Submateri dengan kurang dari 5 soal tampil nonaktif di dropdown (backend menolak < 5).
- Pengiriman jawaban diterima sampai **90 detik** setelah batas waktu (`SUBMIT_GRACE_SECONDS`), sehingga pengiriman otomatis saat waktu habis tetap dinilai.
- Opsi berisi "—" dianggap kosong dan tidak ditampilkan.
- Laporan guru: filter kelas dan jenis, ringkasan per kelas, 100 nilai terbaru.

## Memperbarui bank soal
1. Dari CSV baru buat ulang `BankSoal-import.csv` dan `question-bank.js` (id soal = `Q` + hash dari nomor soal asli dan asal data, jadi stabil selama keduanya tidak berubah; kolom `aktif` = FALSE menyembunyikan soal tanpa menghapusnya).
2. **Impor di Apps Script hanya menambah `question_id` baru dan tidak mengubah soal yang sudah ada.** Untuk memperbarui soal lama: di sheet `BankSoal` hapus semua baris data (pertahankan baris judul), tempel isi `BankSoal-import.csv`, lalu jalankan `clearBankCache()`.
3. Jalankan `auditBank()` di editor Apps Script dan pastikan "Tidak ada masalah pada data soal".
4. Commit hanya `question-bank.js` ke repository `tkamudah`.
