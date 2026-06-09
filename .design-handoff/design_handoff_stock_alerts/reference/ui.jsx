/* =========================================================================
   Designli · UI primitives + icons (shared by screens + design system)
   ========================================================================= */
const T = window.T;
const { buildSpark, fmt } = window;

/* ---- Icons (simple stroke glyphs) ------------------------------------ */
const Icon = {
  bell: (p = {}) => (
    <svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" fill="none">
      <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.3 19a2 2 0 0 0 3.4 0" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  bellPlus: (p = {}) => (
    <svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" fill="none">
      <path d="M18 9.5a6 6 0 0 0-9.9-4.6M5.8 8.2A6 6 0 0 0 6 9c0 5-2 6.5-2 6.5h13" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.3 19a2 2 0 0 0 3.4 0" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M19 3.5v5M16.5 6h5" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  chevR: (p = {}) => (
    <svg width={p.s || 18} height={p.s || 18} viewBox="0 0 24 24" fill="none">
      <path d="M9 5l7 7-7 7" stroke={p.c || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevL: (p = {}) => (
    <svg width={p.s || 18} height={p.s || 18} viewBox="0 0 24 24" fill="none">
      <path d="M15 5l-7 7 7 7" stroke={p.c || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  search: (p = {}) => (
    <svg width={p.s || 20} height={p.s || 20} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={p.c || 'currentColor'} strokeWidth="1.8"/>
      <path d="M20 20l-3.5-3.5" stroke={p.c || 'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  arrowUp: (p = {}) => (
    <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 24 24" fill="none">
      <path d="M7 17L17 7M9 7h8v8" stroke={p.c || 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrowDown: (p = {}) => (
    <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 24 24" fill="none">
      <path d="M7 7l10 10M17 9v8H9" stroke={p.c || 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: (p = {}) => (
    <svg width={p.s || 20} height={p.s || 20} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={p.c || 'currentColor'} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  check: (p = {}) => (
    <svg width={p.s || 20} height={p.s || 20} viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5l4.5 4.5L19 6.5" stroke={p.c || 'currentColor'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  x: (p = {}) => (
    <svg width={p.s || 20} height={p.s || 20} viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke={p.c || 'currentColor'} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  home: (p = {}) => (
    <svg width={p.s || 24} height={p.s || 24} viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" stroke={p.c || 'currentColor'} strokeWidth={p.w || 1.8} fill={p.f || 'none'} strokeLinejoin="round"/>
    </svg>
  ),
  pulse: (p = {}) => (
    <svg width={p.s || 24} height={p.s || 24} viewBox="0 0 24 24" fill="none">
      <path d="M3 12h3l2.5-6 4 13 3-8 1.8 3H21" stroke={p.c || 'currentColor'} strokeWidth={p.w || 1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  bellTab: (p = {}) => (
    <svg width={p.s || 24} height={p.s || 24} viewBox="0 0 24 24" fill="none">
      <path d="M18 9.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" stroke={p.c || 'currentColor'} strokeWidth={p.w || 1.8} fill={p.f || 'none'} strokeLinejoin="round"/>
      <path d="M10.3 19.5a2 2 0 0 0 3.4 0" stroke={p.c || 'currentColor'} strokeWidth={p.w || 1.8} strokeLinecap="round"/>
    </svg>
  ),
  user: (p = {}) => (
    <svg width={p.s || 24} height={p.s || 24} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.5" r="3.5" stroke={p.c || 'currentColor'} strokeWidth={p.w || 1.8} fill={p.f || 'none'}/>
      <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke={p.c || 'currentColor'} strokeWidth={p.w || 1.8} strokeLinecap="round" fill={p.f || 'none'}/>
    </svg>
  ),
  pause: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none">
      <path d="M9 5v14M15 5v14" stroke={p.c || 'currentColor'} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  bolt: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" fill={p.c || 'currentColor'} stroke={p.c || 'currentColor'} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  ),
  trash: (p = {}) => (
    <svg width={p.s || 18} height={p.s || 18} viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

/* ---- Press hook (touch + mouse) -------------------------------------- */
function usePress() {
  const [down, setDown] = React.useState(false);
  return {
    pressed: down,
    bind: {
      onMouseDown: () => setDown(true),
      onMouseUp: () => setDown(false),
      onMouseLeave: () => setDown(false),
      onTouchStart: () => setDown(true),
      onTouchEnd: () => setDown(false),
    },
  };
}

/* ---- Sparkline ------------------------------------------------------- */
function Sparkline({ data, w = 72, h = 30, up, stroke, fill = true, sw = 2 }) {
  const isUp = up === undefined ? data[data.length - 1] >= data[0] : up;
  const col = stroke || (isUp ? T.up : T.down);
  const { line, area } = buildSpark(data, w, h, 2);
  const gid = React.useMemo(() => 'sg' + Math.random().toString(36).slice(2, 8), []);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={col} stopOpacity="0.22"/>
              <stop offset="1" stopColor={col} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`}/>
        </>
      )}
      <path d={line} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ---- Delta badge ----------------------------------------------------- */
function Delta({ pct, size = 'md', solid = false }) {
  const up = pct >= 0;
  const col = up ? T.up : T.down;
  const small = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: small ? '2px 6px' : '4px 8px',
      borderRadius: T.rPill,
      background: solid ? col : (up ? T.upDim : T.downDim),
      color: solid ? (up ? T.upInk : '#2A0008') : col,
      fontFamily: T.mono, fontSize: small ? 11 : 12.5, fontWeight: 600,
      fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.2px',
    }}>
      {up ? Icon.arrowUp({ s: small ? 11 : 13, c: 'currentColor' }) : Icon.arrowDown({ s: small ? 11 : 13, c: 'currentColor' })}
      {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

/* ---- Button ---------------------------------------------------------- */
function Button({ children, variant = 'primary', size = 'lg', disabled, loading, full, onClick, leading }) {
  const { pressed, bind } = usePress();
  const pad = size === 'lg' ? '0 20px' : size === 'md' ? '0 16px' : '0 12px';
  const hgt = size === 'lg' ? 54 : size === 'md' ? 44 : 36;
  const fs  = size === 'lg' ? 16.5 : size === 'sm' ? 13.5 : 15;

  const styles = {
    primary:   { bg: T.up,   fg: T.upInk, bd: 'transparent' },
    secondary: { bg: T.bg4,  fg: T.ink,   bd: T.hair2 },
    ghost:     { bg: 'transparent', fg: T.ink, bd: T.hair2 },
    danger:    { bg: T.downDim, fg: T.down, bd: 'transparent' },
  }[variant];

  const isDisabled = disabled || loading;
  return (
    <button
      {...bind}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      style={{
        height: hgt, padding: pad, width: full ? '100%' : undefined,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderRadius: T.rMd, border: `1px solid ${styles.bd}`,
        background: styles.bg, color: styles.fg,
        fontFamily: T.sans, fontSize: fs, fontWeight: 700, letterSpacing: '-0.2px', whiteSpace: 'nowrap',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.4 : 1,
        transform: pressed && !isDisabled ? 'scale(0.975)' : 'scale(1)',
        transition: 'transform .12s ease, opacity .15s ease, filter .15s ease',
        filter: pressed && !isDisabled ? 'brightness(0.94)' : 'none',
        boxShadow: variant === 'primary' && !isDisabled ? `0 6px 22px -8px ${T.up}` : 'none',
        WebkitTapHighlightColor: 'transparent', userSelect: 'none',
      }}>
      {loading
        ? <Spinner c={styles.fg} />
        : <>{leading}{children}</>}
    </button>
  );
}

function Spinner({ c = T.ink, s = 18 }) {
  return (
    <span style={{
      width: s, height: s, borderRadius: '50%',
      border: `2.2px solid ${c}`, borderTopColor: 'transparent',
      display: 'inline-block', animation: 'dl-spin .7s linear infinite',
    }} />
  );
}

/* ---- Input ----------------------------------------------------------- */
function Field({ label, hint, error, prefix, suffix, value, onChange, placeholder, disabled, inputMode, focusedDefault }) {
  const [focused, setFocused] = React.useState(!!focusedDefault);
  const border = error ? T.down : focused ? T.up : T.hair2;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <label style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.ink2, letterSpacing: '0.1px' }}>{label}</label>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 54, padding: '0 16px',
        background: disabled ? 'transparent' : T.bg2,
        border: `1.5px solid ${border}`, borderRadius: T.rMd,
        boxShadow: focused && !error ? `0 0 0 4px ${T.upDim}` : 'none',
        opacity: disabled ? 0.5 : 1,
        transition: 'border-color .15s ease, box-shadow .15s ease',
      }}>
        {prefix && <span style={{ fontFamily: T.mono, fontSize: 17, color: T.ink2, fontWeight: 600 }}>{prefix}</span>}
        <input
          value={value} onChange={e => onChange && onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled} inputMode={inputMode}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: prefix || inputMode === 'decimal' ? T.mono : T.sans,
            fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: '-0.2px',
            fontVariantNumeric: 'tabular-nums',
          }} />
        {suffix && <span style={{ fontFamily: T.sans, fontSize: 14, color: T.ink3, fontWeight: 600 }}>{suffix}</span>}
      </div>
      {error
        ? <span style={{ fontFamily: T.sans, fontSize: 12.5, color: T.down, fontWeight: 600 }}>{error}</span>
        : hint ? <span style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3 }}>{hint}</span> : null}
    </div>
  );
}

/* ---- Segmented control ----------------------------------------------- */
function Segmented({ options, value, onChange }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      gap: 4, padding: 4, background: T.bg, borderRadius: T.rMd, border: `1px solid ${T.hair}`,
    }}>
      {options.map(o => {
        const active = o.value === value;
        const col = o.tone === 'up' ? T.up : o.tone === 'down' ? T.down : T.ink;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            height: 44, border: 'none', borderRadius: T.rSm, cursor: 'pointer',
            background: active ? (o.tone === 'up' ? T.upDim : o.tone === 'down' ? T.downDim : T.bg4) : 'transparent',
            color: active ? col : T.ink2,
            fontFamily: T.sans, fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.2px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all .15s ease', WebkitTapHighlightColor: 'transparent',
          }}>
            {o.icon}{o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---- Ticker avatar (monogram) ---------------------------------------- */
function Mono({ sym, size = 40 }) {
  const palette = {
    NVDA:'#1FE08A', AAPL:'#E2E6EA', TSLA:'#FF5C6C', MSFT:'#5AA9FF', COIN:'#5B7BFF',
    AMZN:'#FFB23E', META:'#5AA9FF', GOOGL:'#E2E6EA', AMD:'#FF8A5C', SPY:'#98A2AD',
  };
  const c = palette[sym] || T.ink2;
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: T.bg4, border: `1px solid ${T.hair}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: T.mono, fontWeight: 700, fontSize: size * 0.3, color: c,
      letterSpacing: '-0.5px',
    }}>
      {sym.slice(0, 2)}
    </div>
  );
}

/* ---- Stock row ------------------------------------------------------- */
function StockRow({ s, onClick, showSpark = true }) {
  const { pressed, bind } = usePress();
  const up = s.pct >= 0;
  return (
    <div {...bind} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      cursor: 'pointer', background: pressed ? T.bg3 : 'transparent',
      transition: 'background .12s ease', WebkitTapHighlightColor: 'transparent',
    }}>
      <Mono sym={s.sym} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.sans, fontSize: 15.5, fontWeight: 700, color: T.ink, letterSpacing: '-0.2px' }}>{s.sym}</div>
        <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
      </div>
      {showSpark && <Sparkline data={s.spark} up={up} w={64} h={28} />}
      <div style={{ textAlign: 'right', minWidth: 86 }}>
        <div style={{ fontFamily: T.mono, fontSize: 14.5, fontWeight: 600, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>{fmt.usd(s.price)}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}><Delta pct={s.pct} size="sm" /></div>
      </div>
    </div>
  );
}

/* ---- Section label --------------------------------------------------- */
function SecLabel({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 10px' }}>
      <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '1px' }}>{children}</span>
      {action && <span onClick={onAction} style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.up, cursor: 'pointer' }}>{action}</span>}
    </div>
  );
}

/* ---- Tab bar --------------------------------------------------------- */
function TabBar({ active, onTab }) {
  const tabs = [
    { id: 'home',   label: 'Mercado', icon: Icon.home },
    { id: 'alerts', label: 'Alertas', icon: Icon.bellTab },
    { id: 'profile',label: 'Perfil',  icon: Icon.user },
  ];
  return (
    <div style={{
      display: 'flex', padding: '10px 24px 0',
      borderTop: `1px solid ${T.hair}`, background: 'rgba(10,12,15,0.85)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <button key={t.id} onClick={() => onTab(t.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
            color: on ? T.up : T.ink3, WebkitTapHighlightColor: 'transparent',
          }}>
            {t.icon({ s: 25, c: on ? T.up : T.ink3, w: on ? 2.1 : 1.8, f: on ? T.upDim : 'none' })}
            <span style={{ fontFamily: T.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.2px' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  Icon, usePress, Sparkline, Delta, Button, Spinner, Field, Segmented, Mono, StockRow, SecLabel, TabBar,
});
