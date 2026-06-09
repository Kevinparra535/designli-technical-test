/* =========================================================================
   Designli · App screens (interactive)
   ========================================================================= */
const T2 = window.T;
const { Icon: I, Sparkline: Spark, Delta: D, Button: Btn, Field: Fld, Segmented: Seg,
        Mono: Mg, StockRow: Row, SecLabel: SL, TabBar: Tabs, usePress: uPress,
        STOCKS, byId, ALERTS, DETAIL_SERIES, fmt: F, buildSpark: bSpark } = window;

const SAFE_TOP = 56; // clears status bar + dynamic island

/* ---- Screen scaffold ------------------------------------------------- */
function Screen({ children, scroll = true, pad = true }) {
  return (
    <div style={{ height: '100%', background: T2.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        flex: 1, overflowY: scroll ? 'auto' : 'hidden', overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>
        {children}
      </div>
    </div>
  );
}

/* =======================================================================
   HOME · Market list
   ===================================================================== */
function HomeScreen({ onOpen }) {
  const [tab, setTab] = React.useState('watch');
  const movers = [...STOCKS].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 4);
  const dayPct = 1.12;

  return (
    <div>
      {/* header */}
      <div style={{ padding: `${SAFE_TOP}px 20px 8px` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: T2.sans, fontSize: 13, color: T2.ink3, fontWeight: 600 }}>Buenos días, Kevin</div>
            <div style={{ fontFamily: T2.sans, fontSize: 28, color: T2.ink, fontWeight: 800, letterSpacing: '-0.7px', marginTop: 2 }}>Mercado</div>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: T2.rPill, background: T2.bg2, border: `1px solid ${T2.hair}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            {I.bell({ s: 21, c: T2.ink })}
            <span style={{ position: 'absolute', top: 11, right: 12, width: 7, height: 7, borderRadius: 9, background: T2.up, border: `2px solid ${T2.bg2}` }} />
          </div>
        </div>
      </div>

      {/* portfolio summary card */}
      <div style={{ padding: '8px 20px 4px' }}>
        <div style={{
          background: `linear-gradient(160deg, ${T2.bg2}, ${T2.bg})`,
          border: `1px solid ${T2.hair}`, borderRadius: T2.rLg, padding: 18, overflow: 'hidden', position: 'relative',
        }}>
          <div style={{ fontFamily: T2.sans, fontSize: 12.5, color: T2.ink3, fontWeight: 600, letterSpacing: '0.3px' }}>Valor de seguimiento</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
            <div>
              <div style={{ fontFamily: T2.sans, fontSize: 34, fontWeight: 800, color: T2.ink, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>$12,847.20</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <D pct={dayPct} size="sm" />
                <span style={{ fontFamily: T2.mono, fontSize: 12.5, color: T2.ink3, fontVariantNumeric: 'tabular-nums' }}>+$142.30 hoy</span>
              </div>
            </div>
            <Spark data={DETAIL_SERIES.slice(20)} up w={96} h={48} sw={2.2} />
          </div>
        </div>
      </div>

      {/* tabs */}
      <div style={{ padding: '16px 20px 2px', display: 'flex', gap: 18 }}>
        {[['watch', 'Seguimiento'], ['movers', 'Más activos']].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 8px',
            fontFamily: T2.sans, fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px',
            color: tab === id ? T2.ink : T2.ink3,
            borderBottom: `2px solid ${tab === id ? T2.up : 'transparent'}`,
          }}>{lbl}</button>
        ))}
      </div>

      {/* list */}
      <div style={{ padding: '4px 4px 20px' }}>
        {(tab === 'watch' ? STOCKS : movers).map((s, i) => (
          <Row key={s.sym} s={s} onClick={() => onOpen(s.sym)} />
        ))}
      </div>
    </div>
  );
}

/* =======================================================================
   DETAIL · big chart + set alert
   ===================================================================== */
function BigChart({ data, color, target, height = 200 }) {
  const w = 362;
  const { line, area, pts } = bSpark(data, w, height, 6);
  const last = pts[pts.length - 1];
  const gid = 'bg' + Math.round(target || 0);

  // map target price to y
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const tY = target != null ? 6 + (height - 12) * (1 - (mapTarget(target, data) - min) / span) : null;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28"/>
          <stop offset="1" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {tY != null && (
        <>
          <line x1="0" y1={tY} x2={w} y2={tY} stroke={T2.warn} strokeWidth="1.3" strokeDasharray="2 5" opacity="0.9"/>
          <rect x={w - 86} y={tY - 11} width="86" height="22" rx="6" fill={T2.warnDim} />
          <text x={w - 78} y={tY + 4} fill={T2.warn} fontFamily={T2.mono} fontSize="11" fontWeight="700">▲ {F.usd(target, 0)}</text>
        </>
      )}
      <circle cx={last[0]} cy={last[1]} r="4.5" fill={color} />
      <circle cx={last[0]} cy={last[1]} r="9" fill={color} opacity="0.18" />
    </svg>
  );
}
function mapTarget(target, data) {
  // place target visually inside band for the dashed guide
  const min = Math.min(...data), max = Math.max(...data);
  return Math.max(min, Math.min(max, min + (max - min) * 0.78));
}

function DetailScreen({ sym, onBack, onCreateAlert, hasAlert }) {
  const s = byId[sym];
  const up = s.pct >= 0;
  const col = up ? T2.up : T2.down;
  const [range, setRange] = React.useState('1D');
  const series = React.useMemo(() => {
    const base = window.buildSeed ? null : null;
    // scale detail series around the stock price for variety
    const d = DETAIL_SERIES.map((v, i) => v + (s.price - 100) + Math.sin(i / 4 + s.sym.length) * (s.price * 0.01));
    return d;
  }, [sym]);

  const stats = [
    ['Apertura', F.usd(s.price - s.chg)],
    ['Máx día', F.usd(s.price + Math.abs(s.chg) * 1.4)],
    ['Mín día', F.usd(s.price - Math.abs(s.chg) * 1.1)],
    ['Vol', (Math.abs(s.spark[0]) * 1.3).toFixed(1) + 'M'],
  ];

  return (
    <div>
      {/* nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${SAFE_TOP - 6}px 16px 6px`, position: 'sticky', top: 0, background: T2.bg, zIndex: 5 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: T2.rPill, background: T2.bg2, border: `1px solid ${T2.hair}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {I.chevL({ s: 20, c: T2.ink })}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mg sym={s.sym} size={26} />
          <span style={{ fontFamily: T2.sans, fontWeight: 800, fontSize: 16, color: T2.ink }}>{s.sym}</span>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: T2.rPill, background: T2.bg2, border: `1px solid ${T2.hair}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {I.search({ s: 18, c: T2.ink2 })}
        </div>
      </div>

      {/* price */}
      <div style={{ padding: '8px 20px 4px' }}>
        <div style={{ fontFamily: T2.sans, fontSize: 13.5, color: T2.ink3, fontWeight: 600 }}>{s.name} · NASDAQ</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 4 }}>
          <span style={{ fontFamily: T2.sans, fontSize: 40, fontWeight: 800, color: T2.ink, letterSpacing: '-1.4px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{F.usd(s.price)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <D pct={s.pct} />
          <span style={{ fontFamily: T2.mono, fontSize: 13, color: up ? T2.up : T2.down, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{F.sgn(s.chg)} hoy</span>
        </div>
      </div>

      {/* chart */}
      <div style={{ padding: '14px 12px 0' }}>
        <BigChart data={series} color={col} target={hasAlert ? hasAlert.target : null} />
      </div>

      {/* range selector */}
      <div style={{ padding: '14px 20px 4px', display: 'flex', gap: 6 }}>
        {['1H', '1D', '1S', '1M', '1A', 'Máx'].map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            flex: 1, height: 34, borderRadius: T2.rSm, cursor: 'pointer', border: 'none',
            background: range === r ? T2.bg4 : 'transparent',
            color: range === r ? T2.ink : T2.ink3,
            fontFamily: T2.mono, fontSize: 12.5, fontWeight: 700,
          }}>{r}</button>
        ))}
      </div>

      {/* stats grid */}
      <div style={{ padding: '14px 20px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: T2.hair, borderRadius: T2.rMd, overflow: 'hidden', border: `1px solid ${T2.hair}` }}>
          {stats.map(([k, v]) => (
            <div key={k} style={{ background: T2.bg, padding: '12px 14px' }}>
              <div style={{ fontFamily: T2.sans, fontSize: 11.5, color: T2.ink3, fontWeight: 600 }}>{k}</div>
              <div style={{ fontFamily: T2.mono, fontSize: 15, color: T2.ink, fontWeight: 600, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* alert status / CTA */}
      <div style={{ padding: '16px 20px 24px' }}>
        {hasAlert ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: T2.rMd, background: T2.warnDim, border: `1px solid ${T2.warn}33` }}>
            <div style={{ width: 38, height: 38, borderRadius: T2.rPill, background: T2.warnDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.bell({ s: 19, c: T2.warn })}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T2.sans, fontSize: 14, fontWeight: 700, color: T2.ink }}>Alerta activa</div>
              <div style={{ fontFamily: T2.sans, fontSize: 12.5, color: T2.ink2 }}>Te avisamos {hasAlert.cond === 'above' ? 'al subir de' : 'al bajar de'} {F.usd(hasAlert.target, 0)}</div>
            </div>
            <button onClick={onCreateAlert} style={{ fontFamily: T2.sans, fontSize: 13, fontWeight: 700, color: T2.warn, background: 'none', border: 'none', cursor: 'pointer' }}>Editar</button>
          </div>
        ) : (
          <Btn variant="primary" full onClick={onCreateAlert} leading={I.bellPlus({ s: 20, c: T2.upInk })}>
            Crear alerta de precio
          </Btn>
        )}
      </div>
    </div>
  );
}

/* =======================================================================
   SET ALERT · bottom sheet (the form)
   ===================================================================== */
function SetAlertSheet({ sym, onClose, onCreated }) {
  const s = byId[sym];
  const [price, setPrice] = React.useState('');
  const [cond, setCond] = React.useState('above');
  const [touched, setTouched] = React.useState(false);
  const [phase, setPhase] = React.useState('idle'); // idle | saving | success

  const parsed = Number(price.replace(',', '.'));
  const priceValid = price.trim().length > 0 && Number.isFinite(parsed) && parsed > 0;
  const error = touched && !priceValid ? 'Ingresa un precio válido mayor a 0.' : null;

  const submit = async () => {
    setTouched(true);
    if (!priceValid) return;
    setPhase('saving');
    await new Promise(r => setTimeout(r, 1100));
    setPhase('success');
    await new Promise(r => setTimeout(r, 900));
    onCreated({ id: 'n' + Date.now(), sym, cond, target: parsed, status: 'active', when: 'Ahora' });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
      {/* scrim */}
      <div onClick={phase === 'idle' ? onClose : undefined} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
        animation: 'dl-fade .2s ease',
      }} />
      {/* sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: T2.bg2, borderTopLeftRadius: T2.rXl, borderTopRightRadius: T2.rXl,
        border: `1px solid ${T2.hair}`, borderBottom: 'none',
        padding: '12px 20px 40px', animation: 'dl-sheet .32s cubic-bezier(.2,.9,.25,1)',
      }}>
        <div style={{ width: 38, height: 5, borderRadius: 9, background: T2.hair2, margin: '0 auto 16px' }} />

        {phase === 'success' ? (
          <div style={{ padding: '24px 0 12px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: T2.rPill, background: T2.upDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'dl-pop .35s cubic-bezier(.2,1.3,.4,1)' }}>
              {I.check({ s: 34, c: T2.up })}
            </div>
            <div style={{ fontFamily: T2.sans, fontSize: 20, fontWeight: 800, color: T2.ink }}>Alerta creada</div>
            <div style={{ fontFamily: T2.sans, fontSize: 14, color: T2.ink2, marginTop: 6 }}>
              Te notificaremos cuando {s.sym} {cond === 'above' ? 'suba de' : 'baje de'} {F.usd(parsed, 2)}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <div style={{ fontFamily: T2.sans, fontSize: 21, fontWeight: 800, color: T2.ink, letterSpacing: '-0.4px' }}>Nueva alerta</div>
                <div style={{ fontFamily: T2.sans, fontSize: 13.5, color: T2.ink3, marginTop: 2 }}>Recibe una notificación al cruzar tu precio objetivo.</div>
              </div>
              <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: T2.rPill, background: T2.bg4, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{I.x({ s: 18, c: T2.ink2 })}</button>
            </div>

            {/* symbol chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: T2.bg, borderRadius: T2.rMd, border: `1px solid ${T2.hair}`, margin: '18px 0' }}>
              <Mg sym={s.sym} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T2.sans, fontSize: 15, fontWeight: 700, color: T2.ink }}>{s.sym}</div>
                <div style={{ fontFamily: T2.sans, fontSize: 12.5, color: T2.ink3 }}>{s.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: T2.mono, fontSize: 14, fontWeight: 600, color: T2.ink, fontVariantNumeric: 'tabular-nums' }}>{F.usd(s.price)}</div>
                <div style={{ marginTop: 3, display: 'flex', justifyContent: 'flex-end' }}><D pct={s.pct} size="sm" /></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ fontFamily: T2.sans, fontSize: 13, fontWeight: 600, color: T2.ink2, marginBottom: 10 }}>Avísame cuando el precio esté</div>
                <Seg
                  value={cond} onChange={setCond}
                  options={[
                    { value: 'above', label: 'Por encima', tone: 'up', icon: I.arrowUp({ s: 14, c: cond === 'above' ? T2.up : T2.ink3 }) },
                    { value: 'below', label: 'Por debajo', tone: 'down', icon: I.arrowDown({ s: 14, c: cond === 'below' ? T2.down : T2.ink3 }) },
                  ]}
                />
              </div>

              <Fld
                label="Precio objetivo (USD)" prefix="$" placeholder="0.00"
                inputMode="decimal" value={price} error={error}
                onChange={(v) => { setPrice(v.replace(/[^0-9.,]/g, '')); }}
                hint={!error ? `Precio actual ${F.usd(s.price)}` : undefined}
              />

              {/* quick chips */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[-5, -2, 2, 5].map(p => {
                  const v = (s.price * (1 + p / 100));
                  return (
                    <button key={p} onClick={() => { setPrice(v.toFixed(2)); setTouched(true); }} style={{
                      flex: 1, height: 38, borderRadius: T2.rSm, cursor: 'pointer',
                      background: T2.bg, border: `1px solid ${T2.hair}`,
                      fontFamily: T2.mono, fontSize: 12.5, fontWeight: 600,
                      color: p > 0 ? T2.up : T2.down,
                    }}>{p > 0 ? '+' : ''}{p}%</button>
                  );
                })}
              </div>

              <Btn variant="primary" full loading={phase === 'saving'} onClick={submit}>
                {phase === 'saving' ? 'Guardando…' : 'Crear alerta'}
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =======================================================================
   ALERTS · list with states
   ===================================================================== */
function AlertRow({ a, onToggle }) {
  const s = byId[a.sym];
  const triggered = a.status === 'triggered';
  const paused = a.status === 'paused';
  const tone = triggered ? T2.warn : paused ? T2.ink3 : T2.up;
  const toneDim = triggered ? T2.warnDim : paused ? T2.bg4 : T2.upDim;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: 14,
      background: T2.bg2, borderRadius: T2.rMd, border: `1px solid ${triggered ? T2.warn + '33' : T2.hair}`,
      opacity: paused ? 0.62 : 1,
    }}>
      <Mg sym={a.sym} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: T2.sans, fontSize: 15, fontWeight: 700, color: T2.ink }}>{a.sym}</span>
          <span style={{
            fontFamily: T2.sans, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
            color: tone, background: toneDim, padding: '2px 7px', borderRadius: T2.rPill,
          }}>{triggered ? 'Disparada' : paused ? 'Pausada' : 'Activa'}</span>
        </div>
        <div style={{ fontFamily: T2.sans, fontSize: 12.5, color: T2.ink2, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
          {a.cond === 'above' ? I.arrowUp({ s: 12, c: T2.ink3 }) : I.arrowDown({ s: 12, c: T2.ink3 })}
          {a.cond === 'above' ? 'Sube de' : 'Baja de'} <span style={{ fontFamily: T2.mono, fontWeight: 600, color: T2.ink2 }}>{F.usd(a.target, 0)}</span>
          <span style={{ color: T2.ink4 }}>·</span> <span style={{ color: T2.ink3 }}>{a.when}</span>
        </div>
      </div>
      <button onClick={() => onToggle && onToggle(a)} style={{
        width: 36, height: 36, borderRadius: T2.rPill, background: 'transparent', border: `1px solid ${T2.hair}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
      }}>
        {paused ? I.bolt({ s: 15, c: T2.ink2 }) : I.pause({ s: 15, c: T2.ink2 })}
      </button>
    </div>
  );
}

function AlertsScreen({ alerts, onToggle, onGoMarket }) {
  const triggered = alerts.filter(a => a.status === 'triggered');
  const active = alerts.filter(a => a.status !== 'triggered');
  const empty = alerts.length === 0;

  return (
    <div>
      <div style={{ padding: `${SAFE_TOP}px 20px 8px` }}>
        <div style={{ fontFamily: T2.sans, fontSize: 28, color: T2.ink, fontWeight: 800, letterSpacing: '-0.7px' }}>Alertas</div>
        <div style={{ fontFamily: T2.sans, fontSize: 13.5, color: T2.ink3, marginTop: 2 }}>{alerts.length} reglas · {triggered.length} disparadas hoy</div>
      </div>

      {empty ? (
        <div style={{ padding: '60px 32px', textAlign: 'center' }}>
          <div style={{ width: 76, height: 76, borderRadius: T2.rPill, background: T2.bg2, border: `1px solid ${T2.hair}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            {I.bell({ s: 32, c: T2.ink3 })}
          </div>
          <div style={{ fontFamily: T2.sans, fontSize: 18, fontWeight: 800, color: T2.ink }}>Sin alertas todavía</div>
          <div style={{ fontFamily: T2.sans, fontSize: 14, color: T2.ink2, marginTop: 6, lineHeight: 1.5 }}>Crea tu primera alerta desde cualquier acción y te avisamos cuando cruce tu precio.</div>
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
            <Btn variant="secondary" size="md" onClick={onGoMarket} leading={I.plus({ s: 18, c: T2.ink })}>Explorar mercado</Btn>
          </div>
        </div>
      ) : (
        <div style={{ padding: '8px 20px 24px' }}>
          {triggered.length > 0 && <>
            <SL>Disparadas</SL>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
              {triggered.map(a => <AlertRow key={a.id} a={a} onToggle={onToggle} />)}
            </div>
          </>}
          <SL>Activas</SL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {active.map(a => <AlertRow key={a.id} a={a} onToggle={onToggle} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/* =======================================================================
   Toast + push (lockscreen) overlays
   ===================================================================== */
function Toast({ children }) {
  return (
    <div style={{
      position: 'absolute', top: SAFE_TOP, left: 16, right: 16, zIndex: 90,
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
      background: T2.bg3, border: `1px solid ${T2.hair2}`, borderRadius: T2.rMd,
      boxShadow: '0 16px 40px rgba(0,0,0,0.5)', animation: 'dl-drop .35s cubic-bezier(.2,1.1,.3,1)',
    }}>
      <div style={{ width: 30, height: 30, borderRadius: T2.rPill, background: T2.upDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.check({ s: 17, c: T2.up })}</div>
      <span style={{ fontFamily: T2.sans, fontSize: 13.5, fontWeight: 600, color: T2.ink }}>{children}</span>
    </div>
  );
}

Object.assign(window, {
  Screen, HomeScreen, DetailScreen, SetAlertSheet, AlertsScreen, AlertRow, Toast, BigChart,
});
