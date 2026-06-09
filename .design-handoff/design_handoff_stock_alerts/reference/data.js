/* =========================================================================
   Designli · Stock Alerts — Design tokens + mock data
   Plain classic script. Everything is attached to window so the Babel
   component files (separate scope) can read it.
   ========================================================================= */

/* ---- Design tokens ---------------------------------------------------- */
window.T = {
  // surfaces (dark trading terminal, cool near-black)
  bg:       '#0A0C0F',   // app background
  bg2:      '#101317',   // elevated card
  bg3:      '#171B20',   // higher / pressed
  bg4:      '#1F242A',   // input / chip
  hair:     'rgba(255,255,255,0.07)',
  hair2:    'rgba(255,255,255,0.12)',

  // text
  ink:      '#F2F5F7',   // primary
  ink2:     '#98A2AD',   // secondary / muted
  ink3:     '#5A636D',   // tertiary / faint
  ink4:     '#3A424B',   // disabled

  // semantics
  up:       '#1FE08A',   // positive / brand
  upDim:    'rgba(31,224,138,0.14)',
  upInk:    '#062613',
  down:     '#FF5C6C',   // negative
  downDim:  'rgba(255,92,108,0.14)',
  warn:     '#FFB23E',   // triggered / alert fired
  warnDim:  'rgba(255,178,62,0.15)',
  info:     '#5AA9FF',

  // radii
  rSm: 10, rMd: 14, rLg: 20, rXl: 28, rPill: 999,

  // fonts
  sans: '"Hanken Grotesk", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

/* ---- Sparkline helper ------------------------------------------------- *
   buildSpark(values, w, h) -> { line, area } SVG path strings           */
window.buildSpark = function (vals, w, h, pad = 2) {
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const stepX = (w - pad * 2) / (vals.length - 1);
  const pts = vals.map((v, i) => [
    pad + i * stepX,
    pad + (h - pad * 2) * (1 - (v - min) / span),
  ]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L${(w - pad).toFixed(1)} ${h} L${pad} ${h} Z`;
  return { line, area, pts };
};

/* deterministic pseudo-random walk so sparklines look real & stable */
function walk(seed, n, drift) {
  const out = [];
  let v = 100, s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280 - 0.5;
    v += r * 6 + drift;
    out.push(v);
  }
  return out;
}

/* ---- Mock stocks ------------------------------------------------------ */
window.STOCKS = [
  { sym: 'NVDA',  name: 'NVIDIA Corp',        price: 1142.30, chg:  37.80, pct:  3.42, spark: walk(7,   24,  0.9) },
  { sym: 'AAPL',  name: 'Apple Inc',          price:  228.52, chg:   1.95, pct:  0.86, spark: walk(11,  24,  0.2) },
  { sym: 'TSLA',  name: 'Tesla Inc',          price:  241.05, chg:  -5.24, pct: -2.13, spark: walk(23,  24, -0.7) },
  { sym: 'MSFT',  name: 'Microsoft Corp',     price:  467.81, chg:   5.55, pct:  1.20, spark: walk(31,  24,  0.4) },
  { sym: 'COIN',  name: 'Coinbase Global',    price:  245.60, chg:  11.92, pct:  5.10, spark: walk(3,   24,  1.3) },
  { sym: 'AMZN',  name: 'Amazon.com Inc',     price:  201.44, chg:   1.08, pct:  0.54, spark: walk(41,  24,  0.15) },
  { sym: 'META',  name: 'Meta Platforms',     price:  512.20, chg:  -3.97, pct: -0.77, spark: walk(17,  24, -0.3) },
  { sym: 'GOOGL', name: 'Alphabet Inc',       price:  178.90, chg:   3.42, pct:  1.95, spark: walk(53,  24,  0.5) },
  { sym: 'AMD',   name: 'Adv. Micro Devices', price:  162.33, chg:  -2.33, pct: -1.42, spark: walk(29,  24, -0.5) },
  { sym: 'SPY',   name: 'S&P 500 ETF',        price:  548.10, chg:   2.24, pct:  0.41, spark: walk(13,  24,  0.2) },
];

window.byId = {};
window.STOCKS.forEach(s => { window.byId[s.sym] = s; });

/* big detail-chart series for the hero stock (NVDA) */
window.DETAIL_SERIES = walk(7, 60, 0.8);

/* ---- Mock alerts ------------------------------------------------------ */
window.ALERTS = [
  { id: 'a1', sym: 'NVDA', cond: 'above', target: 1100, status: 'triggered', when: 'Hoy · 10:24',  firedAt: 1142.30 },
  { id: 'a2', sym: 'AAPL', cond: 'above', target: 230,  status: 'active',    when: 'Hace 2 días' },
  { id: 'a3', sym: 'TSLA', cond: 'below', target: 235,  status: 'active',    when: 'Hace 3 días' },
  { id: 'a4', sym: 'COIN', cond: 'above', target: 240,  status: 'triggered', when: 'Hoy · 09:58',  firedAt: 245.60 },
  { id: 'a5', sym: 'MSFT', cond: 'below', target: 450,  status: 'paused',    when: 'Hace 1 semana' },
];

/* ---- Formatting helpers ---------------------------------------------- */
window.fmt = {
  usd: (n, d = 2) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }),
  pct: (n) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(2) + '%',
  sgn: (n) => (n >= 0 ? '+' : '−') + '$' + Math.abs(n).toFixed(2),
};
