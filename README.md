# Stocks Alerts — React Native + Node

Full-stack technical test: a React Native (Expo) app and a Node backend that show
**real-time stock data** (Finnhub) and send a **Firebase Cloud Messaging** push
when a stock price crosses a user-defined alert.


<video controls autoplay muted loop playsinline width="100%">
  <source src="./docs/home.mp4" type="video/mp4" />
</video>

This repo is a monorepo:

```
.            → Expo + TypeScript app (Clean Architecture + MVVM)
└─ api/      → Node + Express + Postgres backend (JWT auth, alerts, FCM)
```

## Features (test requirements)

| # | Requirement | Status | Where |
| --- | --- | --- | --- |
| 1 | Users can log in | ✅ | `src/ui/screens/Login`, `api/src/modules/auth` |
| 2 | Form to create a stock price alert | ✅ | `src/ui/screens/CreateStockAlert`, `api/.../webhooks` |
| 3 | List of stocks | ✅ | **Mercado** screen — live watchlist (`src/ui/screens/Home`), `GetStockListUseCase` |
| 4 | Graphic of all stocks | ✅ | Sparkline per stock + aggregate (Home) · area chart per stock (`src/ui/screens/StockDetail`, `PriceChart`) |
| 5 | FCM push when price > alert | ✅ | `src/.../pushNotificationManager`, `api/src/worker`, `api/src/services/fcm` |
| ★ | Docker for backend deployment | ✅ | `api/Dockerfile`, `api/docker-compose.prod.yml` |

### Beyond the requirements

The app was taken well past the brief into a production-feel product:

- **Design system** (`src/ui/styles` tokens + `src/ui/components`) — dark
  "trading-terminal" theme, token-driven primitives, micro-interactions
  (press-scale, staggered entrances, breathing glow, blur), enforced by
  [`skills/design-system.md`](./skills/design-system.md).
- **Real-time everywhere** — Finnhub websocket drives live prices on Home and
  the detail chart (ref-counted subscriptions so screens share one socket).
- **Full alert lifecycle** — create (react-hook-form + zod), list, delete and
  fire a **test push** per alert.
- **Onboarding + profile** — notification-permissions step and a profile tab.
- **Architecture enforced by the linter** — `no-restricted-imports` boundaries
  guarantee the one-way `ui → domain ← data` flow (not just discipline).

## Tech stack

**App:** Expo SDK 55, React Native, TypeScript, **MobX** (state) + **Inversify**
(DI), React Navigation, expo-notifications (FCM), expo-secure-store (JWT),
axios.

**Backend:** Node ≥20, Express, PostgreSQL (`pg`), Passport (JWT + local),
bcrypt, Joi, firebase-admin (FCM), `ws` (Finnhub realtime hub).

## Architecture (app)

Strict one-way **Clean Architecture + MVVM**:

```
ui → viewModel → useCase → repository(contract) ← repositoryImpl
                                repositoryImpl → service(contract) ← serviceImpl
                                                     serviceImpl → manager (infra)
```

- **Managers** (`data/network`, `data/storage`) do raw I/O (HTTP, websocket,
  secure storage, expo SDKs).
- **Services** (`data/services`) wrap a manager and map DTO → domain entities —
  the single crossing into the domain.
- **Repositories** (`data/repositories`) delegate to a service; **UseCases**
  (one per action) depend on repository contracts; **ViewModels** (MobX) drive
  the screens. Everything is wired with Inversify in `src/config/di.ts`.

Full rules and templates live in [`/skills`](./skills) and
[`CLAUDE.md`](./CLAUDE.md). Layer map: [`src/README.md`](./src/README.md).

## Getting started

### 1. Backend (`api/`)

**With Docker (recommended — the deployment setup):**

```bash
cd api
cp .env.example .env        # fill FINNHUB_API_KEY, JWT_SECRET, FCM creds
docker compose -f docker-compose.prod.yml up --build -d
curl http://localhost:3000/health
# → {"status":"ok","fcm":true,"finnhub":true,"streaming":true}
```

**Locally (Node on host, Postgres in Docker):**

```bash
cd api
docker compose up -d        # Postgres + pgAdmin (dev)
npm install
npm run dev                 # runs migrations on boot, starts on :3000
```

Backend env vars (`api/.env`):

| Var | Purpose |
| --- | --- |
| `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` | Postgres connection |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Auth token signing |
| `FINNHUB_API_KEY` | Server-side Finnhub key (quotes + realtime hub) |
| `FIREBASE_SERVICE_ACCOUNT` _or_ `GOOGLE_APPLICATION_CREDENTIALS` | FCM credentials (inline JSON / path) |
| `STREAMING_ENABLED` | Realtime hub (true) vs polling worker (false) |

### 2. App (repo root)

```bash
cp .env.example .env        # fill EXPO_PUBLIC_* (see below)
npm install
npm start                   # Expo dev server (clears Metro cache)
```

App env vars (`.env`, only `EXPO_PUBLIC_*` reach the bundle):

| Var | Purpose |
| --- | --- |
| `EXPO_PUBLIC_FINNHUB_API_KEY` / `_BASE_URL` / `_SOCKET_URL` | Finnhub REST + websocket |
| `EXPO_PUBLIC_BACKEND_BASE_URL` | Your Node backend (use your **LAN IP** on a device, not `localhost`) |

> On a physical device, set `EXPO_PUBLIC_BACKEND_BASE_URL=http://<your-LAN-ip>:3000`
> — the phone cannot reach your machine's `localhost`.

### Test user

A seeded account for the app login: **`appcheck@test.com` / `password123`**.

## Firebase Cloud Messaging (feature 5)

Remote push needs a **native build** (FCM does not work in Expo Go) and a Firebase
project shared by app + backend:

1. **App**: place `google-services.json` at the repo root (gitignored);
   `app.json` already references it (`android.googleServicesFile`).
2. **Backend**: set `FIREBASE_SERVICE_ACCOUNT` / `GOOGLE_APPLICATION_CREDENTIALS`
   → `/health` reports `"fcm":true`.
3. **Build** the app and install on a device:
   ```bash
   eas build -p android --profile preview
   ```
   On launch (after login) the app registers its FCM device token with the
   backend (`POST /devices`, tied to the user via the Bearer token).
4. **Trigger a push** (no need to wait for a real crossing):
   ```bash
   # create an alert in the app, then fire a test push for it:
   curl -X POST http://localhost:3000/webhooks/<ALERT_ID>/test
   ```
   The background worker also polls Finnhub and fires automatically when a price
   actually crosses, deactivating the alert so it notifies once.

## API quick reference

```
POST /auth/register        { email, password } → { token, user }
POST /auth/login           { email, password } → { token, user }
GET  /auth/me              (Bearer)            → { user }
POST /devices              { token, platform } → register FCM token
POST /webhooks             { url, event }      → create alert (event = "stock-price-alert:AAPL:above:150")
POST /webhooks/:id/test                        → fire a test push now
GET  /health                                   → integration status
```

## Scripts

App: `npm start` · `npm run android|ios|web` · `npm run typecheck` ·
`npm run lint` · `npm run format`.
Backend: `npm run dev` · `npm run build` · `npm start` · `npm run migrate`.

## Notes & limitations

- The full `/stock/symbol` catalog (~30k symbols) is fetched on Home; the
  **Mercado** screen renders a curated, live watchlist (real websocket prices +
  REST quotes for the daily change). Charts are built from the live tick stream
  plus the quote's intraday trajectory — Finnhub's free tier has no historical
  candles, so the detail range selector is visual (no deep multi-range history).
- `EXPO_PUBLIC_*` values are inlined into the client bundle — fine for a free
  Finnhub key, but never put a truly secret key in the app.
- The realtime feed uses Finnhub's free websocket, which periodically drops the
  stream; the client reconnects with exponential backoff.
