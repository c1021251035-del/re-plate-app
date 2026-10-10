# RE-PLATE — Smart Food Waste Hub & Circular Economy

Universitas Tanjungpura · LIDM 2026 · SDGs 12.3

Aplikasi pembelajaran gamifikasi: pelajar mencatat sisa makanan MBG,
menyelesaikan misi harian, belajar 3 modul ekonomi sirkular lewat kuis,
merancang produk di Lab Inovasi, mempublikasikannya ke Market Circular,
dan mengumpulkan XP, streak, level, + 4 lencana.

## Jalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build production ke dist/
npm run lint     # oxlint
```

## Layar (6 + onboarding)

| Rute | Layar | Isi |
|---|---|---|
| (onboarding) | Setup profil | 3 slide + form nama, kelas, sekolah |
| `#dashboard` | Beranda | Sapaan, lanjut belajar, misi harian + peti bonus, input MBG, statistik, tren 7 hari, riwayat |
| `#inno` | Lab Inovasi | Pilih limbah + berat → rekomendasi produk (AI opsional / offline), publish ke Market |
| `#pedagogy` | Belajar | Jalur 3 modul, reader + scroll-gate 90%, kuis bertier XP |
| `#marketplace` | Market | Cari + filter kategori, jual manual, hapus |
| `#teacher` | Kelas | Statistik, tren, tabel siswa, export CSV, feedback |
| `#profile` | Profil | XP/level/streak, 4 lencana, riwayat, edit profil, reset |

## Gamifikasi

- **XP**: +10 log MBG, +15 Lab, +20/+12/+8 kuis, +25 peti bonus harian, +5 streak ≥ 3 hari.
- **Level**: 100 XP per level + judul tematik (Benih Baru → Legenda RE-PLATE).
- **Misi harian**: 3 quest dari data nyata (bukan dekoratif); bonus diklaim lewat peti emas.
- **Lencana**: Pemula Hijau, Pelajar Telaten, Penemu Muda, Mahir 3R (sempurna di semua kuis).
- **Momen reward**: XP pop, denting ring HUD, overlay naik level, konfeti, shine lencana.

## Desain

"Clay Garden": claymorphism mainan ala Duolingo di atas kertas hangat.
Tombol utama hijau gelap + teks putih (kontras AA 5.27:1), emas khusus
momen reward. Semua animasi `transform`/`opacity` + `prefers-reduced-motion`.

## Data & Env

- 100% `localStorage` (prefix `replate_`), tanpa backend, tanpa akun.
- `VITE_OPENROUTER_KEY` (opsional): AI Lab via OpenRouter; kosong = fallback offline.

## Tech

React 19 + Vite + Chart.js + CSS custom properties (tanpa framework CSS).
