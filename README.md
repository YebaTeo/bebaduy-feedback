# BeBaduy Feedback (`bebaduy-feedback`)

A standalone bilingual (**Bahasa Indonesia / English**) web app for collecting, triaging, and exporting user feedback for the **BeBaduy** iOS app.

Designed directly from BeBaduy's visual language: sunlit morning Kanekes hills (`#CCB0A1` / `#FFF5DE` / `#5B651D` paddy-leaf olive) flowing into the deep earth Kanekes valley (`#2C1E14`) and BeBaduy's signature woven-glass `HumaGlassCard` (burnt amber `#D05C00`, harvest gold `#F5A640`, warm cream `#FFF6ED`, *tenun* weave, and curved gold corner ornaments).

---

## Features

- **Public Feedback Sanctuary (`/`):**
  - Bilingual switcher (**ID / EN**) persisted in `localStorage`.
  - 5-point experience rating with warm descriptive captions.
  - Topic tags (`Bug / Kendala`, `Saran Fitur`, `Cerita & Budaya`, `Sensor & 3D`, `Apresiasi`, `Lainnya`).
  - Interactive BeBaduy chapter selector synced with the app's 6 *Ngahuma* stages (`Narawas`, `Ngaseuk`, `Ngored`, `Mipit`, `Ngalantai`, `Ngaleuitkeun`) plus `Koleksi` and `Umum`.
  - Optional sender name, email, device/iOS info, and app version.
  - Anti-spam honeypot + per-IP rate limiting + unique `HUMA-XXXX` receipt code.
- **Password-Protected Maintainer Inbox (`/inbox`):**
  - Signed `HttpOnly` HMAC-SHA256 session cookie authentication.
  - Live summary metrics (Total, New, Resolved, Average Rating).
  - Search and filter by status, category, and chapter.
  - Inline status triage (`new`, `reviewed`, `resolved`, `archived`), internal maintainer notes, and two-step delete.
  - One-click **Export CSV** (Excel UTF-8 BOM + spreadsheet formula-injection safe) and **Export JSON**.
- **Pluggable Storage (`src/lib/storage/`):**
  - Works out of the box with atomic local JSON storage (`data/feedback.json`).
  - Automatically upgrades to **Supabase** as soon as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public feedback form and [http://localhost:3000/inbox](http://localhost:3000/inbox) for the maintainer inbox.

### Default Local Inbox Passphrase

`.env.local` is preconfigured for local testing:

- **Passphrase:** `bebaduy-leuit-2026`

> **Before deploying:** update `ADMIN_PASSWORD` and `SESSION_SECRET` in your hosting environment variables to strong unique secrets.

---

## Supabase Database Setup (Already Pushed)

The `public.bebaduy_feedback` table, indexes, `updated_at` trigger, and RLS lockdown have already been pushed to your **Baduy** Supabase project (`ulkyjrblperugtbvpvye`, region `ap-southeast-1`).

To activate Supabase storage in your Next.js app (locally or in Vercel/Netlify environment variables):

1. Open [Supabase Dashboard → Settings → API Keys](https://supabase.com/dashboard/project/ulkyjrblperugtbvpvye/settings/api-keys).
2. Copy your **Secret API key** (`sb_secret_...`) from the **Publishable and secret API keys** tab (legacy `service_role` JWT is also supported via `SUPABASE_SERVICE_ROLE_KEY`).
3. Uncomment and paste it in `.env.local` (never prefix with `NEXT_PUBLIC_`):
   ```env
   SUPABASE_URL=https://ulkyjrblperugtbvpvye.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_...
   ```
4. Restart `npm run dev` — `/inbox` will display **"Terhubung ke Supabase"** / **"Connected to Supabase"**.

If you ever need to recreate the schema in another Supabase project, the SQL lives in [`supabase/schema.sql`](supabase/schema.sql).
