/* =====================================================================
   DATA MATERI 1 — 12 PROFESI TJKT
   Edit teks di file ini saja; tampilan akan menyesuaikan otomatis.
   - gambar  : file di folder img/ (foto karakter)
   - avatar  : versi bulat kecil untuk deretan di bagian atas
   - warna   : warna aksen kartu,  latar: warna pastel di belakang foto
   - bidang  : id tahap pada MP_TAHAP di bawah
   ===================================================================== */

window.MP_TAHAP = [
  { id: "rancang", nama: "Rancang", info: "Sebelum kabel pertama ditarik, kebutuhan jaringan dan sistem radio dianalisis dan dirancang lebih dulu." },
  { id: "bangun",  nama: "Bangun",  info: "Rancangan diwujudkan: perangkat dipasang, dikonfigurasi, diuji, dan jalur fiber ditarik serta disambung." },
  { id: "kelola",  nama: "Kelola",  info: "Jaringan yang sudah berjalan harus dipantau, dijaga stabil, dan dikembangkan, termasuk di lingkungan cloud." },
  { id: "amankan", nama: "Amankan", info: "Ancaman dan insiden keamanan dipantau, dianalisis, lalu ditangani agar layanan tetap aman." },
  { id: "layani",  nama: "Layani & Pimpin", info: "Kebutuhan pelanggan dilayani, peluang usaha dikembangkan, dan seluruh proyek dikoordinasikan sampai serah terima." }
];

window.MP_PROFESI = [
  {
    no: 1, nama: "Network Planner", sebutan: "Perencana Jaringan", bidang: "rancang",
    ringkas: "Merancang desain dan kebutuhan jaringan sebelum instalasi.",
    tugas: "Analisis kebutuhan, merancang topologi dan jalur.",
    alat: "Software desain, peta, data survei.",
    hasil: "Rancangan dan dokumentasi jaringan.",
    gambar: "img/01.webp", avatar: "img/av01.webp", warna: "#2b86d4", latar: "#dff3fb"
  },
  {
    no: 2, nama: "Network Engineer", sebutan: "Insinyur Jaringan", bidang: "bangun",
    ringkas: "Membangun, mengonfigurasi, dan mengoptimalkan jaringan.",
    tugas: "Instalasi, konfigurasi, pengujian, troubleshooting.",
    alat: "Router, switch, kabel UTP, MikroTik/Cisco, laptop.",
    hasil: "Jaringan berfungsi sesuai desain.",
    gambar: "img/02.webp", avatar: "img/av02.webp", warna: "#e0364d", latar: "#fde4e7"
  },
  {
    no: 3, nama: "Network Administrator", sebutan: "Administrator Jaringan", bidang: "kelola",
    ringkas: "Mengelola operasional jaringan sehari-hari.",
    tugas: "Monitoring, manajemen akses, backup konfigurasi.",
    alat: "Router, switch, server, monitoring tools.",
    hasil: "Jaringan stabil, aman, dan terkelola.",
    gambar: "img/03.webp", avatar: "img/av03.webp", warna: "#2a9d58", latar: "#e0f6e0"
  },
  {
    no: 4, nama: "Teknisi Fiber Optik", sebutan: "Jaringan Akses", bidang: "bangun",
    ringkas: "Memasang dan memelihara jaringan akses fiber optik.",
    tugas: "Penarikan kabel, splicing, terminasi, pengukuran.",
    alat: "Fusion splicer, OPM, OTDR, kabel fiber, ODP/ODC.",
    hasil: "Jalur fiber terpasang dan teruji.",
    gambar: "img/04.webp", avatar: "img/av04.webp", warna: "#e8820e", latar: "#fff0cf"
  },
  {
    no: 5, nama: "NOC Engineer", sebutan: "Network Operations Center", bidang: "kelola",
    ringkas: "Memantau kondisi dan kinerja jaringan.",
    tugas: "Monitoring alarm, trafik, tiket gangguan, eskalasi.",
    alat: "NMS, dashboard, ticketing system.",
    hasil: "Gangguan terdeteksi dan ditindaklanjuti.",
    gambar: "img/05.webp", avatar: "img/av05.webp", warna: "#7447d4", latar: "#ece5fb"
  },
  {
    no: 6, nama: "RF Engineer", sebutan: "Insinyur Frekuensi Radio", bidang: "rancang",
    ringkas: "Merencanakan dan mengoptimalkan sistem komunikasi radio.",
    tugas: "Analisis frekuensi, antena, cakupan, kualitas sinyal.",
    alat: "Spectrum analyzer, antena, kompas, laptop.",
    hasil: "Rancangan atau optimasi sistem radio.",
    gambar: "img/06.webp", avatar: "img/av06.webp", warna: "#1a86d8", latar: "#def2fc"
  },
  {
    no: 7, nama: "Cybersecurity Analyst", sebutan: "Analis Keamanan Siber", bidang: "amankan",
    ringkas: "Memantau ancaman dan menganalisis insiden keamanan.",
    tugas: "Analisis ancaman, insiden, mitigasi risiko.",
    alat: "Firewall, IDS/IPS, log system, security tools.",
    hasil: "Temuan keamanan dan tindak lanjut.",
    gambar: "img/07.webp", avatar: "img/av07.webp", warna: "#d81b47", latar: "#fde3e8"
  },
  {
    no: 8, nama: "Cloud Engineer", sebutan: "Insinyur Cloud", bidang: "kelola",
    ringkas: "Merancang, menerapkan, dan mengelola infrastruktur cloud.",
    tugas: "Pengelolaan komputasi, penyimpanan, jaringan virtual.",
    alat: "Cloud platform (AWS/Azure/GCP), laptop.",
    hasil: "Infrastruktur cloud berjalan sesuai kebutuhan.",
    gambar: "img/08.webp", avatar: "img/av08.webp", warna: "#13988d", latar: "#def4f2"
  },
  {
    no: 9, nama: "Data Center Technician", sebutan: "Teknisi Pusat Data", bidang: "bangun",
    ringkas: "Menangani perangkat fisik di pusat data.",
    tugas: "Instalasi rack, penataan kabel, pengecekan perangkat.",
    alat: "Server, rack, PDU, kabel, perangkat jaringan.",
    hasil: "Perangkat pusat data terpasang dan terpelihara.",
    gambar: "img/09.webp", avatar: "img/av09.webp", warna: "#6a4fd0", latar: "#ece9fb"
  },
  {
    no: 10, nama: "Customer Service", sebutan: "Layanan Jaringan", bidang: "layani",
    ringkas: "Menerima keluhan dan membantu kebutuhan pelanggan.",
    tugas: "Identifikasi keluhan, informasi, pencatatan, tindak lanjut.",
    alat: "Komputer, sistem tiket, telepon, aplikasi komunikasi.",
    hasil: "Kebutuhan pelanggan terlayani dengan baik.",
    gambar: "img/10.webp", avatar: "img/av10.webp", warna: "#d59a0a", latar: "#fff6c9"
  },
  {
    no: 11, nama: "Technopreneur TJKT", sebutan: "Wirausaha Teknologi", bidang: "layani",
    ringkas: "Membangun usaha dengan memanfaatkan teknologi jaringan.",
    tugas: "Identifikasi peluang, penjualan, promosi, layanan purnajual.",
    alat: "Produk jaringan, katalog, media promosi, tools.",
    hasil: "Produk atau layanan teknologi yang bernilai bagi pelanggan.",
    gambar: "img/11.webp", avatar: "img/av11.webp", warna: "#2b9a4c", latar: "#e3f6dc"
  },
  {
    no: 12, nama: "Project Manager", sebutan: "Manajer Proyek", bidang: "layani",
    ringkas: "Mengoordinasikan pelaksanaan proyek jaringan.",
    tugas: "Perencanaan, jadwal, anggaran, kualitas, risiko, koordinasi tim.",
    alat: "Project plan, dokumen, software manajemen proyek.",
    hasil: "Proyek terlaksana sesuai sasaran dan serah terima.",
    gambar: "img/12.webp", avatar: "img/av12.webp", warna: "#bf3590", latar: "#fbe4ee"
  }
];
