# Backend — cómo funciona (resumen técnico)

Backend del test **React Native + Node**. Implementa lo que el dispositivo no
puede hacer solo: autenticación, persistencia de alertas y **push FCM cuando el
precio de una acción sube por encima del precio de la alerta** (requisito #5).

**Stack:** Express + TypeScript · PostgreSQL · Passport (JWT + bcrypt) ·
firebase-admin · Finnhub. Desplegado en **Heroku** vía Docker.

---

## Requisitos del PDF → dónde viven en el código

| # | Requisito | Implementación |
|---|---|---|
| 1 | Login de usuarios | `POST /auth/register` · `POST /auth/login` → JWT (`modules/auth`) |
| 2 | Crear alerta de precio | `POST /webhooks` — la alerta va codificada en `event` |
| 3 / 4 | Lista de acciones / gráfico | La app consume Finnhub directo; el backend evalúa alertas |
| 5 | **Push FCM cuando el precio supera la alerta** | `priceHub` evalúa cada tick → `firebase-admin` (`services/fcm`) |
| Extra | Docker para el deployment | `Dockerfile` multi-stage + deploy en Heroku |

> El PDF pide notificar cuando el precio **sube por encima** (`above`); el backend
> también soporta `below` como extra (mismo flujo, condición simétrica).

---

## Flujo end-to-end (requisito #5)

```
App                         Backend                        Finnhub / Firebase
 │ POST /auth/login         │  → JWT                        │
 │ POST /devices {token}    │  → guarda FCM token (por user)│
 │ POST /webhooks {event}   │  → guarda alerta + vigila símbolo
 │                          │  ◀═══ ticks (1 WS upstream) ══│
 │                          │  ¿precio cruzó la alerta?     │
 │                          │   firebase-admin send ───────▶│ FCM
 │ ◀──────────── push (notification + data) ◀──────────────┤
```

El backend mantiene **una sola conexión WebSocket a Finnhub**, evalúa las alertas
**inline en cada tick** (sin polling) y, al cruzar, envía el push a **los devices
de ese usuario** y desactiva la alerta (dispara una vez).

---

## Arranque (`server.ts`)

```
migrate()   → aplica schema.sql (idempotente)
seed()      → upsert del usuario de QA (appcheck@test.com)
app.listen  → levanta Express
priceHub.start() → conecta a Finnhub y carga las alertas activas
```

## Capas (una responsabilidad por carpeta)

```
config/     env validado + pool de Postgres
db/         schema.sql, migrate, seed (corren al boot)
middleware/ JWT (Passport), validación Joi, cadena de errores Boom
modules/
  auth/     register / login / me  (LocalStrategy + JwtStrategy, bcrypt + JWT)
  devices/  registro de tokens FCM + endpoint de prueba de push
  webhooks/ CRUD de alertas + fan-out de notificaciones
  prices/   priceHub (evaluación de alertas) + gateway WS
services/   alerts (encode/decode), finnhub, fcm
```

Flujo de dependencias: `routes → repository → db`, y `services` para integraciones
externas. Cada request pasa por: **helmet/cors/json → JWT → validación Joi →
handler → manejo de errores (Boom)**.

---

## Decisiones de diseño

- **Auth obligatorio** en `/devices` y `/webhooks` (Passport JWT). Cada device y
  alerta queda atada al usuario; las rutas con `:id` son *owner-scoped* (404 si no
  sos el dueño). El `req.user` nunca es null.
- **Push por usuario**: una alerta solo notifica a los devices de su dueño.
- **Tiempo real, no polling**: 1 WS a Finnhub de-duplicado por símbolo (ref-count)
  → evaluación inline → FCM. Hay un fallback por polling (`worker/alertWorker`) si
  `STREAMING_ENABLED=false`.
- **Degradación elegante**: el backend bootea aunque falten Finnhub/Firebase; el
  endpoint `/health` reporta qué integraciones están configuradas.
- **Seed idempotente**: garantiza el usuario de QA en cada deploy sin pasos manuales.

---

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/health` | — | estado de integraciones (`fcm`, `finnhub`, `streaming`) |
| `POST` | `/auth/register` · `/auth/login` | — | `{ token, user }` |
| `GET` | `/auth/me` | Bearer | usuario actual |
| `POST` | `/devices` | Bearer | registra (upsert) el FCM token del usuario |
| `POST` | `/devices/test` | Bearer | envía un push de prueba a los devices del usuario |
| `POST` `GET` `DELETE` | `/webhooks[/:id]` | Bearer | CRUD de alertas (owner-scoped) |
| `POST` | `/webhooks/:id/test` | Bearer | dispara la alerta con un precio sintético |

**Formato de alerta** (`event`): `stock-price-alert:<SYMBOL>:<above|below>:<price>`
→ p. ej. `stock-price-alert:AAPL:above:150`.

**Payload FCM `data`** (todo string, por requisito de FCM):
`{ symbol, targetPrice, currentPrice, condition, alertId }`.

---

## Notas

- **iOS vs Android**: `getDevicePushTokenAsync()` devuelve un FCM token válido en
  **Android**; en iOS devuelve el token APNs (no enviable directo por firebase-admin
  sin Firebase iOS SDK + APNs key).
- **FCM requiere build real** (EAS / dev-client), no Expo Go.
- Detalle de endpoints, protocolo WS y configuración: ver [`README.md`](./README.md).
```
