# Deploy a Heroku (Docker / container stack)

Heroku construye la imagen desde el `Dockerfile` **en su nube** (no necesitás
Docker local). Cubre el extra-credit de Docker del PDF y te da una **URL pública
HTTPS**, así el push FCM/alertas funciona desde cualquier red.

> El backend vive en el subdirectorio `api/`. Por eso se deploya con
> `git subtree push --prefix api …` (el `heroku.yml` y el `Dockerfile` quedan en
> la raíz de lo que Heroku recibe).

## 0. Prerequisitos (una vez)

- Instalá la Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
- `heroku login`

## 1. Crear la app en el stack "container"

```powershell
# Desde la RAÍZ del repo (no desde api/)
heroku create TU-APP --stack container
heroku git:remote -a TU-APP
```

## 2. Base de datos (Heroku Postgres)

```powershell
heroku addons:create heroku-postgresql:essential-0 -a TU-APP
```

Esto setea `DATABASE_URL` automáticamente. El backend corre las migraciones al
boot (`server.ts → migrate()`), así que no hace falta paso aparte.

## 3. Config vars (secretos)

```powershell
heroku config:set -a TU-APP `
  NODE_ENV=production `
  STREAMING_ENABLED=true `
  JWT_SECRET=PONE-UN-SECRET-FUERTE `
  FINNHUB_API_KEY=TU_FINNHUB_KEY

# Firebase service account como JSON en UNA línea (desde api/):
cd api
$sa = node -e "process.stdout.write(JSON.stringify(require('./serviceAccount.json')))"
heroku config:set -a TU-APP FIREBASE_SERVICE_ACCOUNT="$sa"
cd ..
```

> No seteés `GOOGLE_APPLICATION_CREDENTIALS` en Heroku: el `serviceAccount.json`
> NO se sube a la imagen (está en `.dockerignore`). FCM usa `FIREBASE_SERVICE_ACCOUNT`.
>
> Si el quoting del JSON te da problemas en PowerShell, pegalo a mano en
> Dashboard → Settings → **Config Vars** (`node -e "..." | Set-Clipboard` para copiarlo).

## 4. Deploy (Heroku buildea el Dockerfile)

```powershell
git add .
git commit -m "backend: deploy a heroku"
git subtree push --prefix api heroku main
```

Heroku detecta `heroku.yml`, construye la imagen y arranca el proceso `web`.
Mirá el build/boot:

```powershell
heroku logs --tail -a TU-APP
```

## 5. Verificar

```powershell
curl https://TU-APP.herokuapp.com/health
# Esperado: {"status":"ok","fcm":true,"finnhub":true,"streaming":true}
```

## 6. Apuntar la app Expo al backend público

En el `.env` del proyecto Expo (raíz):

```
EXPO_PUBLIC_BACKEND_BASE_URL=https://TU-APP.herokuapp.com
EXPO_PUBLIC_WEBHOOK_BASE_URL=https://TU-APP.herokuapp.com
```

(El stream en vivo, si lo usás, es `wss://TU-APP.herokuapp.com/ws`.)

Ventaja: con la URL pública ya **no** dependés de la misma WiFi ni del firewall —
el push FCM funciona aunque el teléfono esté en datos móviles.

## Redeploy (cada cambio)

```powershell
git add . && git commit -m "..."
git subtree push --prefix api heroku main
```

## Notas

- **WebSockets**: el router de Heroku los soporta; el gateway hace heartbeat cada
  30s para no caerse por el timeout de ~55s de Heroku.
- **Dyno**: usá un dyno que **no duerma** (Basic o superior) para que el hub
  mantenga la conexión a Finnhub. Los Eco duermen tras 30 min de inactividad.
- **Postgres SSL**: `db.ts` activa SSL automáticamente cuando `DATABASE_URL` no es
  localhost (requisito de Heroku Postgres).
```
