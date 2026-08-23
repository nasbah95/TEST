# Sistem Keahlian + Supabase

Versi ini ialah starter system menggunakan HTML/CSS/JavaScript + Supabase.

## Fail

- `index.html` - paparan sistem
- `style.css` - reka bentuk
- `app.js` - fungsi Supabase, tambah, edit, padam, carian dan dashboard
- `supabase.sql` - bina table dan RLS untuk TEST

## Setup Supabase

1. Buka Supabase.
2. Buka SQL Editor.
3. Salin semua kandungan `supabase.sql`.
4. Tekan Run.
5. Pergi ke Project Settings > API.
6. Ambil Project URL dan Publishable key.
7. Buka `app.js`.
8. Gantikan:
   - `MASUKKAN_SUPABASE_URL_ANDA`
   - `MASUKKAN_SUPABASE_PUBLISHABLE_KEY_ANDA`

## GitHub

Letakkan semua fail pada root repository:

```text
TEST/
├── index.html
├── style.css
├── app.js
└── supabase.sql
```

`README.md` boleh diletakkan sekali.

## Nota keselamatan

Polisi RLS dalam `supabase.sql` sengaja dibuka untuk tujuan TEST supaya frontend tanpa login boleh CRUD.

Jangan gunakan polisi tersebut untuk sistem sebenar yang menyimpan No. IC, alamat atau data peribadi. Untuk versi production, tambah Supabase Authentication dan polisi RLS berdasarkan `auth.uid()` / role pengguna.
