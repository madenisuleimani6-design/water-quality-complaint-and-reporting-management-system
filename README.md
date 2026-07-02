# DAWASA Water Quality Complaint & Reporting System

Citizen reporting app (Android + PWA) and staff dashboard for Dar es Salaam Water and Sewerage Authority (DAWASA). Citizens can report water quality issues with photos and location, track complaint status, and message DAWASA. Staff use the Django admin and API to manage complaints, hotspots, and reports.

## Repository structure

```
├── frontend/       # React Native + Expo (Android; optional Expo web export)
├── frontend-pwa/   # Standalone Vite React PWA (recommended for citizens)
├── backend/        # Django REST API + admin dashboard
└── docs/           # API and technical documentation
```

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Citizen PWA** | Vite, React, TypeScript, Tailwind, shadcn/ui, Framer Motion, vite-plugin-pWA (`frontend-pwa/`) |
| **Native app** | React Native, Expo (SDK 56), Expo Router, NativeWind (`frontend/`) |
| **Backend** | Django, Django REST Framework, Django Channels (WebSockets), SQLite (dev) |
| **Auth** | Citizen phone OTP + JWT; staff JWT |
| **Other** | Axios, offline queue, ReportLab (PDF reports) |

## Prerequisites

- Node.js 22+
- Python 3.13+

## How to run

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
copy .env.example .env        # cp on macOS / Linux
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

- API: `http://localhost:8000`
- Admin: `http://localhost:8000/admin/`
- API reference: [docs/API.md](docs/API.md)

**Optional — seed demo data (development)**

```bash
python manage.py seed_demo_data
python manage.py seed_demo_data --citizen-only
```

Mock OTP is printed in the terminal when `OTP_MOCK_MODE` is enabled (default in development). Demo phone: `0712345678`.

### Demo users

Seeded by `python manage.py seed_demo_data` (included in the tracked `backend/db.sqlite3` for local and Render SQLite deploys).

#### Staff — Django admin (`/admin/`)

All demo staff share password **`demo12345`**. Recommended login: **`supervisor_nyoni`**.

| Username | Password | Role | Email | Name |
|----------|----------|------|-------|------|
| `supervisor_nyoni` | `demo12345` | supervisor | nyoni@dawasa.go.tz | Asha Nyoni |
| `officer_mwamba` | `demo12345` | field_officer | mwamba@dawasa.go.tz | Juma Mwamba |
| `officer_kassim` | `demo12345` | field_officer | kassim@dawasa.go.tz | Fatma Kassim |
| `viewer_hassan` | `demo12345` | viewer | hassan@dawasa.go.tz | Omar Hassan |

These accounts are staff users (`is_staff=True`), not Django superusers. They can use the admin dashboard with role-based access but cannot manage all Django superuser-only features.

#### Super admin — Django superuser

| Username | Password | Email |
|----------|----------|-------|
| `admin` | `suleimanimaulid@123` | suleimanimaulid@gmail.com |

Log in at `/admin/` with the credentials above for full superuser access. This account is stored in `backend/db.sqlite3` (included in the repo for Render SQLite deploys).

To create an additional superuser locally or on Render:

```bash
cd backend
python manage.py createsuperuser
```

**Non-interactive:**

```bash
$env:DJANGO_SUPERUSER_USERNAME="admin"
$env:DJANGO_SUPERUSER_EMAIL="your@email.com"
$env:DJANGO_SUPERUSER_PASSWORD="your-secure-password"
python manage.py createsuperuser --noinput
```

For day-to-day demo work, **`supervisor_nyoni` / `demo12345`** is also available (staff, not superuser).

#### Citizen — PWA / mobile app (phone OTP)

Citizens sign in with **phone + OTP** (no password).

| Phone | Alt format | Name | Email |
|-------|------------|------|-------|
| `0712345678` | `+255712345678` | Amina Hassan | amina.hassan@example.com |

- **Local dev:** set `OTP_MOCK_MODE=true` — the OTP code is printed in the Django terminal when you request a code.
- **Production:** set `OTP_MOCK_MODE=false` on Render — real SMS delivery is not configured yet; use mock mode only for demos until an SMS provider is wired up.

### Citizen PWA (recommended — no Expo Go or APK)

```bash
cd frontend-pwa
copy .env.example .env        # set VITE_API_URL (LAN IP for phone testing)
npm install
npm run dev                   # http://localhost:5173
npm run build                 # outputs frontend-pwa/dist/
npm run preview:lan           # preview on 0.0.0.0 for phone on same Wi-Fi
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production PWA build → `dist/` |
| `npm run preview` | Local preview |
| `npm run preview:lan` | Preview reachable from phone on LAN |

Build with API URL baked in:

```bash
VITE_API_URL=http://192.168.1.42:8000 npm run build
```

See [docs/PWA_DEPLOY.md](docs/PWA_DEPLOY.md) for HTTPS deploy and mobile QA.

### Expo / React Native (`frontend/`)

```bash
cd frontend
copy .env.example .env        # cp on macOS / Linux
npm install
npm run start:dev             # Windows: auto LAN IP + Expo (physical device)
# ./scripts/start-dev.sh      # macOS / Linux
```

On a physical device, use your machine’s LAN IP (not `localhost`). The `start:dev` script detects it, updates `frontend/.env`, and starts Expo with a consistent packager hostname.

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Detect LAN IP, update `.env`, start Expo (Windows) |
| `npm run start:dev:android` | Same + open Android |
| `npm run start` | Expo dev server (manual `.env`) |
| `npm run android` | Open on Android |
| `npm run web` | Expo web in browser (alternative PWA path) |
| `npm run build:web` | Expo static PWA export → `frontend/dist/` |
| `npm run preview:web` | Serve Expo `dist/` locally |
| `npm test` | Run frontend tests |

## Git branches

| Branch | Use |
|--------|-----|
| `development` | Local development (default working branch) |
| `main` | Production — deployed to Render + Vercel |
| `restore-point/2026-07-02` | Tagged stable dev snapshot |

Production deploy guide: [docs/DEPLOY_RENDER_VERCEL.md](docs/DEPLOY_RENDER_VERCEL.md)

```bash
git checkout development   # daily work
```

## License

University project — DAWASA Water Quality Reporting.
