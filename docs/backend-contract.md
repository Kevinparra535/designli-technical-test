# Backend contract — FCM price-alert notifications

This documents the integration points the **Node backend (you build)** must
expose for feature #5 (FCM push when a stock price crosses an alert). The Expo
app side is already implemented; this is the contract it expects.

## Flow

```
App                          Backend (Node)                 Firebase / Finnhub
 │  POST /devices {token}      │                              │
 │ ───────────────────────────▶  store FCM token             │
 │                             │  poll Finnhub quotes  ───────▶ (price)
 │                             │  price crosses alert?        │
 │                             │  firebase-admin send  ───────▶ FCM
 │  ◀───────────────  push notification (data payload)  ◀─────┤
```

The app obtains the **native FCM registration token** via
`expo-notifications` `getDevicePushTokenAsync()` (Android) and registers it. The
backend stores it and, using `firebase-admin`, sends a message to that token when
a price crosses the alert created in feature #2.

## App → Backend

Base URL comes from the app's `EXPO_PUBLIC_BACKEND_BASE_URL` env var (see `.env`
/ EAS). The app calls one endpoint:

### `POST /devices`

Register (or upsert) a device's FCM token.

Request body:

```json
{
  "token": "<fcm-registration-token>",
  "platform": "android"
}
```

| Field      | Type                 | Notes                                   |
| ---------- | -------------------- | --------------------------------------- |
| `token`    | string               | Native FCM token. Upsert by this value. |
| `platform` | `"android" \| "ios"` | Device platform.                        |

Success response (`200`/`201`) — shape consumed by `DeviceRegistrationModel`:

```json
{
  "id": "dev_123",
  "token": "<fcm-registration-token>",
  "platform": "android",
  "active": true,
  "createdAt": "2026-06-08T12:00:00.000Z"
}
```

> Tie the token to the user once feature #1 (login) exists — send the auth token
> / `userId` so the backend knows whose alerts map to this device.

## Backend responsibilities (not in the app)

1. **Persist** device tokens (`/devices`) and the price alerts from feature #2.
2. **Evaluate** prices: poll Finnhub `/quote?symbol=...` on an interval (or use
   websockets) and compare against each active alert. For `condition: "above"`,
   fire when `currentPrice > targetPrice` (and `below` symmetrically).
3. **Send FCM** with `firebase-admin` (using the service account) to the stored
   token:

```ts
await admin.messaging().send({
  token,
  notification: {
    title: `${symbol} hit your alert`,
    body: `Now $${currentPrice} (target $${targetPrice})`,
  },
  data: {
    symbol,
    targetPrice: String(targetPrice),
    currentPrice: String(currentPrice),
    condition, // "above" | "below"
    alertId,
  },
  android: { priority: 'high' },
});
```

## Notification `data` payload (Backend → App)

The app's foreground listener (`pushNotificationManager.configure()`) logs
`notification.request.content.data`. Keep `data` string-valued (FCM requirement):

| Key            | Example      |
| -------------- | ------------ |
| `symbol`       | `"AAPL"`     |
| `targetPrice`  | `"150"`      |
| `currentPrice` | `"152.34"`   |
| `condition`    | `"above"`    |
| `alertId`      | `"alert_42"` |

## Prerequisites / notes

- **Firebase project**: the same project as `google-services.json` (Android app).
  The backend authenticates with that project's **service account** JSON.
- **EAS build required**: FCM does not work in Expo Go — test with an EAS Android
  build (`eas build -p android --profile preview`).
- **Local dev**: set `EXPO_PUBLIC_BACKEND_BASE_URL` to your machine's LAN IP
  (e.g. `http://192.168.1.x:3000`), not `localhost`, so the device can reach it.
- **Extra credit (PDF)**: containerize this backend with Docker for deployment.
