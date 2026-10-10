# Product Requirements Document

**RE-PLATE — Smart Food Waste Hub & Circular Economy**

| | |
|---|---|
| **Versi dokumen** | 1.0 — audit kondisi existing (bukan redesign) |
| **Tanggal** | 2026-10-03 |
| **Konteks** | Universitas Tanjungpura · LIDM 2026 · Divisi IPTEK · SDGs 12.3 |
| **Bahasa** | Bahasa Indonesia |
| **Status produk** | Prototype fungsional penuh, data lokal (localStorage), tanpa server |
| **Audiens dokumen** | Product Manager, Designer, Developer, AI Coding Agent, AI UI Builder |

> Dokumen ini mendeskripsikan **project yang ADA SEKARANG**, berdasarkan pembacaan
> implementation nyata di `src/`. Setiap klaim ditandai: **FACT** (dibuktikan di kode),
> **OBSERVATION** (potensi masalah dari kode), **RECOMMENDATION** (usulan, bukan status).
> Bagian "current state" dipisahkan tegas dari usulan perbaikan.

---

# 1. Technical Specification

Stack berikut adalah **stack aktual** yang terbukti di `package.json` dan source code. Tidak ada asumsi framework lain.

| Bagian | Teknologi aktual | Bukti |
|---|---|---|
| Framework | React 19.2.8 (`react`, `react-dom`) | `package.json` |
| Bahasa | JavaScript (JSX) — **tidak ada TypeScript** | semua file `.jsx`/`.js` |
| Build tool | Vite 8.3.2 + `@vitejs/plugin-react` 6.1.1 | `package.json`, `vite.config.js` |
| Styling | Plain CSS + CSS Custom Properties (design tokens) di `src/index.css` | `src/index.css` |
| Component library | Komponen buatan sendiri di `src/components/UI.jsx` (tidak pakai shadcn/MUI/Tailwind) | `src/components/UI.jsx` |
| Charts | Chart.js 4.5.1 (registerables) | `Dashboard.jsx`, `Teacher.jsx` |
| Routing | **Hash-based routing manual** (listener `hashchange` di `App.jsx`) — BUKAN react-router | `src/App.jsx:72-79` |
| State management | React hooks saja (`useState`, `useMemo`, `useEffect`, `useRef`) — tidak ada Redux/Zustand | semua page |
| API / Data layer | `src/lib/db.js` — wrapper `localStorage` (prefix `replate_`) | `src/lib/db.js` |
| Gamifikasi | `src/lib/gamify.js` — XP, level, streak, misi harian | `src/lib/gamify.js` |
| AI (opsional) | OpenRouter (`VITE_OPENROUTER_KEY`), model `arcee-ai/trinity-large-preview`, fallback offline | `src/pages/Inno.jsx:24-44` |
| Authentication | **Tidak ada** — tidak ada login/akun | — |
| Storage / Database | **Hanya `localStorage` browser** — tidak ada server, tidak ada DB eksternal | `src/lib/db.js` |
| Fonts | Baloo 2 (display) + Plus Jakarta Sans (body) via Google Fonts `@import` | `src/index.css:1` |
| Linter | oxlint 1.81.0 (config `.oxlintrc.json`) | `package.json` |
| Runtime dev | Node + Vite dev server (`npm run dev`, default port 5173) | `package.json` |

**Catatan FACT — dependency & aset yang tidak terpakai:**

- `react-router-dom@7.18.4` terdaftar di `package.json` tetapi **tidak pernah di-import** di mana pun (routing pakai hash manual). Ini dead dependency.
- `src/assets/` berisi `vite.svg`, `react.svg`, `hero.png` — **tidak di-import** di kode mana pun.
- `public/icons.svg` — **tidak direferensikan** di `index.html` maupun kode.
- `build_err.log` di root adalah **artifact kedaluwarsa** dari masa pra-redesain: isinya mereferensikan `src/lib/xp.jsx` (sudah tidak ada) dan export lama (`Celebrate`, `getLevelMeta`, `QuestList`, `MascotHint`, `getQuests`). Build saat ini lolos (33 modul), jadi log ini menyesatkan.
- `README.md` **korup (mojibake)** — byte awal ASCII (`# RE-PLA`) dilanjutkan teks rusak hasil salah-decode UTF-16. Isi tidak bisa dibaca secara normal dan perlu ditulis ulang.

**Konfigurasi environment:**

- `.env.example` hanya berisi `VITE_OPENROUTER_KEY=sk-or-...`.
- Jika key **tidak diset**, seluruh aplikasi tetap jalan; generator Inno memakai fallback offline (5 template statis di `src/data/fallback.js`).

---

# 2. Product Overview

| | |
|---|---|
| **Product name** | RE-PLATE — Smart Food Waste Hub & Circular Economy |
| **Product type** | Web application (mobile-first PWA-lite, progressive enhancement) — edtech + gamifikasi |
| **Product purpose** | Mengubah kesadaran pelajar soal limbah makanan program MBG (Makan Bergizi Gratis) menjadi tindakan nyata ekonomi sirkular, melalui pencatatan, pembelajaran terbimbing, dan generasi ide produk. |
| **Target users** | ** Primer:** pelajar SMA/SMK Indonesia (device pribadi, mobile Android). **Sekunder:** guru pembina program MBG (memantau & memberi feedback). |
| **Problem** | Limbah makanan sekolah terbuang tanpa nilai. Pelajar tahu "jangan buang makanan" tapi tidak tahu **cara mengubah sisa jadi produk**, dan tidak ada motivasi berkelanjutan untuk mencatat kebiasaan harian. |
| **Value proposition** | "Catat sisa makananmu, pelajari ilmunya, ubah jadi produk bernilai." Satu aplikasi yang merangkai **pencatatan kebiasaan → pembelajaran terstruktur → output inovasi → apresiasi (XP, lencana, streak)**. |
| **Product goal** | Membentuk kebiasaan sadar limbah yang terukur dan berkelanjutan pada pelajar, sambil mengajarkan prinsip ekonomi sirkular secara aktif (bukan pasif). |
| **Scope (v1 saat ini)** | 7 layar (onboarding + 6 halaman utama), gamifikasi fungsional penuh, data lokal per-perangkat, mode offline untuk generator ide. |

**Identitas visual saat ini (FACT):** desain "Paper Garden" — kertas hangat + tekstur titik, komponen cut-paper/clay dengan border 2px dan bayangan offset keras (mainan kayu), maskot daun "Si Daun", navigasi evergreen pekat `#1F3B2E`.

---

# 3. Core Features

Setiap fitur di bawah ini **sudah diimplementasi** dan diverifikasi di build berjalan.

## F1. Onboarding & profil awal
- **Purpose:** menyambut pengguna baru dan mengumpulkan identitas dasar sebelum masuk app.
- **Function:** 3 slide perkenalan (maskot mood berbeda: `wave`, `cheer`, `happy`), slide terakhir adalah form profil. Tombol "Mulai belajar" **disabled sampai** nama + sekolah terisi. Tombol "Lewati" langsung ke slide form.
- **Input:** nama lengkap, kelas (X/XI/XII), nama sekolah, asal daerah (opsional).
- **Output:** record di `replate_profile` dengan flag `setupDone:true`; `school_type` di-hardcode `"SMA"`.
- **User interaction:** klik Lanjut / Lewati → isi form → submit.
- **Current status:** IMPLEMENTED. Diverifikasi: background gradient + dot texture, radius kartu 26px, validasi disabled-until-valid.

## F2. MBG Tracker (pencatatan limbah harian)
- **Purpose:** inti loop kebiasaan — catat porsi & sisa makanan setiap hari.
- **Function:** form input (menu, porsi gram, sisa gram, catatan), validasi (sisa ≤ porsi), klasifikasi otomatis kategori (`habis` / `sedikit` / `banyak`), simpan, tampilkan 5 entri terakhir, hapus entri (dengan `confirm()`).
- **Input:** menu dari `MENU_OPTIONS` (Nasi Ayam, Nasi Ikan, Nasi Sayur, Mie Goreng, Lainnya), porsi (gram), sisa (gram), catatan.
- **Output:** record `replate_mbg_tracker` `{date, foodName, portion_gram, waste_gram, note, category}`.
- **User interaction:** pilih menu → isi porsi & sisa → Simpan entri → toast "Tercatat. +10 XP".
- **Current status:** IMPLEMENTED. Validasi error: "Sisa tidak boleh melebihi porsi" (toast merah). Diverifikasi end-to-end.

## F3. Statistik & visualisasi 7 hari
- **Purpose:** membuat pola limbah terlihat (porsi vs sisa).
- **Function:** 3 StatCard (total sisa 7 hari, rata-rata harian, jumlah produk), grafik Chart.js (bar) "Tren 7 Hari", plus fallback aksesibilitas tabel `<table class="sr-only">` berisi data mentah.
- **Current status:** IMPLEMENTED. Canvas terbukti render (392×250 px).

## F4. Misi harian (daily quests) + bonus
- **Purpose:** goal harian konkret agar pengguna kembali setiap hari.
- **Function:** papan 3 misi — "Catat sisa MBG", "Selesaikan 1 kuis", "Buat rekomendasi" — status diturunkan **dari data nyata** (`questState()`). Saat ketiganya selesai, efek di Dashboard meng-klaim **+25 XP sekali per hari** (idempoten via key `replate_dailybonus_YYYY-MM-DD`).
- **Current status:** IMPLEMENTED. Diverifikasi: XP 45 → 70, toast "Misi harian lengkap! +25 XP bonus", key bonus tersimpan.

## F5. Jalur belajar (learning path) + reader
- **Purpose:** pembelajaran terstruktur bertingkat tentang ekonomi sirkular.
- **Function:** 3 modul (`m1` Eco-Enzyme, `m2` Pupuk Kalsium, `m3` Ekonomi Sirkular dalam MBG). State node: `locked → available → current → done → mastered`. Reader materi dengan **scroll-progress gate**: kuis terkunci sampai progres baca ≥ 90%; mencapai 90% menandai modul `isCompleted` di `module_progress`.
- **Current status:** IMPLEMENTED. Diverifikasi: unlock kuis di 90%, modul 2 terbuka setelah modul 1 selesai.

## F6. Kuis modul
- **Purpose:** menguji pemahaman & memberi reward tertiering.
- **Function:** 3 soal per modul (radio kustom `.quiz-opt`), skor disimpan ke `replate_quiz_scores`, XP tertiering: **sempurna +20 / lulus +12 / gagal +8**. Skor terbaik ditampilkan; bisa diulang untuk kejar status "Mahir" (skor sempurna). Tombol "Modul berikutnya" muncul jika lulus.
- **Current status:** IMPLEMENTED. Diverifikasi: kuis 3/3 → "Sempurna", modul berikutnya unlock.

## F7. Lab Inovasi (generator ide produk)
- **Purpose:** mengubah sisa limbah menjadi konsep produk bernilai.
- **Function:** input jenis limbah (4 chip radio: kulit buah / cangkang telur / sisa nasi / sayuran), berat min 10 gram, catatan opsional. Tombol generate menampilkan spinner ("Menganalisis limbah..."). Jika `VITE_OPENROUTER_KEY` ada → panggil AI; jika tidak → fallback offline 600 ms. Hasil: nama produk, tagline, deskripsi, bahan, formula, manfaat, langkah, nilai ekonomi, target SDGs. Bisa langsung **dipublikasikan ke Market**. Riwayat 5 terakhir. **+15 XP** per generate.
- **Current status:** IMPLEMENTED (mode offline terverifikasi penuh; mode AI belum diuji karena key tidak diset).

## F8. Market Circular (etalase produk)
- **Purpose:** showcase hasil olahan limbah — menutup loop ekonomi sirkular.
- **Function:** grid kartu produk, **pencarian** teks (nama + deskripsi), **filter kategori** (5 chip: Semua / kulit buah / cangkang telur / sisa nasi / sayuran), form "Jual produk" manual, hapus produk. Empty state berbeda untuk "belum ada produk" vs "tidak ada yang cocok".
- **Current status:** IMPLEMENTED. Diverifikasi: search "kompos" → empty state, filter kategori berfungsi.

## F9. Ruang Kelas (teacher dashboard)
- **Purpose:** guru memantau progres & memberi feedback.
- **Function:** 4 PillStat (total limbah, jumlah produk, modul selesai, rata-rata kuis %), grafik Chart.js 7 hari, tabel progress siswa, **export CSV** (`db.exportCSV`), form feedback (nama siswa + pesan), daftar feedback terkirim.
- **Current status:** IMPLEMENTED. Diverifikasi: feedback tersimpan ke `replate_feedback`, export CSV memicu download.

## F10. Profil & portofolio
- **Purpose:** identitas, progres, dan apresiasi pengguna.
- **Function:** avatar inisial, XP/level/streak chips, progress bar level, 4 PillStat (limbah dicatat, dihemat 30%, produk, skor kuis), **4 lencana** (Pemula Hijau, Pelajar Telaten, Penemu Muda, Mahir 3R — status diturunkan dari data), riwayat MBG & Lab (5 terakhir), edit profil, export CSV, reset semua data.
- **Current status:** IMPLEMENTED. Diverifikasi: 3 dari 4 lencana terbuka sesuai data, "Mahir 3R" terkunci.

## F11. Sistem gamifikasi (cross-cutting)
- **Purpose:** motivasi berkelanjutan via progres yang selalu terlihat.
- **Function:** XP (`replate_xp`), level = `floor(xp/100)+1`, progress `xp%100`, streak hari berturut (lookback 60 hari), **Level Ring HUD** di topbar mobile & sidebar desktop, XP chip & streak chip di Dashboard.
- **Current status:** IMPLEMENTED dan dirancang fungsional (quest diturunkan dari data sungguhan, bukan dekoratif).

## F12. Sistem feedback & maskot
- **Purpose:** komunikasi status yang ramah dan konsisten.
- **Function:** Toast global (`ToastProvider`, variant success/accent/error, `aria-live="polite"`), komponen `Feedback` (info/ok/no), maskot "Si Daun" dengan 6 mood (`happy`, `cheer`, `think`, `done`, `wave`, `sad`) yang muncul **hanya saat ada fungsi**: onboarding, reader (think/cheer sesuai progres), hasil kuis, empty state, watermark hero.
- **Current status:** IMPLEMENTED. Diverifikasi: toast error/aksen berwarna benar, maskot render di semua titik fungsi.

---

# 4. Navigation Structure

Routing: **hash-based manual** (`App.jsx`). Nav items didefinisikan di `Layout.jsx` `ITEMS`.

| Route (hash) | Label nav | Screen (judul page) | Purpose | Hubungan navigasi |
|---|---|---|---|---|
| (onboarding) | — | Onboarding | Setup profil pertama | `setupDone:false` → tidak bisa ke layar lain |
| `#dashboard` | Beranda | "Halo, \<nama\>" | Loop harian: misi, input MBG, ringkasan, CTA lanjut belajar | Pusat → semua layar |
| `#inno` | Lab | "Lab Inovasi" | Generator ide produk | Publikasi → `#marketplace` |
| `#pedagogy` | Belajar | "Jalur Belajar" | Learning path + reader + kuis | Dari CTA Dashboard |
| `#marketplace` | Market | "Market Circular" | Etalase produk | Dari publish Lab |
| `#teacher` | Kelas | "Ruang Kelas" | Monitoring guru + feedback | Independent |
| `#profile` | Profil | "Profil" | Identitas, lencana, riwayat, reset | Level ring → profil |

**Shell navigasi (FACT):**
- **Mobile (<1024px):** topbar sticky (brand + streak chip + level ring) + **bottom nav fixed 6 item**.
- **Desktop (≥1024px):** **sidebar evergreen 250px** (logo, 6 nav button, kartu level + progress, credit LIDM/SDGs); topbar & bottom nav disembunyikan.
- Container konten `max-width:980px`.

---

# 5. User Roles & Permissions

**FACT: tidak ada sistem autentikasi dan tidak ada role formal.** Semua data satu perangkat-browser.

Role informal yang terbukti dari UI:

| Role informal | Layar yang dipakai | Permission |
|---|---|---|
| Siswa (utama) | Beranda, Lab, Belajar, Market, Profil | Full akses semua data milik browsernya |
| Guru (sekunder) | Ruang Kelas (teacher) | Lihat statistik & beri feedback — **tapi membaca localStorage yang sama** |

- Tidak ada login, tidak ada token, tidak ada pembatasan akses antar layar.
- Halaman "Ruang Kelas" dapat dibuka siapa saja; data siswa yang ditampilkan = data pemilik browser (diprofilkan sebagai 1 siswa bernama pengguna saat ini).
- **OBSERVATION:** karena tidak ada backend, guru **tidak bisa** melihat siswa lintas perangkat. Ruang Kelas saat ini efektif "dashboard 1 siswa".
- Field `school_type` di-hardcode `"SMA"` di onboarding dan edit profil (`App.jsx:28`, `Profile.jsx:33`) — tidak ada dukungan jenjang lain.

---

# 6. Screen Structure

## Onboarding
- **Purpose:** sambutan + setup profil.
- **Key components:** `Mascot` (wave/cheer/happy), slide dots indikator, form (nama, kelas, sekolah, daerah), tombol Lanjut/Lewati.
- **User actions:** Lanjut, Lewati, isi form, submit.
- **Data / state:** `profileStore.save()` → `replate_profile`; `App` state `ready`.
- **Current status:** IMPLEMENTED.

## Beranda (Dashboard)
- **Purpose:** pusat loop harian.
- **Key components:** `PageHead` (sapaan + XP/Streak chip), tile "Lanjutkan belajar" (maskot watermark, CTA modul berikutnya), `Quests`, form MBG, 3 `StatCard`, Chart.js canvas + sr-only table, tabel riwayat.
- **User actions:** Mulai modul, isi & simpan MBG, hapus entri, (level ring → Profil).
- **Data / state:** `replate_mbg_tracker`, `replate_xp`, `replate_module_progress`, `replate_quiz_scores`, `replate_marketplace`.
- **Current status:** IMPLEMENTED.

## Lab Inovasi (Inno)
- **Purpose:** generate ide produk dari limbah.
- **Key components:** `Topbar` (chip mode AI/offline), tile mascot hint, chip radiogroup 4 jenis limbah, input berat, textarea catatan, tombol generate + spinner, kartu hasil lengkap, tombol publish, riwayat.
- **User actions:** pilih limbah, isi berat/catatan, generate, publish ke Market.
- **Data / state:** `replate_inno_history`, `replate_marketplace` (via publish), `replate_xp`.
- **Current status:** IMPLEMENTED (mode offline).

## Jalur Belajar (Pedagogy)
- **Purpose:** pembelajaran terstruktur.
- **Key components:** learning path node (`.node` + `.path-line`), panel progres baca, reader materi (scroll container `max-height:460`), blok kuis (fieldset/legend + `.quiz-opt` radio), kartu skor terbaik, kartu hasil.
- **User actions:** pilih modul (jika tidak terkunci), scroll materi, jawab kuis, kirim jawaban, ulangi kuis, modul berikutnya.
- **Data / state:** `replate_module_progress`, `replate_quiz_scores`, `replate_xp`.
- **Current status:** IMPLEMENTED.

## Market Circular (Marketplace)
- **Purpose:** etalase produk.
- **Key components:** search input (ikon), chip filter horizontal scroll, form "Jual produk", grid kartu produk (chip kategori, chip nilai, tanggal), empty state.
- **User actions:** cari, filter kategori, jual produk manual, hapus produk.
- **Data / state:** `replate_marketplace`.
- **Current status:** IMPLEMENTED.

## Ruang Kelas (Teacher)
- **Purpose:** monitoring & feedback guru.
- **Key components:** 4 `PillStat`, Chart.js canvas, tabel progress siswa, tombol Export CSV, form feedback, daftar feedback.
- **User actions:** export CSV, kirim feedback, lihat statistik.
- **Data / state:** `replate_mbg_tracker`, `replete_marketplace`, `replate_quiz_scores`, `replate_module_progress`, `replate_feedback`.
- **Current status:** IMPLEMENTED.

## Profil
- **Purpose:** identitas & pencapaian.
- **Key components:** avatar inisial, chips XP/level/streak, progress level, 4 `PillStat`, grid 4 lencana, riwayat MBG & Lab, tombol Edit profil / Export CSV / Reset data.
- **User actions:** edit profil, export CSV, reset semua data.
- **Data / state:** semua key (read-only kecuali profil).
- **Current status:** IMPLEMENTED.

---

# 7. Features per Screen

| Screen | Feature | Action | Result |
|---|---|---|---|
| Onboarding | Slide perkenalan | Lanjut / Lewati | Navigasi ke form |
| Onboarding | Setup profil | Isi nama + sekolah → submit | `setupDone:true`, masuk Beranda |
| Beranda | Input MBG | Pilih menu, isi porsi+sisa, Simpan | Record tersimpan, +10 XP, toast, quest "log" selesai |
| Beranda | Validasi MBG | Sisa > porsi | Toast error, data tidak disimpan |
| Beranda | Hapus entri | Klik Hapus → confirm | Entri dihapus, toast |
| Beranda | Klaim bonus harian | (otomatis saat 3 misi selesai) | +25 XP sekali/hari |
| Beranda | Lanjutkan belajar | Mulai modul | Navigasi ke Belajar, modul berikutnya |
| Lab | Generate rekomendasi | Pilih limbah, isi berat ≥10g, Buat | Hasil produk + formula + nilai ekonomi, +15 XP |
| Lab | Publish ke Market | Publikasikan | Produk masuk `replate_marketplace` |
| Belajar | Buka modul | Klik node (jika tidak locked) | Materi modul tampil |
| Belajar | Selesaikan baca | Scroll sampai ≥90% | `module_progress` tersimpan, kuis terbuka |
| Belajar | Kerjakan kuis | Pilih jawaban → Kirim | Skor, XP tier, unlock modul berikutnya |
| Belajar | Ulangi kuis | Ulangi untuk kejar Mahir | Skor baru tersimpan |
| Market | Cari produk | Ketik di search | Filter real-time |
| Market | Filter kategori | Klik chip | Filter real-time |
| Market | Jual produk manual | Isi form → Terbitkan | Produk tayang |
| Market | Hapus produk | Klik ikon sampah → confirm | Produk dihapus |
| Kelas | Export CSV | Klik Export CSV | Download `re-plate-mbg.csv` |
| Kelas | Kirim feedback | Isi nama + pesan → Kirim | `replate_feedback` tersimpan |
| Profil | Edit profil | Edit → Simpan | Profil diperbarui |
| Profil | Export CSV | Klik Export CSV | Download CSV MBG |
| Profil | Reset data | Reset → confirm | `localStorage.clear()` + reload |
| Profil | Lihat lencana | (otomatis) | 4 lencana dengan status terkunci/tercapai |

---

# 8. User Workflows

## W1. Onboarding → first use
Buka app (`setupDone` false) → tampil slide 1 → Lanjut (×1) / Lewati → form profil → isi nama + sekolah → tombol aktif → Mulai belajar → **Beranda**.

## W2. Loop harian MBG (core loop)
Buka Beranda → lihat misi hari ini → buka form MBG → pilih menu → isi porsi & sisa → Simpan → **toast "Tercatat. +10 XP"** → quest "Catat sisa MBG" centang → streak bertambah → (jika streak ≥3, +5 XP bonus implisit).

## W3. Pembelajaran + kuis
Beranda → Mulai modul → **Jalur Belajar** → klik modul tersedia → baca materi (maskot `think`) → scroll ≥90% (maskot `cheer`, kuis terbuka) → jawab 3 soal → Kirim jawaban → hasil skor + XP (20/12/8) → **Modul berikutnya** terbuka.

## W4. Inovasi → publikasi
Beranda → nav **Lab** → pilih jenis limbah → isi berat (≥10g) → (catatan opsional) → **Buat rekomendasi** → spinner 600ms → kartu hasil (nama, formula, manfaat, langkah, nilai ekonomi, SDGs) → **Publikasikan ke Market** → nav **Market** → produk tampil.

## W5. Misi harian sempurna
Catat MBG (W2) + kerjakan kuis (W3) + generate Lab (W4) → efek Dashboard mendeteksi 3/3 → klaim otomatis **+25 XP** → toast "Misi harian lengkap!" → badge "Semua misi selesai".

## W6. Monitoring guru
Nav **Kelas** → lihat 4 statistik + grafik tren → tabel progress siswa → **Export CSV** (download) → form feedback → isi nama + pesan → **Kirim feedback** → muncul di daftar feedback.

## W7. Pencapaian & portofolio
Nav **Profil** → lihat level ring progress + 4 PillStat → grid lencana (status dari data) → riwayat MBG & Lab → (opsional) Edit profil / Export CSV / Reset data.

---

# 9. Data & Filtering Logic

**Penyimpanan:** semua di `localStorage` dengan prefix `replate_`, diakses via `src/lib/db.js` (`getAll`, `save`, `del`, `set`, `get`, `exportCSV`).

**Key map (FACT):**

| Key | Bentuk record | Dipakai oleh |
|---|---|---|
| `replate_profile` | `{name, class, school, region, school_type:"SMA", setupDone}` | App, Dashboard, Teacher, Profile |
| `replate_mbg_tracker` | `{date, foodName, portion_gram, waste_gram, note, category}` | Dashboard, Teacher, Profile |
| `replate_quiz_scores` | `{moduleId, moduleName, score, totalQuestions, completedAt}` | Pedagogy, Teacher, Profile |
| `replate_module_progress` | `{moduleId, scrollPercent, isCompleted, completedAt}` | Pedagogy, Dashboard, Teacher |
| `replate_marketplace` | `{productName, description, rawMaterial, category, valueEstimate, publishedAt}` | Marketplace, Inno (publish), Teacher, Profile |
| `replate_inno_history` | `{wasteType, weightGram, result}` | Inno, Profile |
| `replate_feedback` | `{studentName, teacherName:"Guru", message, isRead:false}` | Teacher |
| `replate_xp` | string angka XP total | gamify, Layout, Profile |
| `replate_dailybonus_YYYY-MM-DD` | `"1"` setelah klaim | gamify |

**Search & filter:**
- Marketplace: `q` dicocokkan ke `productName + description` (case-insensitive, `includes`); filter kategori mencocokkan `category` **atau** `rawMaterial`. Kategori filter: `semua`, `kulit_buah`, `cangkang_telur`, `sisa_nasi`, `sayuran`.
- **Tidak ada** sorting eksplisit, **tidak ada** date-range filter, **tidak ada** pagination. Riwayat di-cap tampil ke **5 entri terbaru** (`slice(-5).reverse()`) di Dashboard, Profile, Inno.

**Calculations & aggregations (FACT):**
- Kategori MBG: `w===0?"habis": w<p/2?"sedikit":"banyak"`.
- Streak: himpunan tanggal MBG unik, iterasi mundur 60 hari, berhenti saat ketemu bolong.
- Level: `floor(xp/100)+1`; progress: `xp%100`.
- Rata-rata kuis (Teacher): `Σscore / ΣtotalQuestions × 100`.
- "Dihemat (30%)" (Profile): `round(totalWaste × 0.3)` — **asumsi tetap 30%**, bukan dihitung dari data nyata.
- Last-7 aggregation: map tanggal 7 hari terakhir, akumulasi `waste_gram` (Dashboard: porsi & sisa; Teacher: sisa saja).
- Best score (Profile): `Math.max(scores.map(score))` — membandingkan skor mentah, bukan persentase.

**Status & state machine:**
- Modul: `locked` (modul sebelumnya belum `isCompleted`) → `available` → `current` → `done` (completed + ada skor) → `mastered` (done + skor sempurna).
- Kuis gate: `scrollPct>=90 || module_progress.isCompleted`.
- Mode Inno: `offline` (default) / `online` (hanya jika AI sukses parse JSON).

---

# 10. UI Design System — CURRENT STATE

> Ini adalah audit kondisi visual **saat ini** (bukan usulan redesign).

**Visual style:** "Paper Garden" — kertas hangat bertekstur titik, komponen cut-paper/clay, border 2px tegas, bayangan offset keras ala mainan kayu (`.btn-primary` = `box-shadow:0 4px 0` → `translateY(2px)` saat ditekan). Tegas playful tapi terstruktur, **bukan** dashboard korporat hijau gelap, **bukan** glassmorphism.

**Typography:**
- Display: **Baloo 2** (500–800) — judul, angka, chip level.
- Body/UI: **Plus Jakarta Sans** (400–800).
- Skala: display 34 / h1 25 / h2 19 / h3 16 / body 15 / caption 12.5 / micro 11 px.
- Heading: `letter-spacing:-.015em`, `line-height:1.16`.

**Spacing:** token `--s1..--s7` = 4, 8, 12, 16, 20, 28, 40 px.

**Radius:** `--r-sm` 10 / `--r-md` 14 / `--r-lg` 20 / `--r-xl` 26 / `--r-pill` 999 px.

**Cards:** `.card` (surface putih, border 2px, radius 20, shadow soft) / `.panel` (paper-2, radius 14) / `.tile-*` (paper tinted per warna semantik) / `.card-pad0` (padding 0, overflow hidden).

**Buttons:** `.btn` 48px (`.btn-sm` 40, `.btn-ghost` 42), radius pill; varian `primary` (leaf), `carrot`, `outline`, `ghost`, `block` (full width); disabled = paper-2 tanpa shadow.

**Forms:** `.input` 48px, border 2px, radius 14, focus = border leaf + ring 3px; `select` punya chevron SVG inline; `.label` micro uppercase.

**Tables:** full width, `th` micro uppercase border-bottom 2px, `td` 11px padding, border bottom 2px.

**Charts:** Chart.js canvas dengan container height 200px; Dashboard menyertakan fallback tabel sr-only untuk screen reader.

**Shadows:** `--sh-soft` (0 6px 18px rgba(31,58,46,.07)), `--sh-lift`; mainan: `0 4px 0 <tone-2>`.

**States yang tersedia (FACT):**
- **Loading:** `.spin` (border spinner) di tombol generate Lab.
- **Empty state:** `.empty` (dashed border, paper-2) di Dashboard history, Inno history, Marketplace, Teacher feedback, Profile history.
- **Error state:** toast variant `on-error` (dot tomato), `.input-err` class tersedia.
- **Success/reward:** toast `on-carrot`, animasi `pop`, `bubble` (mascot), `fb-ok`.
- **Disabled:** tombol primary disabled (paper-2), node modul `locked`.
- **Feedback inline:** komponen `Feedback` (info/ok/no) — dipakai di kuis terkunci & hasil.

**Motion:** easing `--ease-bounce` (cubic-bezier(.34,1.56,.64,1)) & `--ease-out`; durasi `.16s` / `.3s`; animasi `bob` (node current), `bubble` (mascot), `shake` (jawaban salah), `pop`, `fadeIn`, `toastIn`, `fbIn`, `spin`.

---

# 11. Color System — CURRENT STATE

Token di `:root` `src/index.css` (FACT):

| Token | Nilai | Peran |
|---|---|---|
| `--paper` | `#FFF7EA` | latar kertas hangat |
| `--paper-2` | `#FBEEDC` | panel lebih dalam |
| `--surface` | `#FFFFFF` | permukaan kartu |
| `--ink` | `#1F3A2E` | teks utama (evergreen pekat) |
| `--ink-2` | `#4F6457` | teks redup |
| `--ink-3` | `#5B7165` | teks pudar (sudah AA pada kertas, ~4.9:1) |
| `--line` / `--line-2` | `#E6DAC2` / `#D8C9A9` | garis kertas |
| `--leaf` / `-2` / `-3` / `-line` | `#3FA46D` / `#287A4F` / `#E4F3EA` / `#BFE3CE` | primer: pertumbuhan/belajar |
| `--carrot` / `-2` / `-3` / `-line` | `#F08A3E` / `#D06B23` / `#FCE9D6` / `#F3CDA9` | aksen: hadiah/streak/misi |
| `--tomato` / `-3` / `-line` | `#E4572E` / `#FBE3D8` / `#F3C2B1` | error/limbah |
| `--sky` / `-3` / `-line` | `#4B8FE3` / `#E5F0FB` / `#C6DBF6` | info |
| `--plum` / `-3` / `-line` | `#8B5CB8` / `#F0E8F9` / `#DAC9EC` | varian tambahan |
| `--nav` | `#1F3B2E` | background sidebar/bottom nav |

Semantik pemakaian: leaf = aksi utama & pencapaian; carrot = reward, streak, misi, lencana; tomato = limbah & error; sky = info/modul terkunci. Body memakai background paper + dot texture SVG inline.

---

# 12. Layout Architecture

**Shell (FACT):**
- `.shell` flex, `min-height:100vh` — sidebar + main.
- **Sidebar** (desktop): `width:250px`, evergreen `--nav`, sticky `height:100vh`, berisi logo (mascot mini), 6 `.side-btn`, kartu `.side-level` (level + XP + progress bar) di `margin-top:auto`, credit LIDM/SDGs.
- **Main**: `flex:1`, `padding-bottom:92px` (ruang bottom nav di mobile).
- **Container**: `max-width:980px`, `margin:0 auto`, padding `20px 16px` (desktop `30px 24px`).
- **Topbar** (mobile): sticky top 0, `backdrop-filter:blur(10px)` di atas paper, berisi brand (mascot mini) + streak chip + **level ring button** (52px, SVG progress melingkar).
- **Bottom nav** (mobile): fixed bottom, evergreen, 6 `.navbtn` (min-height 52px), item aktif = background translucent + dot carrot.
- **Footer**: `.page-foot`, center, credit lengkap.

**Grid & spacing internal page:** `.stack-lg` (grid gap 20px) dipakai semua page; grid responsif `repeat(auto-fit,minmax(150px,1fr))` untuk stats, `minmax(180px,1fr)` lencana, `minmax(250px,1fr)` kartu produk.

**Responsive layout (FACT):** satu breakpoint `@media(min-width:1024px)`:
- `<1024px`: topbar + bottom nav aktif, sidebar hidden, `.main` padding-bottom 92px.
- `≥1024px`: sidebar aktif, topbar & bottom nav hidden, container padding 30px.
- Diverifikasi: **zero horizontal overflow** di 390 / 768 / 1280 px untuk semua 6 route.

---

# 13. Component System

Komponen reusable yang terbukti ada (`src/components/`):

| Komponen | File | Fungsi |
|---|---|---|
| `Icons` | `Icons.jsx` | 30 ikon SVG stroke original (home, book, flask, store, user, chart, check, lock, flame, zap, arrow, trophy, target, gift, download, search, refresh, clock, edit, cube, note, quiz, dll.) — **tidak ada emoji** |
| `Mascot` / `MiniMascot` | `Mascot.jsx` | maskot "Si Daun", 6 mood, SVG original; MiniMascot untuk brand mark |
| `Toast` (`ToastProvider`, `useToast`) | `Toast.jsx` | notifikasi global, variant success/accent/error, `aria-live` |
| `Eyebrow`, `SectionHead`, `PageHead`, `Topbar` | `UI.jsx` | header & label |
| `StatCard`, `PillStat` | `UI.jsx` | kartu statistik semantik (PillStat memetakan tone lama → baru) |
| `Progress`, `StepProgress` | `UI.jsx` | progress bar (dengan role progressbar) & langkah |
| `Feedback` | `UI.jsx` | blok info/ok/no |
| `Empty` | `UI.jsx` | empty state |
| `XPChip`, `StreakChip`, `LevelRing` | `UI.jsx` | HUD gamifikasi |
| `Quests` | `UI.jsx` | papan misi harian |
| `Layout` | `Layout.jsx` | shell: sidebar/topbar/bottomnav/footer |

**Data/util:** `db.js` (localStorage), `gamify.js` (XP/level/streak/quest), `fallback.js` (5 template produk + 4 waste options + menu + 3 modul lengkap).

**Konsistensi:** seluruh halaman memakai komponen yang sama — tidak ada duplikasi komponen sejenis.

---

# 14. Analytics & Metrics

**FACT: tidak ada analytics, telemetry, atau tracking event apa pun di aplikasi ini.** Tidak ada library analytics, tidak ada event tracking, tidak ada error reporting ke layanan luar.

Metrik produk yang **tercatat sebagai data lokal** (bisa dihitung ulang, tapi tidak ter-track sebagai event):
- Jumlah entri MBG, total & rata-rata limbah 7 hari.
- Streak hari, XP, level.
- Jumlah modul selesai & skor kuis.
- Jumlah produk di marketplace & riwayat Lab.
- Jumlah feedback terkirim.

**RECOMMENDATION:** jika ingin mengukur retensi (DAU, streak survival, funnel Lab→Market), perlu integrasi analytics terpisah — saat ini semuanya hanya bisa dilihat per-perangkat.

---

# 15. Responsive Behavior

Diverifikasi di browser nyata (FACT):

| Breakpoint | Layout | Bukti |
|---|---|---|
| **Mobile 390px** | Topbar sticky + bottom nav 6 item; sidebar hidden | overflow false di semua route; bottom nav 52px; touch target chip 42px |
| **Tablet 768px** | Sama seperti mobile (belum mencapai breakpoint 1024) | overflow false; sidebar `display:none` |
| **Desktop 1280px** | Sidebar evergreen 250px; topbar & bottom nav hidden | sidebar `display:flex`; overflow false |

- Breakpoint tunggal: **1024px**.
- Kontainer `max-width:980px` — di desktop lebar konten tidak full, ada whitespace kanan-kiri.
- Chip filter kategori horizontal-scroll (`flex-wrap:nowrap`, `overflowX:auto`) — tidak memaksa wrap.
- Tabel riwayat & progress siswa dibungkus `overflowX:auto` — scroll horizontal saat sempit.
- Bottom nav memakai `env(safe-area-inset-bottom)` untuk iPhone.

---

# 16. Accessibility

**Yang sudah ada (FACT):**
- `lang="id"` di `index.html`; `theme-color`, meta description.
- `::focus-visible` outline 3px leaf.
- `prefers-reduced-motion` block penuh (animasi/transisi ≤0.001ms, scroll smooth dimatikan).
- ARIA: `aria-label` pada nav & tombol ikon, `aria-current="page"`/`"step"` pada item aktif, `role="progressbar"` + `aria-valuenow`, `role="radiogroup"` + `aria-checked` (chip limbah), `role="img"` + `aria-label` pada canvas chart, `aria-live="polite"` pada toast, `role="status"` pada Feedback, sr-only table fallback data chart.
- `.sr-only` class tersedia.
- Quiz radio input disembunyikan visual tapi tetap dalam `<label>` + `<fieldset>`/`<legend>` (keyboard tetap usable).
- Kontras: `--ink-3` sudah dikelapkan ke `#5B7165` (AA pada paper); warna chip semantik gelap pada background muda.
- Touch target: `.btn` 48px, `.btn-sm` 40px, `.btn-ghost` 42px, `.navbtn` 52px, `button.chip` 42px, `.quiz-opt` 58px, `.input` 48px.
- Tidak ada emoji sebagai ikon (semua SVG original).

**Gap yang terlihat (OBSERVATION):**
- **Tidak ada "skip to content" link.**
- **Validasi form hanya lewat toast** — tidak ada pesan error inline di dekat field (class `.input-err` ada tapi tidak dipakai).
- **Hambatan keyboard:** modal `confirm()` native dipakai untuk hapus/reset (bisa di-navigasi keyboard, tapi tidak konsisten dengan UI lain).
- **Quiz radio visually-hidden** dengan label kustom — butuh uji screen reader sungguhan untuk memastikan state ter-announce.
- **Chart Teacher tidak punya fallback tabel sr-only** (hanya Dashboard yang punya).
- **Tidak ada uji screen reader formal** yang tercatat.

---

# 17. Product Gaps

Dibedakan: **FACT** (dibuktikan di kode), **OBSERVATION** (potensi masalah dari kode), **RECOMMENDATION** (usulan).

## G1 — Tidak ada backend & sinkronisasi (FACT)
Semua data `localStorage` per-browser. Berganti perangkat/menghapus cache = hilang semua progres. Guru tidak bisa melihat siswa lintas perangkat.
- **RECOMMENDATION:** jika ingin pakai sungguhan di kelas, perlu backend minimal (auth + sinkron data).

## G2 — Feedback guru tidak pernah sampai ke siswa (FACT)
`replate_feedback` punya field `isRead:false`, tetapi **tidak ada kode yang membaca field ini** — feedback hanya ditampilkan di halaman Teacher itu sendiri. Siswa tidak punya tempat menerima pesan.
- **RECOMMENDATION:** tampilkan feedback masuk di Beranda/Profil siswa dan tandai `isRead`.

## G3 — Tidak ada pemisahan role (FACT)
Tidak ada auth. Halaman Teacher bisa dibuka siapa saja dan membaca data pengguna sendiri. "Ruang Kelas" saat ini efektif dashboard 1 siswa, bukan kelas.
- **RECOMMENDATION:** tambahkan role (siswa/guru) + data kelas jika ingin fitur teacher bermakna.

## G4 — Asumsi "Dihemat 30%" statis (FACT)
Profile menampilkan "Dihemat (30%)" = `totalWaste × 0.3` tanpa dasar data nyata.
- **RECOMMENDATION:** turunkan dari kategori entri (mis. `habis` = hemat penuh) atau hapus kalau tidak bisa dijustifikasi.

## G5 — Dead code & dependency (FACT)
`react-router-dom` terpasang tapi tidak dipakai; `src/assets/*` & `public/icons.svg` tidak direferensikan; `build_err.log` kedaluwarsa menyesatkan; `README.md` korup (mojibake).
- **RECOMMENDATION:** bersihkan agar AI agent & developer baru tidak bingung. Tulis ulang README.

## G6 — Hardcoded "/3" di Teacher (FACT)
`PillStat "Modul selesai"` menulis `length+"/3"` — coupling ke jumlah modul saat ini.
- **RECOMMENDATION:** pakai `MODULES.length` agar tidak rusak saat modul bertambah.

## G7 — Best score membandingkan skor mentah (OBSERVATION)
`Math.max(...scores.map(s=>s.score))` membandingkan angka mentah; semua kuis saat ini berjumlah 3 soal jadi belum bug, tapi akan menyesatkan jika jumlah soal bervariasi.
- **RECOMMENDATION:** bandingkan persentase `score/totalQuestions`.

## G8 — Riwayat ter-cap 5, tidak ada pagination/sort/date filter (OBSERVATION)
Semua riwayat hanya tampil 5 terbaru tanpa cara melihat lebih banyak atau menyaring rentang tanggal.
- **RECOMMENDATION:** tambahkan pagination sederhana atau filter tanggal di Dashboard/Profile.

## G9 — Marketplace tidak ada transaksi/kontak (OBSERVATION)
Market adalah etalase statis — tidak ada tombol kontak, stok, atau alur transaksi. Sesuai scope "showcase edukasi", tetapi perlu ditegaskan agar tidak disangka e-commerce.

## G10 — Mode AI belum pernah diuji (FACT)
Cabang `VITE_OPENROUTER_KEY` ada di kode tetapi **tidak ada key yang diset**, sehingga selalu lewat fallback offline. Parsing JSON AI (`match(/\{[\s\S]*\}/)`) belum teruji terhadap respons nyata.
- **RECOMMENDATION:** uji dengan key asli sebelum mengklaim fitur AI.

## G11 — Tanpa analytics (FACT)
Lihat §14 — tidak ada pengukuran perilaku pengguna apa pun.

## G12 — `__reset()` debug helper tertinggal (FACT)
`App.jsx` mengekspor `__reset()` yang menghapus `replate_profile` & `replate_xp`. Tidak dipanggil di UI.
- **RECOMMENDATION:** hapus dari build produksi.

---

# 18. Product Summary

**Produk:** RE-PLATE — aplikasi pembelajaran gamifikasi yang mengubah pencatatan limbah makanan program MBG menjadi petualangan ekonomi sirkular bagi pelajar Indonesia.

**Pengguna:** pelajar SMA/SMK (primer), guru pembina MBG (sekunder) — semuanya dalam satu perangkat tanpa akun.

**Problem:** limbah makanan sekolah terbuang tanpa nilai; pelajar tidak tahu cara mengolahnya dan kehilangan motivasi untuk konsisten mencatat.

**Solusi:** satu loop terintegrasi — **catat sisa harian → kerjakan misi → pelajari modul terbimbing → kerjakan kuis → hasilkan ide produk → publikasikan ke market → kumpulkan XP, streak, level, dan lencana**.

**Fitur utama (14):** onboarding & profil; MBG tracker; statistik & grafik 7 hari; misi harian + bonus XP; jalur belajar 3 modul; reader dengan scroll-gate; kuis bertier XP; Lab Inovasi (AI opsional + offline); Market Circular (search + filter + jual manual); Ruang Kelas (statistik + export CSV + feedback); profil & 4 lencana; sistem gamifikasi; sistem toast & maskot 6 mood.

**Status implementasi saat ini:** seluruh fitur di atas **sudah berfungsi dan terverifikasi** di build production (Vite, 33 modul, lint oxlint bersih, build lolos) dan di browser nyata (semua flow utama dilalui: onboarding, input MBG, kuis, generate Lab, publish market, search/filter, feedback + CSV, klaim bonus harian). Responsif 390/768/1280px tanpa overflow, kontras AA, reduced-motion, touch target memadai, tanpa emoji.

**Kondisi data:** 100% lokal (`localStorage`, prefix `replate_`) — ini adalah batasan arsitektur terbesar saat ini (G1).

**Prioritas perbaikan terbesar (RECOMMENDATION):** (1) feedback guru harus sampai ke siswa (G2), (2) tulis ulang README + bersihkan dead code (G5), (3) jika dipakai kelas nyata: backend & role (G1, G3).

---

## Hal yang belum dapat dipastikan

- **Mode AI generator Inno belum diuji** (tidak ada `VITE_OPENROUTER_KEY`); kualitas & ketahanan parsing respons nyata tidak diketahui.
- **Uji screen reader formal belum dilakukan** — struktur ARIA sudah ada, tapi belum diverifikasi dengan NVDA/TalkBack/VoiceOver.
- **Performa pada device low-end** belum diukur (bundle 496 KB / 158 KB gzip; Chart.js menyumbang besar).
- **Jumlah modul & template produk** saat ini 3 + 5 — konten tambahan belum ada, dan tidak ada sistem CMS konten.
- **Kebutuhan jenjang selain SMA** belum ada (`school_type` di-hardcode `"SMA"`).
