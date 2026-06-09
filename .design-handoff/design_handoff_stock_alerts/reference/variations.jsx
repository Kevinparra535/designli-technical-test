/* =========================================================================
   Designli · Home variations (alternate directions)
   ========================================================================= */
const T4 = window.T;
const { Icon: Iv, Mono: Mv, Delta: Dv, Sparkline: Sv, fmt: Fv, STOCKS: ST } = window;
const SAFE_TOP_V = 56;

/* ---------- Variation A: Heatmap / tiles (dense) ---------------------- */
function HomeHeatmap() {
  const tiles = ST.slice(0, 8);
  const tint = (pct) => {
    const up = pct >= 0;
    const a = Math.min(0.26, 0.06 + Math.abs(pct) / 22);
    return up ? `rgba(31,224,138,${a})` : `rgba(255,92,108,${a})`;
  };
  return (
    <div style={{ background: T4.bg, minHeight: '100%' }}>
      <div style={{ padding: `${SAFE_TOP_V}px 20px 6px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: T4.sans, fontSize: 28, fontWeight: 800, color: T4.ink, letterSpacing: '-0.7px' }}>Mercado</div>
        <div style={{ fontFamily: T4.mono, fontSize: 12.5, color: T4.up, background: T4.upDim, padding: '5px 10px', borderRadius: T4.rPill, fontWeight: 600 }}>● En vivo</div>
      </div>
      <div style={{ padding: '4px 20px 14px', fontFamily: T4.sans, fontSize: 13.5, color: T4.ink3 }}>Mapa de calor · variación del día</div>
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {tiles.map(s => (
          <div key={s.sym} style={{
            background: tint(s.pct), border: `1px solid ${s.pct >= 0 ? T4.up + '2e' : T4.down + '2e'}`,
            borderRadius: T4.rMd, padding: 14, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: T4.sans, fontSize: 16, fontWeight: 800, color: T4.ink }}>{s.sym}</span>
              {(s.pct >= 0 ? Iv.arrowUp : Iv.arrowDown)({ s: 15, c: s.pct >= 0 ? T4.up : T4.down })}
            </div>
            <div style={{ fontFamily: T4.mono, fontSize: 13, color: T4.ink2, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{Fv.usd(s.price)}</div>
            <div style={{ fontFamily: T4.sans, fontSize: 22, fontWeight: 800, color: s.pct >= 0 ? T4.up : T4.down, marginTop: 2, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{Fv.pct(s.pct)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Variation B: Editorial / hero mover ---------------------- */
function HomeEditorial() {
  const hero = ST.find(s => s.sym === 'COIN');
  const rest = ST.filter(s => s.sym !== 'COIN').slice(0, 6);
  return (
    <div style={{ background: T4.bg, minHeight: '100%' }}>
      <div style={{ padding: `${SAFE_TOP_V}px 24px 4px` }}>
        <div style={{ fontFamily: T4.sans, fontSize: 12, fontWeight: 700, color: T4.ink3, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Mayor movimiento · hoy</div>
      </div>
      {/* hero */}
      <div style={{ padding: '8px 24px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mv sym={hero.sym} size={30} />
          <span style={{ fontFamily: T4.sans, fontSize: 19, fontWeight: 800, color: T4.ink }}>{hero.sym}</span>
          <span style={{ fontFamily: T4.sans, fontSize: 14, color: T4.ink3 }}>{hero.name}</span>
        </div>
        <div style={{ fontFamily: T4.sans, fontSize: 64, fontWeight: 800, color: T4.up, letterSpacing: '-2.5px', lineHeight: 1, marginTop: 14, fontVariantNumeric: 'tabular-nums' }}>
          +5.10<span style={{ fontSize: 34 }}>%</span>
        </div>
        <div style={{ fontFamily: T4.mono, fontSize: 15, color: T4.ink2, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{Fv.usd(hero.price)} · {Fv.sgn(hero.chg)}</div>
        <div style={{ marginTop: 16, marginLeft: -4 }}>
          <Sv data={hero.spark} up w={344} h={92} sw={2.6} />
        </div>
      </div>
      {/* compact list */}
      <div style={{ padding: '8px 24px 4px', fontFamily: T4.sans, fontSize: 12, fontWeight: 700, color: T4.ink3, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Seguimiento</div>
      <div style={{ padding: '0 12px' }}>
        {rest.map((s, i) => (
          <div key={s.sym} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderTop: i ? `1px solid ${T4.hair}` : 'none' }}>
            <span style={{ fontFamily: T4.mono, fontSize: 11, color: T4.ink4, width: 16 }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ flex: 1, fontFamily: T4.sans, fontSize: 15.5, fontWeight: 700, color: T4.ink }}>{s.sym}</span>
            <span style={{ fontFamily: T4.mono, fontSize: 14, color: T4.ink2, fontVariantNumeric: 'tabular-nums' }}>{Fv.usd(s.price)}</span>
            <span style={{ minWidth: 64, textAlign: 'right' }}><Dv pct={s.pct} size="sm" /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HomeHeatmap, HomeEditorial });
