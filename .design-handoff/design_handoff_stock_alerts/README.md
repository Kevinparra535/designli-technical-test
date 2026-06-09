# Handoff: Designli · Stock Alerts (MVP)

App móvil de **alertas de precio de acciones en tiempo real** (Finnhub + FCM). Tema dark estilo *trading terminal*, lenguaje fintech minimalista (Cash App / Robinhood). Este paquete documenta todo el diseño para reimplementarlo en la app real.

---

## Cómo usar este paquete con Claude Code

1. Copia esta carpeta `design_handoff_stock_alerts/` dentro de tu repo (`Kevinparra535/designli-technical-test`).
2. Abre Claude Code en el repo y dile:
   > "Lee `design_handoff_stock_alerts/README.md` e implementa estas pantallas en la app React Native existente, respetando la arquitectura del repo (MVVM + Inversify + MobX). Empieza por los design tokens y los componentes base, luego las pantallas."
3. Los archivos `.jsx` de la carpeta `reference/` son el **diseño de referencia en React DOM (web)** — NO son código de producción para copiar tal cual. La tarea es **recrear estas pantallas en el entorno React Native del repo**, usando sus patrones (`StyleSheet`, `View`, `Text`, `Pressable`, navegación existente, ViewModels MobX).

### Mapeo web → React Native
| Referencia (web)        | React Native            |
|-------------------------|-------------------------|
| `<div>`                 | `<View>`                |
| `<span>` / texto        | `<Text>`                |
| `<button>` + `usePress` | `<Pressable>`           |
| `<input>`               | `<TextInput>`           |
| `style={{...}}` inline  | `StyleSheet.create`     |
| SVG inline              | `react-native-svg`      |
| `<svg>` sparkline path  | `react-native-svg` `<Path>` |
| `backdrop-filter` blur  | `expo-blur` / `BlurView`|
| `position:absolute` sheet | Modal / bottom-sheet lib |

---

## Fidelidad

**Alta fidelidad (hi-fi).** Colores, tipografía, espaciado e interacciones son finales. Recrear pixel-perfect con las librerías del repo. Donde el repo ya tenga un componente equivalente, úsalo; si no, créalo siguiendo estos tokens.

---

## Design Tokens

> Define esto como un único módulo de tema (`src/ui/theme/tokens.ts`) y consúmelo en todas las pantallas. NO hardcodear hex en componentes.

### Color
```
// Superficies (near-black frío)
bg      #0A0C0F   // fondo de la app
bg2     #101317   // card elevada
bg3     #171B20   // nivel superior / pressed
bg4     #1F242A   // input / chip
hair    rgba(255,255,255,0.07)   // divisores / bordes sutiles
hair2   rgba(255,255,255,0.12)   // borde más visible

// Texto
ink     #F2F5F7   // primario
ink2    #98A2AD   // secundario
ink3    #5A636D   // terciario / faint
ink4    #3A424B   // disabled

// Semánticos
up      #1FE08A   // positivo / MARCA (verde)
upDim   rgba(31,224,138,0.14)   // fondo tenue verde
upInk   #062613   // texto sobre fondo verde sólido (botón primario)
down    #FF5C6C   // negativo (rojo)
downDim rgba(255,92,108,0.14)
warn    #FFB23E   // alerta disparada (ámbar)
warnDim rgba(255,178,62,0.15)
info    #5AA9FF   // azul informativo
```
**Regla semántica:** verde = sube + acción primaria de marca; rojo = baja; ámbar = alerta disparada. Nunca usar verde/rojo decorativamente.

### Tipografía
- **UI:** Hanken Grotesk (400/500/600/700/800). Fallback: system-ui.
- **Números/cifras:** JetBrains Mono (400/500/600/700), SIEMPRE con `font-variant-numeric: tabular-nums` (en RN: usar la fuente mono + `fontVariant: ['tabular-nums']`).

| Rol            | Familia | Tamaño | Peso | Notas |
|----------------|---------|--------|------|-------|
| Display (precio grande) | mono/sans | 34–40 | 800 | tabular, letter-spacing −1px |
| Title          | sans    | 22–28  | 800  | letter-spacing −0.7px |
| Headline       | sans    | 16.5   | 700  | |
| Body           | sans    | 14–15  | 500  | |
| Mono · precio  | mono    | 14–15  | 600  | tabular-nums |
| Label          | sans    | 12     | 700  | UPPERCASE, letter-spacing 1px |
| Caption        | sans    | 11.5–12.5 | 600 | color ink3 |

### Radios
```
rSm 10   rMd 14   rLg 20   rXl 28   rPill 999
```
Inputs y botones: `rMd` (14). Cards: `rLg` (20). Sheets: `rXl` (28, solo esquinas superiores). Chips/badges/avatares circulares: `rPill`.

### Espaciado
Escala base 4px. Padding horizontal de pantalla: **20px** (24px en login/onboarding). Gap entre cards de lista: **10px**. Padding interno de cards: **14–18px**.

### Sombras / efectos
- Botón primario: `0 6px 22px -8px #1FE08A` (glow verde).
- Sheet / toast / push banner: `0 16–20px 40–50px rgba(0,0,0,0.5)`.
- Push banner y diálogo iOS usan **blur de fondo** (`BlurView` intensidad ~24, saturación alta).

### Animaciones
```
spin    0.7s linear infinite           // spinner de loading
sheet   0.32s cubic-bezier(.2,.9,.25,1) // bottom sheet sube (translateY 100%→0)
drop    0.35s cubic-bezier(.2,1.1,.3,1) // toast / push banner baja (-16px→0)
pop     0.30–0.35s cubic-bezier(.2,1.2,.4,1) // check de éxito / diálogo
press   transform scale(0.975) + brightness(0.94), 0.12s // todos los botones al presionar
```

---

## Pantallas / Vistas

### 1. Login  (`reference/onboarding.jsx` → `LoginScreen`)
- **Propósito:** autenticar al usuario.
- **Layout:** columna centrada verticalmente, padding horizontal 26px. Glow verde radial arriba; cinta de tickers (símbolo + %) tenue bajo el status bar.
- **Componentes:**
  - Isotipo: cuadrado 56px, radio 16px, gradiente `#1FE08A→#12B873`, glecha (↗) en `upInk`, glow verde.
  - Titular: "Tus alertas,\nen tiempo real." — 30px/800, ink, −0.9px.
  - Subcopy: 15px/500, ink3.
  - Campo **Correo** (default lleno con ejemplo), campo **Contraseña** (suffix "Olvidé").
  - Botón primario **"Iniciar sesión"** (full width, verde) con estado loading "Entrando…".
  - Divisor "o continúa con".
  - 2 botones secundarios en grid: **Apple** (logo blanco) y **Google** (logo a color).
  - Footer: "¿No tienes cuenta? **Crear cuenta**".
- **Validación:** email regex `^[^@\s]+@[^@\s]+\.[^@\s]+$`; password ≥ 6 chars. Errores se muestran al enviar (`touched`). Mensajes: "Correo no válido." / "Mínimo 6 caracteres."
- **Comportamiento:** submit válido → loading 1.1s → navega a Permisos.

### 2. Permisos de notificaciones  (`PermissionsScreen`)
- **Propósito:** pedir permiso de push (valor antes del prompt del sistema).
- **Layout:** columna centrada, padding 26px. Glow ámbar arriba.
- **Componentes:**
  - Campana hero: círculo 96px, anillo `warnDim`, núcleo `bg2`, ícono campana ámbar 40px, badge rojo "1".
  - Título "No te pierdas ningún movimiento" 25px/800.
  - 3 tarjetas de beneficio (ícono en cuadro de color + título + desc): Alertas al instante (verde), Movimientos del mercado (azul), Solo lo que importa (ámbar).
  - Botón primario **"Activar notificaciones"** (texto en una línea).
  - Botón texto "Ahora no" (ink3).
  - Nota privacidad con candado: "Gestionado por iOS · cámbialo cuando quieras".
- **Comportamiento:** "Activar" → muestra **diálogo nativo del sistema** → "Permitir" → estado de éxito (check verde + "¡Listo!") 0.7s → entra a la app. En RN: usar el permiso real (`expo-notifications` / FCM), no recrear el diálogo manualmente.

### 3. Home / Mercado  (`reference/screens.jsx` → `HomeScreen`)
- **Propósito:** ver lista de acciones seguidas y sus variaciones.
- **Layout:** header (saludo + "Mercado" 28/800 + campana con dot verde), card de resumen de portafolio (valor 34/800 + delta + sparkline), tabs "Seguimiento / Más activos", lista de filas.
- **StockRow:** avatar monograma (40px, color por símbolo) · símbolo (15.5/700) + nombre (12.5, ink3) · sparkline 64×28 (verde si sube, rojo si baja) · precio mono + badge delta. Toda la fila es tap target → abre Detalle. Pressed → fondo `bg3`.

### 4. Detalle + gráfica  (`DetailScreen`)
- **Propósito:** ver una acción y crear/editar su alerta.
- **Layout:** nav (back circular, símbolo+monograma, search), precio grande (40/800), delta + cambio del día, **gráfica grande** (área con gradiente, punto final con halo, y si hay alerta una línea punteada ámbar con etiqueta del precio objetivo), selector de rango (1H/1D/1S/1M/1A/Máx), grid de stats 2×2 (Apertura/Máx/Mín/Vol), y CTA.
- **CTA condicional:** sin alerta → botón verde "Crear alerta de precio". Con alerta → card ámbar "Alerta activa · Te avisamos al subir de $X" + "Editar".

### 5. Crear alerta (bottom sheet)  (`SetAlertSheet`)
- **Propósito:** definir condición + precio objetivo.
- **Layout:** sheet que sube desde abajo, handle, título "Nueva alerta", chip del símbolo (avatar + precio actual), **Segmented control** "Por encima (verde ↑) / Por debajo (rojo ↓)", campo **Precio objetivo** (prefix $, teclado decimal), chips rápidos −5% −2% +2% +5%, botón "Crear alerta".
- **Estados:** idle → saving (loading 1.1s) → success (check verde + "Alerta creada" + resumen) 0.9s → cierra y muestra toast.
- **Validación:** precio > 0 y numérico; error "Ingresa un precio válido mayor a 0."

### 6. Alertas (`AlertsScreen`)
- **Propósito:** gestionar reglas de alerta.
- **Layout:** header "Alertas" + subtítulo con conteos. Secciones "Disparadas" y "Activas". 
- **AlertRow:** avatar · símbolo + **badge de estado** (Disparada=ámbar / Activa=verde / Pausada=gris) · condición (↑ Sube de / ↓ Baja de + precio) + timestamp · botón circular pausar/reactivar. Pausada → opacity 0.62. Disparada → borde ámbar.
- **Empty state:** campana en círculo, "Sin alertas todavía", copy, botón "Explorar mercado".

### 7. Notificación push (lock screen)  (`reference/app.jsx` → `PushLockScreen`)
- **Propósito:** mockup de la notificación FCM.
- **Layout:** fondo radial verde-oscuro, reloj 9:41, banner de notificación con blur (ícono verde, "Designli", "NVDA cruzó tu alerta 🚀", detalle con precio), caption "Firebase Cloud Messaging".
- En producción: este es el payload de FCM; el contenido (título/cuerpo) lo arma el backend Node al dispararse la alerta.

### 8. Perfil  (`reference/app.jsx` → `ProfileScreen`)
- Avatar + nombre + email + badge PRO. Lista de toggles (Notificaciones push, Resumen diario, Face ID).

### Variaciones del Home (opcionales — `reference/variations.jsx`)
- **A · Lista limpia** (la principal, recomendada).
- **B · Mapa de calor** — tiles 2 columnas tintadas por magnitud de variación.
- **C · Editorial** — hero del mayor movimiento + lista compacta numerada.
> Para el MVP, implementar la variación A. Las otras son exploraciones.

---

## Componentes base reutilizables (`reference/ui.jsx`)
Implementar primero como librería de UI del repo:
- **Button** — variantes: primary / secondary / ghost / danger; tamaños lg(54)/md(44)/sm(36); estados default/pressed/loading/disabled.
- **Field (TextInput)** — estados default/focus(borde verde + ring)/filled/error(borde rojo)/disabled; soporta prefix ($), suffix, hint, error.
- **Segmented** — control de 2–3 opciones con tono (up/down/neutral).
- **Delta** — badge de % con flecha y color semántico; tamaños sm/md, variante solid.
- **Sparkline** — mini gráfica de área (usar `react-native-svg`).
- **Mono (avatar)** — monograma de 2 letras, color por símbolo.
- **StockRow**, **AlertRow**, **TabBar** (Mercado/Alertas/Perfil), **Spinner**, **Toast**.

---

## Navegación / Flujo
```
Login ──(auth ok)──▶ Permisos ──(allow / ahora no)──▶ App (tabs)
                                                         │
App tabs: Mercado ⇄ Alertas ⇄ Perfil                     │
Mercado ──tap fila──▶ Detalle ──"Crear alerta"──▶ Sheet ──success──▶ toast + alerta en tab Alertas
```

## Estado (alinear con ViewModels MobX existentes)
- `authVM`: email, password, loading, errors, `submit()`.
- `homeVM`: lista de stocks (Finnhub websocket/poll), tab activo.
- `detailVM`: símbolo seleccionado, serie de precios, rango, alerta asociada.
- `alertVM`: condición (above/below), target, validación, `create()` (idle/saving/success), lista de alertas, `toggle(id)`.
- Permisos: estado del permiso real del sistema (granted/denied/undetermined).

## Datos (del repo / Finnhub)
- `Stock`: symbol, name, price, change, percentChange, sparkline.
- `StockAlert`: id, symbol, condition('above'|'below'), targetPrice, status('active'|'triggered'|'paused'), createdAt.
- Push: payload FCM armado por el backend Node cuando el precio cruza el target.

## Assets
- **Fuentes:** Hanken Grotesk + JetBrains Mono (Google Fonts) — instalar como fuentes de la app (`expo-font` o `react-native.config.js`).
- **Íconos:** todos son SVG stroke definidos en `reference/ui.jsx` y `reference/onboarding.jsx`. Portar a `react-native-svg` o sustituir por un set equivalente (lucide-react-native combina bien con este trazo).
- **Logos Apple/Google:** SVG en `onboarding.jsx`.
- Sin imágenes raster; nada que descargar.

## Archivos de referencia (en `reference/`)
| Archivo | Contiene |
|---------|----------|
| `data.js` | **Design tokens** (objeto `T`), helper de sparkline, mock data |
| `ui.jsx` | Componentes base + íconos |
| `screens.jsx` | Home, Detalle, Sheet de alerta, Alertas, Toast |
| `app.jsx` | Shell con tabs, Perfil, Push lock screen |
| `onboarding.jsx` | Login, Permisos, diálogo iOS |
| `variations.jsx` | Variaciones B y C del Home |
| `designsystem.jsx` | Showcase del design system (todos los estados) |
| `index.html` | Canvas que ensambla todo (abrir en navegador para ver el diseño vivo) |

> El `index.html` requiere los `.jsx` hermanos + React/Babel por CDN. Para verlo localmente: servir la carpeta con cualquier servidor estático y abrir `index.html`.
