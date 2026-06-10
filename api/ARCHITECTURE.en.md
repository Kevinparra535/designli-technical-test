# Backend — how it works (technical summary)

> 🌐 Language: **English** · [Español](./ARCHITECTURE.md)

Backend for the **React Native + Node** test. It implements what the device can't
do on its own: authentication, alert persistence, and **an FCM push when a stock's
price goes higher than the alert price** (requirement #5).

**Stack:** Express + TypeScript · PostgreSQL · Passport (JWT + bcrypt) ·
firebase-admin · Finnhub. Deployed on **Heroku** via Docker.

---

## PDF requirements → where they live in the code

| # | Requirement | Implementation |
|---|---|---|
| 1 | Users can log in | `POST /auth/register` · `POST /auth/login` → JWT (`modules/auth`) |
| 2 | Form to create a stock price alert | `POST /webhooks` — the alert is encoded in `event` |
| 3 / 4 | List of stocks / graph | The app consumes Finnhub directly; the backend evaluates alerts |
| 5 | **FCM push when the price goes higher than the alert** | `priceHub` evaluates each tick → `firebase-admin` (`services/fcm`) |
| Extra | Docker for the deployment | Multi-stage `Dockerfile` + Heroku deploy |

> The PDF asks to notify when the price goes **higher** (`above`); the backend also
> supports `below` as a bonus (same flow, symmetric condition).

---

## End-to-end flow (requirement #5)

```
App                         Backend                        Finnhub / Firebase
 │ POST /auth/login         │  → JWT                        │
 │ POST /devices {token}    │  → stores FCM token (per user)│
 │ POST /webhooks {event}   │  → stores alert + watches symbol
 │                          │  ◀═══ ticks (1 upstream WS) ══│
 │                          │  did the price cross it?      │
 │                          │   firebase-admin send ───────▶│ FCM
 │ ◀──────────── push (notification + data) ◀──────────────┤
```

The backend keeps **a single WebSocket to Finnhub**, evaluates alerts **inline on
every tick** (no polling), and on a crossing it pushes to **that user's devices**
and deactivates the alert (fires once).

---

## Boot sequence (`server.ts`)

```
migrate()   → applies schema.sql (idempotent)
seed()      → upserts the QA user (appcheck@test.com)
app.listen  → starts Express
priceHub.start() → connects to Finnhub and loads active alerts
```

## Layers (one responsibility per folder)

```
config/     validated env + Postgres pool
db/         schema.sql, migrate, seed (run on boot)
middleware/ JWT (Passport), Joi validation, Boom error chain
modules/
  auth/     register / login / me  (LocalStrategy + JwtStrategy, bcrypt + JWT)
  devices/  FCM token registration + push test endpoint
  webhooks/ alert CRUD + notification fan-out
  prices/   priceHub (alert evaluation) + WS gateway
services/   alerts (encode/decode), finnhub, fcm
```

Dependency flow: `routes → repository → db`, with `services` for external
integrations. Each request passes through: **helmet/cors/json → JWT → Joi
validation → handler → error handling (Boom)**.

---

## Design decisions

- **Auth required** on `/devices` and `/webhooks` (Passport JWT). Every device and
  alert is tied to a user; `:id` routes are *owner-scoped* (404 if you're not the
  owner). `req.user` is never null.
- **Per-user push**: an alert only notifies its owner's devices.
- **Real-time, not polling**: one Finnhub WS de-duplicated per symbol (ref-count)
  → inline evaluation → FCM. A polling fallback (`worker/alertWorker`) exists when
  `STREAMING_ENABLED=false`.
- **Graceful degradation**: the backend boots even without Finnhub/Firebase; the
  `/health` endpoint reports which integrations are configured.
- **Idempotent seed**: guarantees the QA user on every deploy, no manual steps.

---

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | integration status (`fcm`, `finnhub`, `streaming`) |
| `POST` | `/auth/register` · `/auth/login` | — | `{ token, user }` |
| `GET` | `/auth/me` | Bearer | current user |
| `POST` | `/devices` | Bearer | register (upsert) the user's FCM token |
| `POST` | `/devices/test` | Bearer | send a test push to the user's devices |
| `POST` `GET` `DELETE` | `/webhooks[/:id]` | Bearer | alert CRUD (owner-scoped) |
| `POST` | `/webhooks/:id/test` | Bearer | fire the alert with a synthetic price |

**Alert format** (`event`): `stock-price-alert:<SYMBOL>:<above|below>:<price>`
→ e.g. `stock-price-alert:AAPL:above:150`.

**FCM `data` payload** (all string-valued, per FCM):
`{ symbol, targetPrice, currentPrice, condition, alertId }`.

---

## Notes

- **iOS vs Android**: `getDevicePushTokenAsync()` returns a valid FCM token on
  **Android**; on iOS it returns the APNs token (not directly sendable via
  firebase-admin without the Firebase iOS SDK + an APNs key).
- **FCM needs a real build** (EAS / dev-client), not Expo Go.
- Endpoint details, WS protocol, and configuration: see [`README.md`](./README.md).
