export const FALLBACK = {
  kulit_buah: { nama_produk: "Eco-Enzyme Premium", tagline: "Cairan serbaguna dari fermentasi kulit buah", deskripsi: "Produk fermentasi anaerob dari kulit buah organik rasio 3:1:10 (limbah:gula:air). Fermentasi 30 hari menghasilkan asam asetat sebagai komponen aktif pembersih dan pupuk alami.", bahan_utama: "Kulit buah organik, gula merah, air bersih", formula: "3:1:10 - C6H12O6 -> 2C2H5OH + 2CO2", manfaat: ["Pembersih alami serbaguna","Pupuk cair organik","Pengusir hama ramah lingkungan"], langkah_singkat: ["Campurkan rasio 3:1:10","Simpan wadah tertutup 30 hari","Saring dan kemas"], nilai_ekonomi: "Rp 15.000 - Rp 25.000 / botol 500ml", sdgs_target: "SDGs 12.3 & 12.5" },
  cangkang_telur: { nama_produk: "Pupuk Kalsium CaO", tagline: "Suplemen tanah dari cangkang telur 95 persen CaCO3", deskripsi: "Pupuk kalsium organik dari cangkang telur CaCO3 hingga 95 persen. Sumber kalsium premium untuk tanah asam.", bahan_utama: "Cangkang telur kering, air", formula: "CaCO3 95pct. CaCO3 -> CaO + CO2 | CaO + H2O -> Ca(OH)2", manfaat: ["Meningkatkan pH tanah asam","Sumber kalsium tanaman","Zero waste dapur sekolah"], langkah_singkat: ["Keringkan cangkang 2 hari","Haluskan dengan blender","Ayak dan kemas zip"], nilai_ekonomi: "Rp 8.000 - Rp 15.000 / 100gr", sdgs_target: "SDGs 2.4" },
  sisa_nasi: { nama_produk: "Kompos Organik Express", tagline: "Pupuk kompos dari sisa nasi program MBG", deskripsi: "Kompos organik dari fermentasi sisa nasi dengan EM4. Sisa nasi 60pct, sekam 30pct, EM4 10pct. Fermentasi 14 hari.", bahan_utama: "Sisa nasi, EM4, sekam padi, air", formula: "60pct nasi : 30pct sekam : 10pct EM4 - 14 hari", manfaat: ["Pupuk kompos kaya nitrogen","Mengurangi limbah nasi MBG","Menutup siklus ekonomi sirkular"], langkah_singkat: ["Campur sisa nasi + sekam + EM4","Fermentasi 14 hari","Ayak, kemas, jual"], nilai_ekonomi: "Rp 10.000 - Rp 20.000 / kg", sdgs_target: "SDGs 12.3 & 15.3" },
  sayuran: { nama_produk: "Pakan Fermentasi & Kompos Hijau", tagline: "Olah sayuran sisa jadi pakan ternak & kompos", deskripsi: "Sayuran sisa MBG diolah jadi pakan fermentasi (silase) atau kompos hijau cepat (7 hari dengan MOL).", bahan_utama: "Sayuran sisa, dedak, MOL/gula, air", formula: "Sayuran 70pct : dedak 25pct : MOL 5pct - 7 hari anaerob", manfaat: ["Pakan ternak bergizi","Kompos hijau cepat","Mengurangi limbah sayur 40pct"], langkah_singkat: ["Cacah sayuran halus","Campur dedak + MOL","Fermentasi 7 hari tertutup"], nilai_ekonomi: "Rp 5.000 - Rp 12.000 / kg", sdgs_target: "SDGs 12.5 & 2.4" },
  default: { nama_produk: "Kompos Serbaguna RE-PLATE", tagline: "Solusi zero-waste semua jenis sisa MBG", deskripsi: "Campuran limbah MBG diolah jadi kompos serbaguna via fermentasi terkontrol.", bahan_utama: "Campuran sisa MBG, aktivator EM4/MOL", formula: "C:N = 25-30:1 - fermentasi 21 hari", manfaat: ["Mengurangi limbah ke TPA","Pupuk kebun sekolah","Edukasi ekonomi sirkular"], langkah_singkat: ["Pilah dan cacah limbah","Campur aktivator","Fermentasi 21 hari"], nilai_ekonomi: "Rp 8.000 - Rp 18.000 / kg", sdgs_target: "SDGs 12.3" }
}
export const WASTE_OPTIONS = [
  { value: "kulit_buah", label: "Kulit Buah (jeruk, mangga, pisang)" },
  { value: "cangkang_telur", label: "Cangkang Telur" },
  { value: "sisa_nasi", label: "Sisa Nasi / Makanan Pokok" },
  { value: "sayuran", label: "Sayuran / Lauk Sayur" },
]
export const MENU_OPTIONS = ["Nasi Ayam","Nasi Ikan","Nasi Sayur","Mie Goreng","Lainnya"]
export const MODULES = [
  { id: "m1", title: "Eco-Enzyme dari Kulit Buah", desc: "Fermentasi kulit buah jadi cairan pembersih & pupuk", icon: "B", contentSections: [
    { h: "Apa itu Eco-Enzyme?", p: "Eco-enzyme adalah cairan hasil fermentasi limbah organik (kulit buah/sayur) dengan gula dan air selama 30-90 hari. Rasio baku 3:1:10 (limbah:gula:air) menghasilkan larutan kaya asam asetat yang berfungsi sebagai pembersih alami dan pupuk cair." },
    { h: "Formula Ilmiah", p: "Rasio 3:1:10 - C6H12O6 -> 2 C2H5OH + 2 CO2 + Energi. Produk akhir: asam asetat (C2H4O2) 3-5 persen komponen aktif.", mono: true },
    { h: "Manfaat Ekologis", p: "Mengurangi limbah organik sekolah hingga 30pct. Satu botol 500ml bernilai Rp15.000-25.000. SDGs 12.3 & 12.5." },
    { h: "Langkah Produksi", ul: ["Siapkan kulit buah 300g + gula merah 100g + air 1000ml","Campur dalam botol plastik, tutup rapat","Simpan 30 hari, buka tiap 3 hari buang gas","Saring, kemas, beri label - siap jual!"] },
  ], quiz: [
    { q: "Rasio baku Eco-Enzyme adalah?", opts: ["1:1:1","3:1:10","5:2:8","2:3:5"], a: 1 },
    { q: "Produk aktif pembersih pada Eco-Enzyme?", opts: ["Asam sulfat","Asam asetat","Asam sitrat","Asam klorida"], a: 1 },
    { q: "Lama fermentasi minimal?", opts: ["7 hari","14 hari","30 hari","90 hari"], a: 2 },
  ]},
  { id: "m2", title: "Pupuk Kalsium dari Cangkang Telur", desc: "95pct CaCO3 jadi suplemen tanah premium", icon: "C", contentSections: [
    { h: "Komposisi Cangkang Telur", p: "Cangkang telur mengandung CaCO3 hingga 95pct - sumber kalsium premium untuk menetralkan tanah asam dan memperkuat akar." },
    { h: "Reaksi Kimia", p: "CaCO3 -> CaO + CO2 (pemanasan) | CaO + H2O -> Ca(OH)2 (kapur tohor) - menaikkan pH ke ideal 6.0-7.0.", mono: true },
    { h: "Proses Produksi", ul: ["Keringkan cangkang 24-48 jam (matahari/oven 100C 30mnt)","Haluskan dengan blender hingga serbuk","Ayak 60 mesh","Kemas zip, beri label - jual Rp8.000-15.000/100gr"] },
    { h: "Manfaat", p: "Menaikkan pH tanah asam, sumber kalsium akar, zero waste dapur sekolah. SDGs 2.4." },
  ], quiz: [
    { q: "Kandungan CaCO3 pada cangkang telur?", opts: ["50pct","75pct","95pct","99pct"], a: 2 },
    { q: "pH tanah ideal untuk tanaman?", opts: ["3-4","6.0-7.0","8-9","10-11"], a: 1 },
    { q: "Alat penghalus cangkang telur?", opts: ["Palu","Blender","Gunting","Pisau"], a: 1 },
  ]},
  { id: "m3", title: "Ekonomi Sirkular dalam MBG", desc: "Reduce - Reuse - Recycle di program makan sekolah", icon: "E", contentSections: [
    { h: "Definisi Ekonomi Sirkular", p: "Model ekonomi yang meminimalkan pemborosan dengan menjaga nilai produk, material, dan sumber daya selama mungkin - kebalikan ekonomi linear (ambil-pakai-buang)." },
    { h: "Hirarki 3R dalam MBG", ul: ["REDUCE - Kurangi porsi tak termakan","REUSE - Gunakan ulang wadah/kemasan MBG","RECYCLE - Olah sisa jadi produk baru"] },
    { h: "Konteks Program MBG", p: "260 hari sekolah/tahun x 50-100gr limbah/siswa/hari = potensi 624.000 ton/tahun nasional. RE-PLATE ubah limbah jadi produk bernilai." },
    { h: "SDGs & Asta Cita", p: "Selaras SDGs 12.3 (reduksi food waste 50pct di 2030) dan misi Asta Cita kedaulatan pangan & lingkungan." },
  ], quiz: [
    { q: "3R ekonomi sirkular?", opts: ["Reduce Reuse Recycle","Ready Use Return","Read Understand Repeat","Run Use Recycle"], a: 0 },
    { q: "Potensi limbah MBG nasional/tahun?", opts: ["62.400 ton","624.000 ton","6.240.000 ton","624 ton"], a: 1 },
    { q: "Target SDGs 12.3 reduksi food waste?", opts: ["10pct","25pct","50pct","75pct"], a: 2 },
  ]},
]