# Deploy: Render (API) + Vercel (PWA)

Production branch: **`main`**. Daily development: **`development`**.

## Git branches

| Branch | Purpose |
|--------|---------|
| `development` | Local work — full commit history |
| `main` | Production deploy — squashed releases |
| `restore-point/2026-07-02` | Tagged snapshot of stable dev |

```bash
git checkout development    # local dev
git checkout main           # inspect production line only
git checkout restore-point/2026-07-02   # rollback reference
```

Release workflow (when ready for next deploy):

```bash
git checkout main
git merge --squash development
git commit -m "release: DAWASA production YYYY-MM-DD"
git push origin main
git checkout development
```

---

## 1. Render — Django backend

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** (or Web Service from repo).
2. Connect repo: `Dawasa-quality-Complaints-and-reporting-management-system`
3. Branch: **`main`**
4. Root directory: **`backend`**
5. Use [`backend/render.yaml`](../backend/render.yaml) or manual settings:
   - **Build:** `chmod +x ./build.sh && ./build.sh`
   - **Start:** `daphne config.asgi:application -b 0.0.0.0 -p $PORT`
6. Add **PostgreSQL** database; link `DATABASE_URL` to the web service.
7. Set environment variables:

| Variable | Example |
|----------|---------|
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` |
| `DJANGO_SECRET_KEY` | (auto-generate or 32+ random chars) |
| `DJANGO_ALLOWED_HOSTS` | `dawasa-api.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `DATABASE_URL` | (from Postgres add-on) |
| `OTP_MOCK_MODE` | `false` |
| `MAP_BOX_TOKEN` | Full Mapbox **public** token from [mapbox.com](https://account.mapbox.com/) (starts with `pk.`, ~90+ chars). **Do not** use placeholders like `pk.eyJ1Ijoi...`. In Mapbox token settings, allow URL `https://YOUR-SERVICE.onrender.com/*`. |
| `REDIS_URL` | (optional — enables live WebSocket status) |

8. After deploy, open `https://YOUR-SERVICE.onrender.com/admin/` and create a superuser via Render shell:

```bash
python manage.py createsuperuser
```

**Note:** Complaint photos use local disk on Render (ephemeral). For persistent media, add object storage later.

---

## 2. Vercel — Citizen PWA

1. [Vercel Dashboard](https://vercel.com) → **Add New** → **Project** → import repo.
2. Branch: **`main`**
3. Root directory: **`frontend-pwa`**
4. Framework: Vite (auto-detected)
5. Build command: `npm run build`
6. Output: `dist`
7. Environment variable (Production):

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://YOUR-SERVICE.onrender.com` |

8. Deploy. [`vercel.json`](../frontend-pwa/vercel.json) handles SPA routing.

---

## 3. Cross-link services

1. Deploy **backend first**; copy the Render URL.
2. Set `VITE_API_URL` on Vercel to that URL; redeploy PWA.
3. Set `CORS_ALLOWED_ORIGINS` on Render to your Vercel URL (no trailing slash); redeploy API.

---

## 4. Smoke test

- [ ] PWA loads over HTTPS
- [ ] OTP / login flow
- [ ] Submit complaint with photo
- [ ] Messages: send + admin reply visible in app
- [ ] PWA install prompt on mobile
- [ ] Admin dashboard at `/admin/`

---

## Local development (unchanged)

```bash
# Terminal 1
cd backend && python manage.py runserver 0.0.0.0:8000

# Terminal 2
cd frontend-pwa && npm run dev
```

Stay on **`development`** branch. Do not commit `.env` files.
