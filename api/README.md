# Stocks Backend (Node + Express + PostgreSQL)

Node backend for the **React Native + Node Developer** test. It backs the Expo
app's real-time stock features and implements the parts the device can't do on
its own:

| PDF requirement | Where it lives |
| --- | --- |
| 1. Users can log in | `POST /auth/register`, `POST /auth/login` (JWT) |
| 2. Create a stock price alert | `POST /webhooks` (alert encoded in `event`) |
| 3. List of stocks / 4. Graph | Served by Finnhub directly from the app |
| 5. **FCM push when price crosses the alert** | Alert worker + `firebase-admin` |
| Extra: Docker deployment | `Dockerfile` + `docker-compose.yml` |

Stack: **Express + TypeScript + PostgreSQL + JWT (bcrypt/jsonwebtoken) +
firebase-admin + Finnhub**, following the Notion "Node JS" course stack
(Express · PostgreSQL · Passport/JWT).

---

## How it works

```
App                          Backend (this)                 Finnhub / Firebase
 │  POST /auth/login          │                              │
 │ ──────────────────────────▶│  issue JWT                   │
 │  POST /devices {token}     │                              │
 │ ──────────────────────────▶│  upsert FCM token            │
 │  POST /webhooks {event}    │                              │
 │ ──────────────────────────▶│  store alert                 │
 │                            │  every POLL_INTERVAL_MS:      │
 │                            │   GET /quote?symbol  ────────▶│ (price)
 │                            │   price crossed target?       │
 │                            │   firebase-admin send ───────▶│ FCM
 │  ◀───────── push (data payload) ◀────────────────────────-┤
```

The alert worker (`src/worker/alertWorker.ts`) polls a live quote per distinct
symbol, and for any active alert whose threshold is crossed it pushes to every
registered device, then **deactivates the alert** so it fires only once.

---

## Project structure

```
src/
  config/      env loading, pg pool
  db/          schema.sql + idempotent migrate (runs on boot)
  lib/         HttpError
  middleware/  asyncHandler, JWT auth (require/optional), error handler
  modules/
    auth/      register / login / me  (bcrypt + JWT)
    devices/   POST /devices  (upsert FCM token)
    webhooks/  CRUD + /test for stock alerts, plus the FCM fan-out notifier
  services/    alerts (event encode/decode), finnhub client, fcm sender
  worker/      alertWorker (the polling loop)
  app.ts       Express wiring
  server.ts    bootstrap: migrate → listen → start worker
```

---

## API

All bodies are JSON. Auth endpoints return `{ token, user }`.

| Method | Path | Auth | Body / Notes |
| --- | --- | --- | --- |
| `GET` | `/health` | — | `{ status, fcm, finnhub }` integration status |
| `POST` | `/auth/register` | — | `{ email, password }` → `201 { token, user }` |
| `POST` | `/auth/login` | — | `{ email, password }` → `{ token, user }` |
| `GET` | `/auth/me` | Bearer | `{ user }` |
| `POST` | `/devices` | optional | `{ token, platform }` → `201 { id, token, platform, active, createdAt }` |
| `POST` | `/webhooks` | optional | `{ url?, event }` → `201 { id, url, event, active, createdAt }` |
| `GET` | `/webhooks` | optional | list alerts |
| `GET` | `/webhooks/:id` | optional | one alert |
| `DELETE` | `/webhooks/:id` | optional | `204` |
| `POST` | `/webhooks/:id/test` | optional | fire a test push immediately |

**Auth is optional** on `/devices` and `/webhooks`: the current app doesn't send
a token yet, so anonymous calls work. When a `Bearer` token *is* present, the
device/alert is tied to that user.

**Alert `event` format** (set by the app's `StockAlertModel`):

```
stock-price-alert:<SYMBOL>:<above|below>:<targetPrice>
# e.g.  stock-price-alert:AAPL:above:150
```

The FCM `data` payload sent to the device (all string-valued, per FCM):

```json
{ "symbol": "AAPL", "targetPrice": "150", "currentPrice": "152.34",
  "condition": "above", "alertId": "<uuid>" }
```

---

## Run it

### Option A — Docker (recommended, covers the extra credit)

```bash
cp .env.example .env        # then set FINNHUB_API_KEY (+ FIREBASE_SERVICE_ACCOUNT for real push)
docker compose up --build
```

This starts **PostgreSQL** and the **API** (port `3000`), waits for the DB to be
healthy, runs migrations, and launches the worker.

### Option B — Local Node (needs a Postgres running)

```bash
cp .env.example .env        # point PG* at your Postgres
npm install
npm run dev                 # tsx watch; migrations run on boot
```

Production build: `npm run build && npm start`.

---

## Configuration

See `.env.example`. Key vars:

| Var | Purpose |
| --- | --- |
| `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` or `DATABASE_URL` | Postgres connection |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | token signing (**change the secret**) |
| `FINNHUB_API_KEY` | server-side Finnhub key for the worker |
| `GOOGLE_APPLICATION_CREDENTIALS` **or** `FIREBASE_SERVICE_ACCOUNT` | Firebase service account (path vs inline JSON) |
| `POLL_INTERVAL_MS` | worker polling cadence (default 15000) |
| `ALERT_WORKER_ENABLED` | set `false` to run the API without the worker |

The backend **boots without** Finnhub/Firebase configured — those features
degrade gracefully (worker skips, FCM sends become no-ops with a warning) so you
can develop the rest of the API first. `/health` reports what's wired.

### Firebase setup

Use the **same Firebase project** as the app's `google-services.json`. In the
Firebase console → Project settings → Service accounts → *Generate new private
key*. Either save it as `serviceAccount.json` and set
`GOOGLE_APPLICATION_CREDENTIALS` to its path, or paste the JSON (one line) into
`FIREBASE_SERVICE_ACCOUNT`. **Never commit it** (already gitignored).

---

## Connecting the Expo app

Point both base URLs at this backend in the app's `.env`:

```
EXPO_PUBLIC_BACKEND_BASE_URL=http://<your-lan-ip>:3000   # /devices
EXPO_PUBLIC_WEBHOOK_BASE_URL=http://<your-lan-ip>:3000   # /webhooks (alerts)
```

Use your machine's **LAN IP**, not `localhost`, so a physical device can reach
it. FCM only works on an **EAS build** (not Expo Go):
`eas build -p android --profile preview`.

---

## Try the flow with curl

```bash
# 1. register + capture token
curl -s localhost:3000/auth/register -H 'content-type: application/json' \
  -d '{"email":"me@test.com","password":"secret1"}'

# 2. register a device FCM token
curl -s localhost:3000/devices -H 'content-type: application/json' \
  -d '{"token":"<fcm-token>","platform":"android"}'

# 3. create an alert (fires when AAPL goes above $150)
curl -s localhost:3000/webhooks -H 'content-type: application/json' \
  -d '{"event":"stock-price-alert:AAPL:above:150"}'

# 4. force a test push without waiting for the market
curl -s -X POST localhost:3000/webhooks/<id>/test
```
