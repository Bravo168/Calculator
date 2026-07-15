# Calculator

PWA (Progressive Web App) sederhana — kalkulator dasar (tambah, kurang, kali, bagi, persen,
negate), bisa diinstall ke desktop/HP dan dibuka seperti aplikasi biasa (offline-capable via
service worker). Tidak ada build step; murni HTML/CSS/JS statis.

## Struktur

| File | Fungsi |
|---|---|
| `index.html` | Shell halaman + tombol kalkulator |
| `style.css` | Tampilan (tombol bulat ala iOS calculator) + variabel warna untuk 3 tema |
| `app.js` | Logika kalkulator, dukungan keyboard, daftarkan service worker |
| `manifest.json` | Metadata PWA (nama, warna, ikon) agar bisa diinstall |
| `service-worker.js` | Cache aset supaya app tetap terbuka saat offline |
| `icons/` | Ikon app (192/512, termasuk versi maskable) + `gen_icons.py` untuk regenerate |

## Tema

Tombol 🌙/☀️/🖥️ di kanan atas kalkulator mengganti tema, tersimpan di `localStorage` jadi tetap
dipakai saat dibuka lagi:

- 🌙 **Dark** (default) — abu-abu gelap, aksen amber
- ☀️ **Light** — putih bersih, aksen biru
- 🖥️ **Retro** — LCD hijau phosphor ala kalkulator jadul

Tema didefinisikan sebagai CSS custom properties di `style.css` lewat atribut `data-theme` pada
`<html>`. Untuk menambah tema baru, tambahkan blok `[data-theme="nama"] { --var: ...; }` dan daftarkan
namanya di array `THEMES` / `THEME_ICONS` pada `app.js`.

## Keyboard shortcut

- `0-9`, `.` — input angka
- `+ - * /` — operator
- `Enter` / `=` — hasil
- `Backspace` — hapus digit terakhir
- `Escape` — clear (AC)

## Menjalankan / testing lokal

Service worker butuh HTTP(S), tidak bisa dibuka langsung via `file://`. Jalankan server statis
sederhana dari folder ini:

```
python -m http.server 8000
```

lalu buka `http://localhost:8000` di browser. Untuk test "Install App", buka via Chrome/Edge dan
klik ikon install di address bar (atau menu ⋮ → Install).

## Update aset (penting!)

Service worker cache-first: setiap kali `index.html`/`style.css`/`app.js` diubah, **naikkan
`CACHE_NAME`** di `service-worker.js` (mis. `calculator-v2` → `calculator-v3`). Tanpa ini, browser/HP
yang sudah pernah membuka app akan terus memakai versi lama yang ter-cache — perubahan baru tidak akan
kelihatan sampai cache dihapus manual. Setelah bump, user cukup reload halaman (mungkin 2x) untuk dapat
versi baru.

## Deploy

Karena ini file statis, bisa langsung di-host di GitHub Pages, Netlify, Vercel, atau hosting statis
apa pun — cukup upload semua isi folder ini. PWA (install prompt + offline) hanya aktif di atas
HTTPS (localhost dikecualikan untuk testing).

## Ganti ikon app

Ikon default (`icons/icon-*.png`) adalah placeholder gelap dengan simbol "=" oranye. Jalankan ulang
`python gen_icons.py` di dalam folder `icons/` untuk regenerate, atau ganti manual dengan logo asli
memakai ukuran yang sama (192×192 dan 512×512, plus versi maskable dengan padding ekstra ~20%).
