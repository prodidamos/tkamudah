/* =====================================================================
   DATA MATERI 2 — K3LH DAN BUDAYA KERJA
   Definisi memakai kalimat yang sama dengan bank soal agar cocok
   saat siswa mengerjakan soal "istilah yang paling tepat" dan Benar/Salah.
   ===================================================================== */

/* Hierarki pengendalian risiko: urut dari paling efektif ke paling akhir */
window.K3_HIERARKI = [
  { nama: "Eliminasi", def: "Menghilangkan sumber bahaya dari pekerjaan dan merupakan pengendalian yang paling efektif.",
    contoh: "Merancang jalur kabel agar pekerjaan bisa dilakukan dari darat, sehingga tidak perlu naik ke ketinggian." },
  { nama: "Substitusi", def: "Mengganti bahan, alat, atau metode berbahaya dengan alternatif yang lebih aman.",
    contoh: "Mengganti bahan pembersih yang berbahaya dengan bahan yang aman dan sesuai petunjuk." },
  { nama: "Pengendalian Teknik", def: "Mengisolasi atau mengurangi bahaya melalui desain, pelindung, ventilasi, pembatas, atau sistem teknis.",
    contoh: "Memasang pembatas area kerja, pelindung perangkat, dan ventilasi pada ruang perangkat." },
  { nama: "Pengendalian Administratif", def: "Mengurangi paparan melalui SOP, pelatihan, tanda, jadwal, izin kerja, dan pengawasan.",
    contoh: "Menyusun SOP kerja di ketinggian, memasang rambu, dan mewajibkan izin kerja." },
  { nama: "APD", def: "Perlengkapan pelindung terakhir yang dipakai pekerja sesuai risiko dan tidak menghilangkan sumber bahaya.",
    contoh: "Helm, sarung tangan kerja, dan safety harness dipakai saat bahaya belum bisa dihilangkan." }
];

/* Peralatan keselamatan. 'ikon' = kunci pada objek ikon di materi-k3lh.js */
window.K3_APD = [
  { ikon: "helm", nama: "Helm Keselamatan", def: "Pelindung kepala terhadap benturan atau benda jatuh.", saat: "Bekerja di tiang, tangga, atau area dengan risiko benda jatuh." },
  { ikon: "glove", nama: "Sarung Tangan Kerja", def: "Pelindung tangan yang dipilih sesuai risiko mekanis, listrik, panas, atau bahan tertentu.", saat: "Menangani kabel dan perangkat; pilih jenis sesuai risikonya." },
  { ikon: "harness", nama: "Safety Harness", def: "Sistem penahan tubuh untuk mengurangi risiko jatuh saat bekerja di ketinggian dengan titik tambat yang benar.", saat: "Bekerja di ketinggian, misalnya tiang 7 meter: pakai full-body harness dengan anchor yang benar." },
  { ikon: "esd", nama: "ESD Wrist Strap", def: "Alat pengendali muatan statis saat menangani komponen elektronik dengan titik grounding yang sesuai.", saat: "Menangani komponen elektronik yang peka terhadap listrik statis." },
  { ikon: "apar", nama: "APAR", def: "Alat pemadam api ringan yang dipilih dan digunakan sesuai kelas kebakaran serta kondisi aman.", saat: "Api kecil di awal kebakaran. Pilih APAR yang cocok dengan kelas kebakarannya." },
  { ikon: "lock", nama: "Lockout/Tagout", def: "Prosedur mengisolasi sumber energi dan memberi tanda agar peralatan tidak diaktifkan selama pekerjaan.", saat: "Memperbaiki atau merawat peralatan yang bisa menyala tiba-tiba." }
];

/* Budaya kerja 5R */
window.K3_5R = [
  { r: "Ringkas", def: "Memilah barang yang diperlukan dan menyingkirkan yang tidak diperlukan dari area kerja.", kunci: "memilah", contoh: "Menyingkirkan kabel dan alat yang tidak dipakai dari meja praktik.", keliru: "Hanya membersihkan, atau membuang alat yang masih dipakai." },
  { r: "Rapi", def: "Menata barang pada tempat yang jelas agar mudah diambil, digunakan, dan dikembalikan.", kunci: "menata + label", contoh: "Tang crimping dikembalikan ke tempat berlabel setelah dipakai.", keliru: "Semua alat satu kardus tanpa label, atau kabel ditumpuk di pintu." },
  { r: "Resik", def: "Membersihkan area dan peralatan sambil memeriksa adanya kondisi tidak normal.", kunci: "membersihkan + memeriksa", contoh: "Membersihkan area praktik dan menemukan kabel mengelupas saat membersihkan.", keliru: "Meninggalkan sisa potongan kabel di lantai setelah praktik." },
  { r: "Rawat", def: "Menstandarkan kondisi ringkas, rapi, dan resik agar dipertahankan.", kunci: "menstandarkan", contoh: "Membuat standar tata letak dan jadwal pemeriksaan area kerja.", keliru: "Merapikan sekali lalu dibiarkan kembali berantakan." },
  { r: "Rajin", def: "Membiasakan disiplin menjalankan standar secara konsisten dan terus-menerus.", kunci: "disiplin konsisten", contoh: "Menjalankan standar setiap hari, bukan hanya saat ada penilaian.", keliru: "Mengabaikan kebiasaan harian." }
];

/* Situasi kerja nyata dan tindakan yang tepat */
window.K3_KASUS = [
  { judul: "Target waktu terlambat", tag: "Profesional",
    situasi: "Pekerjaan instalasi tidak selesai sesuai target waktu.",
    tepat: "Melaporkan kendala, menyesuaikan rencana, dan tetap mengikuti SOP.",
    keliru: "Menyalahkan pelanggan, memalsukan laporan selesai, memakai alat rusak, atau melewati pengujian keselamatan." },
  { judul: "Hampir tersandung", tag: "Insiden",
    situasi: "Teknisi hampir tersandung tetapi tidak cedera.",
    tepat: "Ini near miss: tetap dilaporkan dan dianalisis.",
    keliru: "Menyembunyikannya, menganggapnya urusan pribadi, atau tidak mencatatnya." },
  { judul: "Kabel berserakan di ruangan", tag: "5R",
    situasi: "Di ruangan tertutup kabel berserakan dan peralatan tidak tertata sehingga berpotensi membuat orang tersandung.",
    tepat: "Menata kabel dengan cable management dan menjaga area kerja tetap rapi.",
    keliru: "Melepas kabel lalu menyeting ulang dengan kabel baru: tidak menyelesaikan masalah kerapian." },
  { judul: "Salah sambung berulang", tag: "5R",
    situasi: "Beberapa kali terjadi salah sambung kabel karena area kerja berantakan.",
    tepat: "Ketidakteraturan meningkatkan risiko salah sambung. Penataan dan pelabelan mengurangi kesalahan.",
    keliru: "Menyalahkan warna kabel, atau menambah kecepatan kerja tanpa mengubah area." },
  { judul: "Alat dikembalikan ke tempat acak", tag: "5R",
    situasi: "Pekerjaan berulang kali terlambat karena alat selalu dikembalikan ke lokasi berbeda.",
    tepat: "Menetapkan lokasi penyimpanan berlabel dan membiasakan pengembalian setelah dipakai.",
    keliru: "Membeli alat baru tiap hari, menghapus pencatatan inventaris, atau menyalahkan pengguna berikutnya." },
  { judul: "Sisa kabel ditinggal di lantai", tag: "Lingkungan",
    situasi: "Setelah praktik, siswa meninggalkan sisa potongan kabel di lantai. Pada kasus lain, tim membuang potongan kabel dan kemasan sembarangan setelah instalasi.",
    tepat: "Area menjadi tidak aman dan tidak tertib, perlu prosedur pembersihan setelah praktik. Pengelolaan lingkungan dan kerapian area kerja adalah bagian dari penyelesaian pekerjaan.",
    keliru: "Menganggap limbah hanya urusan petugas kebersihan, atau keselamatan selesai saat perangkat menyala." },
  { judul: "Patch cord rusak di rak alat", tag: "Budaya kerja",
    situasi: "Siswa menemukan kabel patch cord rusak di rak alat.",
    tepat: "Memberi label dan melaporkannya. Ini menunjukkan kepedulian pada mutu dan ketertiban kerja.",
    keliru: "Mengabaikan inventaris atau membiarkannya tetap di rak." },
  { judul: "Serah terima antar-shift", tag: "Profesional",
    situasi: "Teknisi shift malam sering tidak tahu perubahan konfigurasi yang dilakukan shift pagi.",
    tepat: "Menerapkan serah terima dan log perubahan yang terstandar.",
    keliru: "Meminta tiap shift mengingat sendiri, membatasi komunikasi, atau menghapus catatan perubahan." },
  { judul: "APD lengkap, SOP diabaikan", tag: "Profesional",
    situasi: "Teknisi memakai APD lengkap tetapi mengabaikan SOP pengujian.",
    tepat: "APD saja tidak cukup. Prosedur kerja dan verifikasi teknis tetap harus dipatuhi.",
    keliru: "Menganggap APD menggantikan SOP, atau SOP hanya untuk pemula." },
  { judul: "Pasang access point di tangga", tag: "Ketinggian",
    situasi: "Teknisi memasang access point di tangga dengan terburu-buru dan tanpa mengamankan tangga.",
    tepat: "Risiko jatuh meningkat. Pekerjaan dihentikan untuk mengamankan area dan memakai prosedur kerja di ketinggian.",
    keliru: "Menganggap kecepatan lebih penting, APD tidak perlu untuk pekerjaan singkat, atau insiden boleh diabaikan bila tak ada saksi." },
  { judul: "Konektor optik dibersihkan sembarangan", tag: "Alat & mutu",
    situasi: "Teknisi membersihkan konektor optik dengan bahan yang tidak sesuai dan tanpa mengikuti petunjuk.",
    tepat: "Konektor dapat rusak atau terkontaminasi sehingga hasil ukur dan keselamatan kerja terganggu.",
    keliru: "Menganggap tidak ada pengaruh pada hasil, atau daya optik pasti meningkat." },
  { judul: "Alat ukur jatuh, casing retak", tag: "Alat & mutu",
    situasi: "Alat ukur terjatuh, casing retak, tetapi alat masih menyala.",
    tepat: "Menghentikan penggunaan, melaporkan, dan meminta pemeriksaan sesuai prosedur.",
    keliru: "Tetap memakainya, menutup retakan dengan kertas, menghapus catatan insiden, atau membuka casing tanpa kewenangan." }
];

/* Glosarium: semua istilah yang dipakai soal */
window.K3_ISTILAH = [
  { t: "Bahaya", g: "Dasar", d: "Sumber, kondisi, atau tindakan yang berpotensi menimbulkan cedera, penyakit, kerusakan, atau pencemaran." },
  { t: "Near miss", g: "Dasar", d: "Kejadian hampir celaka tanpa cedera. Tetap perlu dilaporkan dan dianalisis." },
  { t: "Pelaporan Insiden", g: "Dasar", d: "Pencatatan kejadian, hampir celaka, penyebab, tindakan awal, dan tindak lanjut untuk mencegah pengulangan." },
  { t: "Eliminasi", g: "Hierarki", d: "Menghilangkan sumber bahaya dari pekerjaan dan merupakan pengendalian yang paling efektif." },
  { t: "Substitusi", g: "Hierarki", d: "Mengganti bahan, alat, atau metode berbahaya dengan alternatif yang lebih aman." },
  { t: "Pengendalian Teknik", g: "Hierarki", d: "Mengisolasi atau mengurangi bahaya melalui desain, pelindung, ventilasi, pembatas, atau sistem teknis." },
  { t: "Pengendalian Administratif", g: "Hierarki", d: "Mengurangi paparan melalui SOP, pelatihan, tanda, jadwal, izin kerja, dan pengawasan." },
  { t: "APD", g: "Hierarki", d: "Perlengkapan pelindung terakhir yang dipakai pekerja sesuai risiko dan tidak menghilangkan sumber bahaya." },
  { t: "Helm Keselamatan", g: "Perlengkapan", d: "Pelindung kepala terhadap benturan atau benda jatuh." },
  { t: "Sarung Tangan Kerja", g: "Perlengkapan", d: "Pelindung tangan yang dipilih sesuai risiko mekanis, listrik, panas, atau bahan tertentu." },
  { t: "Safety Harness", g: "Perlengkapan", d: "Sistem penahan tubuh untuk mengurangi risiko jatuh saat bekerja di ketinggian dengan titik tambat yang benar." },
  { t: "ESD Wrist Strap", g: "Perlengkapan", d: "Alat pengendali muatan statis saat menangani komponen elektronik dengan titik grounding yang sesuai." },
  { t: "APAR", g: "Perlengkapan", d: "Alat pemadam api ringan yang dipilih dan digunakan sesuai kelas kebakaran serta kondisi aman." },
  { t: "Lockout/Tagout", g: "Perlengkapan", d: "Prosedur mengisolasi sumber energi dan memberi tanda agar peralatan tidak diaktifkan selama pekerjaan." },
  { t: "Ringkas", g: "5R", d: "Memilah barang yang diperlukan dan menyingkirkan yang tidak diperlukan dari area kerja." },
  { t: "Rapi", g: "5R", d: "Menata barang pada tempat yang jelas agar mudah diambil, digunakan, dan dikembalikan." },
  { t: "Resik", g: "5R", d: "Membersihkan area dan peralatan sambil memeriksa adanya kondisi tidak normal." },
  { t: "Rawat", g: "5R", d: "Menstandarkan kondisi ringkas, rapi, dan resik agar dipertahankan." },
  { t: "Rajin", g: "5R", d: "Membiasakan disiplin menjalankan standar secara konsisten dan terus-menerus." },
  { t: "Ergonomi", g: "Dasar", d: "Penyesuaian alat, posisi, dan metode kerja terhadap kemampuan manusia untuk mengurangi kelelahan serta cedera." },
  { t: "SOP Industri", g: "Budaya kerja", d: "Urutan kerja terdokumentasi yang memastikan keselamatan, konsistensi, ketertelusuran, dan mutu hasil." }
];

/* Kata kunci soal "istilah yang paling tepat" */
window.K3_KUNCI = [
  ["menghilangkan sumber bahaya", "Eliminasi"],
  ["mengganti dengan yang lebih aman", "Substitusi"],
  ["desain, pelindung, ventilasi, pembatas", "Pengendalian Teknik"],
  ["SOP, pelatihan, tanda, jadwal, izin kerja", "Pengendalian Administratif"],
  ["perlindungan terakhir, tidak menghilangkan bahaya", "APD"],
  ["memilah, menyingkirkan yang tidak perlu", "Ringkas"],
  ["menata, tempat jelas, label", "Rapi"],
  ["membersihkan sambil memeriksa", "Resik"],
  ["menstandarkan agar dipertahankan", "Rawat"],
  ["disiplin, konsisten, terus-menerus", "Rajin"],
  ["isolasi energi, beri tanda", "Lockout/Tagout"],
  ["muatan statis, grounding", "ESD Wrist Strap"]
];
