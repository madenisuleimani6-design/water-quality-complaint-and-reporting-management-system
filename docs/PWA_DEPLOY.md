# PWA deployment guide

Citizens can use the app as a **mobile-only Progressive Web App** — install from the browser, no APK or Expo Go required.

**Recommended:** [frontend-pwa/](../frontend-pwa/) — standalone Vite + React PWA.

**Alternative:** [frontend/](../frontend/) Expo `build:web` export (branch `feat/expo-web-pwa`).

## Prerequisites

- Node.js 22+
- Backend API reachable over **HTTPS** in production
- A static file host (Nginx, Caddy, S3 + CloudFront, Netlify, Vercel static, etc.)

## Build — `frontend-pwa/` (recommended)

```bash
cd frontend-pwa
cp .env.example .env
# VITE_API_URL=https://api.your-domain.com

npm install
npm run build
```

Output: `frontend-pwa/dist/` — SPA with service worker and manifest (via `vite-plugin-pwa`).

Preview locally:

```bash
npm run preview
npm run preview:lan    # http://YOUR_LAN_IP:4173 for phone testing
```

For full PWA behaviour (install prompt, service worker, geolocation), serve over **HTTPS** in production.

### Phone testing on LAN

1. Backend: `python manage.py runserver 0.0.0.0:8000`
2. Set `VITE_API_URL=http://YOUR_LAN_IP:8000` in `.env`
3. `npm run dev -- --host` or `npm run preview:lan` after build
4. Open `http://YOUR_LAN_IP:5173` (dev) or `:4173` (preview) on your phone (same Wi-Fi)

## Build — Expo web export (alternative)

```bash
cd frontend
cp .env.example .env
# EXPO_PUBLIC_API_URL=https://api.your-domain.com

npm install
npm run build:web
```

Output: `frontend/dist/` — static HTML export + `web/post-export.mjs` manifest/SW.

Preview: `npm run preview:web`

## What the build includes

| Artifact | `frontend-pwa` | Expo `frontend` |
|----------|----------------|-----------------|
| App shell | `index.html` + client router | Per-route HTML + JS |
| Manifest | `manifest.webmanifest` (vite-plugin-pwa) | `post-export.mjs` |
| Service worker | Workbox via vite-plugin-pwa | `sw.js` template |
| Icons | `public/icon.png`, `pwa-icon-512.png`, etc. | `assets/` copied to dist |

Icons and fonts are sourced from the same DAWASA assets as the React Native app.

## Backend configuration

### API URL

| App | Env var | When set |
|-----|---------|----------|
| `frontend-pwa` | `VITE_API_URL` | Build time (`npm run build`) |
| Expo web | `EXPO_PUBLIC_API_URL` | Build time (`npm run build:web`) |

```bash
VITE_API_URL=https://api.your-domain.com npm run build
```

### CORS (production)

In `backend/.env` with `DJANGO_SETTINGS_MODULE=config.settings.production`:

```env
CORS_ALLOWED_ORIGINS=https://app.your-domain.com
```

Development already allows `localhost:8081`, `19006`, and LAN IPs via regex.

### WebSockets

Complaint live status uses:

```
wss://api.your-domain.com/ws/complaints/{id}/
```

Ensure your reverse proxy forwards WebSocket upgrades on the same host as the REST API, or update `getWebSocketUrl()` in `frontend-pwa/src/constants/config.ts` (or `frontend/constants/config.ts` for Expo).

### ALLOWED_HOSTS

Set `ALLOWED_HOSTS` in production to your API hostname.

## Static hosting

Serve `frontend-pwa/dist/` (or `frontend/dist/` for Expo export) with:

1. **SPA fallback** — unknown paths return `index.html` (Expo Router client navigation).
2. **HTTPS** — required for service worker registration and geolocation.
3. **Cache headers**
   - Long cache: hashed assets under `_expo/static/`
   - No cache or short cache: `sw.js`, `manifest.webmanifest`

### Nginx example

```nginx
server {
    listen 443 ssl;
    server_name app.your-domain.com;
    root /var/www/dawasa-pwa/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /sw.js {
        add_header Cache-Control "no-cache";
    }

    location = /manifest.webmanifest {
        add_header Cache-Control "no-cache";
    }
}
```

## Mobile QA checklist

Test on a real phone before release:

- [ ] **Install** — Chrome Android “Install app”; iOS Safari Share → Add to Home Screen
- [ ] **Standalone** — opens without browser chrome; theme color `#007AFF`
- [ ] **Splash** — branded screen while loading (no white flash)
- [ ] **Auth** — welcome → phone → OTP → onboarding / home
- [ ] **Home** — complaints list, pull-to-refresh, FAB report, install prompt
- [ ] **Report** — photo (camera or gallery), location or manual area, submit
- [ ] **Submitted** — live status updates via WebSocket
- [ ] **Complaint detail** — status tracker
- [ ] **Messages** — send message; keyboard does not cover composer
- [ ] **Profile** — edit fields, language EN/SW
- [ ] **Offline** — submit report offline; syncs when back online

## Git workflow

| Branch | Use |
|--------|-----|
| `development` | Local development |
| `main` | Production (Render + Vercel) |
| `restore-point/2026-07-02` | Tagged stable dev snapshot |

See [DEPLOY_RENDER_VERCEL.md](DEPLOY_RENDER_VERCEL.md) for hosting setup.

Standalone Vite PWA: branch `development` (formerly `feat/vite-standalone-pwa`).

Expo web PWA hardening: branch `feat/expo-web-pwa`.

Stable snapshot before PWA work: tag `restore-point/pre-pwa`.
