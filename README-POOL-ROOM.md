# Pool Room Live Status Board — No‑Code Setup (Updated)

This folder is ready to upload to GitHub Pages. You only paste **one SQL script** in Supabase and copy-paste **two keys** into one JS file.

## Files
- `index.html` — Public Live Board
- `admin.html` — Owner Dashboard
- `styles.css` — Styles
- `js/supabaseClient.js` — Put your Supabase URL + anon key here
- `js/publicBoard.js` — Public board (polling + optional realtime)
- `js/admin.js` — Owner dashboard (polling + optional realtime)
- `sql/setup.sql` — Copy-paste into Supabase SQL Editor

---

## 0) You need
- Supabase account
- GitHub account

---

## 1) Supabase: run the SQL (copy from `sql/setup.sql`)
1) In Supabase → **SQL Editor** → paste everything from `sql/setup.sql` → **RUN**.

> We added `create extension if not exists pgcrypto;` to avoid the earlier SQL error and a trigger to keep `updated_at` current.

---

## 2) Get your keys
- **Settings → API** → copy **Project URL** and **anon public key**.

---

## 3) Edit one file
Open `js/supabaseClient.js` and replace the URL and key placeholders. Save.

---

## 4) Upload to GitHub → Turn on Pages
- Create a repo, upload all files, enable **Settings → Pages → Deploy from a branch (main / root)**.
- Your site appears at `https://YOURNAME.github.io/REPO/`.

---

## 5) Create owner and add a room
- Go to `.../admin.html` → **Create Account** → **Sign In**.
- Add a first room via SQL (Authentication → Users → copy the user's UUID):
```sql
insert into public.rooms (name, owner_id, status)
values ('Downtown Billiards', 'OWNER_UUID', 'green');
```

---

## Notes
- Realtime is **optional**. The app auto-refreshes every 10 seconds.
- If realtime becomes available later, it will work automatically.
- If you still hit SQL errors, paste the exact error message when you ask for help.
