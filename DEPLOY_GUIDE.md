# SkillHire — Deploy & Share via WhatsApp (Full Cloud)

Goal: get the app online permanently (free), then share a normal link on WhatsApp.

Stack: **Laravel backend (MySQL)** → Railway (free tier). **React frontend** → Netlify (free).
I already prepared every config file and the frontend build. You only need to create 2 free accounts and click a few buttons.

---

## Part A — Backend on Railway

1. Go to https://railway.app → **Login/Sign up** (GitHub login = fastest).
2. Click **New Project** → **Deploy from GitHub repo** (select the `SkillHire` repo, then choose the **backend** folder as the root when prompted).
   - If your repo isn't listed: Railway → **Variables** tab → add `RAILWAY_GIT_CLONE_URL` doesn't help — just use **New Project → Deploy from GitHub** and grant repo access.
3. In the project, click **+ New** → **Database** → **MySQL** (this pre-creates `DB_*` / `MYSQL*` variables for you).
4. Now open **Variables** on the backend service and add (or update) these:

   | Variable | Value |
   |---|---|
   | `APP_ENV` | `production` |
   | `APP_DEBUG` | `false` |
   | `APP_KEY` | generate one: run `php artisan key:generate --show` locally and paste it (there's a `REPLACE_WITH_GENERATED_KEY` placeholder in `.env.railway.example`) |
   | `APP_URL` | your backend URL from step 6, e.g. `https://skillhire-api.up.railway.app` |
   | `CORS_ALLOWED_ORIGINS` | your Netlify URL from Part B, e.g. `https://skillhire.netlify.app` |
   | `DB_HOST` `DB_PORT` `DB_DATABASE` `DB_USERNAME` `DB_PASSWORD` | leave as provided by the MySQL template (same names automatically) |

   (Full reference: `backend/.env.railway.example`.)
5. **Deploy**: the service auto-builds via Nixpacks using `backend/railway.toml`. On start it runs `php artisan migrate --force` then serves via `php artisan serve`.
6. Wait for the deploy to say **Running/Green**, then **Deployments → Generate Domain** to get your HTTPS backend URL (copy it — you need it for Part B).
7. Sanity check: open `<your-backend-url>/up` — you should see `{"status":"ok"}`.

---

## Part B — Frontend on Netlify

1. Go to https://netlify.com → **Sign up** (GitHub/email).
2. **Add new site → Import an existing project → Deploy from GitHub** (choose the `SkillHire` repo, project root = **frontend**).
   - Netlify auto-reads `frontend/netlify.toml` (build = `npm run build`, publish = `dist`, SPA redirects already set).
3. Go to **Site configuration → Environment variables** and add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | your Railway backend URL + `/api`, e.g. `https://skillhire-api.up.railway.app/api` |
4. **Trigger deploy** (Deploys → Deploy site / redeploy). Wait for **Published**.
5. Open your site — **Done!** 👉 Copy `https://your-site.netlify.app`.

> If you'd rather **not** connect GitHub: `npm run build` locally, then Netlify → **Add new site → Deploy manually** and drag the `frontend/dist` folder + create `frontend/public/_redirects` (already included). Then set the environment variable and rebuild so the app points at the live API.

---

## Part C — Share on WhatsApp

- **New WhatsApp Share button** (already added to the dashboard top bar, green "Share"): click it → opens WhatsApp with `Check out SkillHire — Hire Smarter. Build Faster. {current URL}` prefilled.
- Or manually send: open WhatsApp and paste your Netlify URL, or use `https://wa.me/?text=Check%20out%20SkillHire%20https://your-site.netlify.app`.

---

## Notes / Security
- `APP_DEBUG=false` is set so no stack traces leak.
- The `APP_KEY` above is generated for this repo; keep it private. You can regenerate with `php artisan key:generate --show` after deploy and update Railway.
- Railway/Netlify use your own accounts — no one touches your PC, and the tunnel/shutdown is your machine safe.
- Register new users through the live `/register` page; the MySQL DB stores everything.