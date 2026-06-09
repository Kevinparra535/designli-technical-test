# Stocks Backend (Node + Express + PostgreSQL)

Node backend for the **React Native + Node Developer** test. It backs the Expo
app's real-time stock features and implements the parts the device can't do on
its own:

| PDF requirement | Where it lives |
| --- | --- |
| 1. Users can log in | `POST /auth/register`, `POST /auth/login` (JWT) |
| 2. Create a stock price alert | `POST /webhooks` (alert encoded in `event`) |
| 3. List of stocks / 4. Graph | Real-time prices via the `/ws` price hub (or Finnhub from the app) |
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
 │ ──────────────────────────▶│  store alert + watch symbol  │
 │  WS  /ws  subscribe[AAPL]  │   1 upstream WS               │
 │ ◀══════════════════════════│◀═════════════════════════════│ trade ticks
 │ ◀═ {type:"prices",data} ═══│  coalesce + fan-out          │
 │                            │  tick crosses alert?          │
 │                            │   firebase-admin send ───────▶│ FCM
 │  ◀───────── push (data payload) ◀────────────────────────-┤
```

**Real-time price hub (default).** A single upstream WebSocket to Finnhub is
de-duplicated across all clients and fanned out to app clients over `/ws`. Alerts
are evaluated **inline on every tick** (no polling); when one crosses, it pushes
to every registered device and **deactivates the alert** so it fires once. See
[Real-time price hub](#real-time-price-hub) below.

**Polling fallback.** With `STREAMING_ENABLED=false`, the alert worker
(`src/worker/alertWorker.ts`) instead polls a quote per symbol every
`POLL_INTERVAL_MS` and fires the same way.

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
    prices/    priceHub (app logic: refs, cache, throttle, alert eval) +
               prices.gateway (WS transport adapter for app clients)
  services/    alerts (event encode/decode), finnhub REST client,
               finnhubSocket (upstream WS infra), fcm sender
  worker/      alertWorker (polling fallback when streaming is off)
  app.ts       Express wiring
  server.ts    bootstrap: migrate → listen → hub + gateway (or worker)
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

## Real-time price hub

A single upstream WebSocket to Finnhub is fanned out to every app client — the
most performant design (one upstream connection regardless of client count, push
instead of poll). Built in three layers, matching the backend's structure:

| Layer | File | Responsibility |
| --- | --- | --- |
| **Infra** | `services/finnhubSocket.ts` | one upstream WS to `wss://ws.finnhub.io`; subscribe/unsubscribe; reconnect with backoff; emits trade ticks |
| **Application** | `modules/prices/priceHub.ts` | symbol ref-counting, last-price cache, tick coalescing, fan-out, **inline alert evaluation** |
| **Transport** | `modules/prices/prices.gateway.ts` | `ws` server on `WS_PATH`; adapts each socket to the hub's transport-agnostic `StreamClient` |

Performance properties:

- **De-duplication**: the hub ref-counts symbols (clients **and** alerts); the
  upstream socket subscribes only on 0→1 and unsubscribes on 1→0.
- **Coalescing (per-client)**: each client drains its own buffer of changed
  symbols on its own cadence. Default is `PRICE_THROTTLE_MS` (400 ms); a client
  can request its own via `throttleMs` (clamped 100–10000 ms) — protects React
  Native from re-render storms while letting each screen pick its refresh rate.
- **Snapshot**: a new subscriber immediately gets the last known price from the
  in-memory cache (no upstream round-trip).
- **Inline alerts**: each tick evaluates alerts on that symbol → instant FCM,
  then the alert is deactivated. The polling worker is **not** started.

### WebSocket protocol (`/ws`)

Client → server (`throttleMs` is optional, per-client, clamped 100–10000 ms):

```json
{ "type": "subscribe",   "symbols": ["AAPL", "MSFT"], "throttleMs": 1000 }
{ "type": "unsubscribe", "symbols": ["AAPL"] }
{ "type": "throttle",    "throttleMs": 1000 }
{ "type": "ping" }
```

Server → client:

```json
{ "type": "welcome",  "path": "/ws" }
{ "type": "snapshot", "data": [{ "symbol": "AAPL", "price": 152.3, "t": 1718000000000 }] }
{ "type": "prices",   "data": [{ "symbol": "AAPL", "price": 152.4, "t": 1718000000400 }] }
{ "type": "throttle", "throttleMs": 1000 }
{ "type": "pong" }
```

> The default cadence (`PRICE_THROTTLE_MS`) is the fallback; each client may set
> its own rate via `throttleMs` on `subscribe`, or change it any time with a
> `throttle` message. The server replies with a `throttle` ack carrying the
> effective (clamped) value.

> Needs a real `FINNHUB_API_KEY` to receive live ticks (the free tier streams US
> stocks during market hours). Without a key the hub still runs; `/ws` accepts
> clients but no ticks flow.

---

## API

All bodies are JSON. Auth endpoints return `{ token, user }`.

| Method | Path | Auth | Body / Notes |
| --- | --- | --- | --- |
| `GET` | `/health` | — | `{ status, fcm, finnhub, streaming }` integration status |
| `WS` | `/ws` | — | real-time prices (subscribe/unsubscribe). See [hub](#real-time-price-hub) |
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
| `FINNHUB_API_KEY` | server-side Finnhub key (REST + real-time WS) |
| `FINNHUB_WS_URL` | upstream stream URL (default `wss://ws.finnhub.io`) |
| `GOOGLE_APPLICATION_CREDENTIALS` **or** `FIREBASE_SERVICE_ACCOUNT` | Firebase service account (path vs inline JSON) |
| `STREAMING_ENABLED` | `true` (default) = real-time hub; `false` = polling worker |
| `WS_PATH` | client WebSocket path (default `/ws`) |
| `PRICE_THROTTLE_MS` | fan-out coalescing window (default 400) |
| `POLL_INTERVAL_MS` | worker polling cadence when streaming is off (default 15000) |
| `ALERT_WORKER_ENABLED` | with streaming off, set `false` to disable the worker too |

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

For live prices, the app opens a WebSocket to `ws://<your-lan-ip>:3000/ws` and
sends `{ "type": "subscribe", "symbols": [...] }` (see
[Real-time price hub](#real-time-price-hub)).

Use your machine's **LAN IP**, not `localhost`, so a physical device can reach
it. FCM only works on an **EAS build** (not Expo Go):
`eas build -p android --profile preview`.

---

## Postman

Importa [`postman/stocks-backend.postman_collection.json`](postman/stocks-backend.postman_collection.json)
(Postman → Import). Trae todos los endpoints con variables de colección
(`baseUrl`, `token`, `webhookId`, …). **Register** / **Login** guardan el JWT en
`{{token}}` automáticamente y **Create alert** guarda el id en `{{webhookId}}`, así
que el orden Register → Login → Create alert → Get/Test/Delete funciona sin copiar
nada a mano. El stream en vivo está en la carpeta _Real-time (WebSocket)_.

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

Subscribe to the real-time stream (needs `FINNHUB_API_KEY`):

```bash
node -e "const W=require('ws');const ws=new W('ws://localhost:3000/ws');\
ws.on('open',()=>ws.send(JSON.stringify({type:'subscribe',symbols:['AAPL','BINANCE:BTCUSDT'],throttleMs:1000})));\
ws.on('message',m=>console.log(m.toString()));"
```

> `BINANCE:BTCUSDT` is handy for testing outside US market hours (crypto streams 24/7).
