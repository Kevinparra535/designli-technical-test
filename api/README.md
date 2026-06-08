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
| Extra: Docker | `docker-compose.yml` (Postgres para desarrollo, estilo guía) |

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
  lib/         HttpError (boomified)
  middleware/  asyncHandler, JWT auth (require/optional), validatorHandler (Joi),
               error chain (logErrors → boomErrorHandler → errorHandler)
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

## Middlewares (siguiendo la guía de Notion)

The middleware layer follows the guide's *Middlewares* section exactly:

- **Populares**: `helmet`, `cors`, `express.json()`.
- **Validación con Joi**: `validatorHandler(schema, property)` factory — validates
  `body`/`params` and forwards a `Boom.badRequest` on failure.
- **Manejo de errores con Boom** (`@hapi/boom`): `HttpError` is boomified, so all
  errors share one payload shape.
- **Cadena de error middlewares** (en este orden):
  `logErrors` → `boomErrorHandler` → `errorHandler`.

Error responses use Boom's payload shape:

```json
{ "statusCode": 400, "error": "Bad Request",
  "message": "\"email\" must be a valid email", "details": [ ... ] }
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

## Run it (desarrollo)

Postgres corre en Docker (estilo guía de Notion); el backend Node corre en el
host con hot-reload.

```bash
cp .env.example .env        # luego pon FINNHUB_API_KEY (+ FIREBASE_SERVICE_ACCOUNT para push real)
docker compose up -d        # 1) levanta solo PostgreSQL (puerto 5432)
npm install
npm run dev                 # 2) API local con tsx watch; migraciones al arrancar
```

Las credenciales por defecto del compose coinciden con `env.ts`
(`stocks` / `postgres` / `postgres`), así que `npm run dev` conecta sin tocar nada.

Comandos útiles de la DB:

```bash
docker compose ps           # contenedores activos
docker compose down         # detener (los datos persisten en el volumen pgdata)
docker compose down -v      # detener y BORRAR los datos
```

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
