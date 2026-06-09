/* =========================================================================
   Designli · Design System showcase (all states)
   ========================================================================= */
const T5 = window.T;
const { Icon: Id, Button: Bd, Field: Fd, Segmented: Sd, Delta: Dd, Sparkline: Spd,
        Mono: Md, StockRow: Rd, AlertRow: Ad, STOCKS: STd } = window;

/* ---- shared panel helpers -------------------------------------------- */
function Panel({ title, desc, children, pad = 24 }) {
  return (
    <div style={{ background: T5.bg2, border: `1px solid ${T5.hair}`, borderRadius: T5.rLg, padding: pad, width: '100%' }}>
      <div style={{ fontFamily: T5.sans, fontSize: 13, fontWeight: 800, color: T5.ink, letterSpacing: '0.4px', textTransform: 'uppercase' }}>{title}</div>
      {desc && <div style={{ fontFamily: T5.sans, fontSize: 13, color: T5.ink3, marginTop: 4, marginBottom: 18 }}>{desc}</div>}
      {!desc && <div style={{ height: 18 }} />}
      {children}
    </div>
  );
}
function Cell({ label, children, w }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, width: w }}>
      {children}
      <span style={{ fontFamily: T5.mono, fontSize: 11, color: T5.ink3, letterSpacing: '0.2px' }}>{label}</span>
    </div>
  );
}

/* ---- 1 · Colors ------------------------------------------------------ */
function DSColors() {
  const groups = [
    ['Superficies', [['bg', T5.bg], ['bg2', T5.bg2], ['bg3', T5.bg3], ['bg4', T5.bg4]]],
    ['Texto', [['ink', T5.ink], ['ink2', T5.ink2], ['ink3', T5.ink3], ['ink4', T5.ink4]]],
    ['Semánticos', [['up', T5.up], ['down', T5.down], ['warn', T5.warn], ['info', T5.info]]],
  ];
  return (
    <Panel title="Color" desc="Near-black frío · verde = sube/marca, rojo = baja, ámbar = alerta disparada.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {groups.map(([g, items]) => (
          <div key={g}>
            <div style={{ fontFamily: T5.sans, fontSize: 11, fontWeight: 700, color: T5.ink3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>{g}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {items.map(([name, val]) => (
                <div key={name}>
                  <div style={{ height: 56, borderRadius: T5.rMd, background: val, border: `1px solid ${T5.hair}` }} />
                  <div style={{ fontFamily: T5.mono, fontSize: 11.5, color: T5.ink, marginTop: 7, fontWeight: 600 }}>{name}</div>
                  <div style={{ fontFamily: T5.mono, fontSize: 10.5, color: T5.ink3 }}>{val.length > 9 ? val.slice(0, 9) : val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---- 2 · Type -------------------------------------------------------- */
function DSType() {
  const rows = [
    ['Display', '$12,847.20', 34, 800, T5.sans, 'tabular-nums'],
    ['Title', 'Nueva alerta', 22, 800, T5.sans, 'normal'],
    ['Headline', 'Crear alerta de precio', 16.5, 700, T5.sans, 'normal'],
    ['Body', 'Te avisamos al cruzar el precio.', 15, 500, T5.sans, 'normal'],
    ['Mono · precio', '1,142.30', 15, 600, T5.mono, 'tabular-nums'],
    ['Label', 'PRECIO OBJETIVO', 12, 700, T5.sans, 'normal'],
  ];
  return (
    <Panel title="Tipografía" desc="Hanken Grotesk (UI) + JetBrains Mono (cifras, tabulares).">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map(([name, sample, fs, fw, ff, num], i) => (
          <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 20, padding: '13px 0', borderTop: i ? `1px solid ${T5.hair}` : 'none' }}>
            <span style={{ width: 100, flexShrink: 0, fontFamily: T5.mono, fontSize: 11, color: T5.ink3 }}>{name}</span>
            <span style={{ flex: 1, fontFamily: ff, fontSize: fs, fontWeight: fw, color: T5.ink, fontVariantNumeric: num, letterSpacing: name === 'Label' ? '1px' : '-0.2px', textTransform: name === 'Label' ? 'uppercase' : 'none' }}>{sample}</span>
            <span style={{ fontFamily: T5.mono, fontSize: 10.5, color: T5.ink4 }}>{fs}/{fw}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---- 3 · Data viz ---------------------------------------------------- */
function DSData() {
  const s = STd[0], d = STd[2];
  return (
    <Panel title="Datos & deltas" desc="Sparklines y badges de variación con semántica de color.">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-end' }}>
        <Cell label="spark · up"><Spd data={s.spark} up w={92} h={40} /></Cell>
        <Cell label="spark · down"><Spd data={d.spark} up={false} w={92} h={40} /></Cell>
        <Cell label="delta / md · up"><div><Dd pct={3.42} /></div></Cell>
        <Cell label="delta / md · down"><div><Dd pct={-2.13} /></div></Cell>
        <Cell label="delta / sm"><div><Dd pct={0.86} size="sm" /></div></Cell>
        <Cell label="delta / solid"><div><Dd pct={5.10} solid /></div></Cell>
        <Cell label="monogram"><Md sym="NVDA" /></Cell>
      </div>
    </Panel>
  );
}

/* ---- 4 · Buttons (all states) --------------------------------------- */
function PressedSample({ children }) {
  return <div style={{ transform: 'scale(0.975)', filter: 'brightness(0.94)' }}>{children}</div>;
}
function DSButtons() {
  return (
    <Panel title="Botones" desc="Variantes × estados: default · pressed · loading · disabled.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        <Cell label="primary"><Bd variant="primary" size="md" full>Crear alerta</Bd></Cell>
        <Cell label="primary · pressed"><PressedSample><Bd variant="primary" size="md" full>Crear alerta</Bd></PressedSample></Cell>
        <Cell label="primary · loading"><Bd variant="primary" size="md" full loading>Guardando</Bd></Cell>
        <Cell label="primary · disabled"><Bd variant="primary" size="md" full disabled>Crear alerta</Bd></Cell>
        <Cell label="secondary"><Bd variant="secondary" size="md" full>Editar</Bd></Cell>
        <Cell label="ghost"><Bd variant="ghost" size="md" full>Cancelar</Bd></Cell>
        <Cell label="danger"><Bd variant="danger" size="md" full leading={Id.trash({ s: 17, c: T5.down })}>Eliminar</Bd></Cell>
        <Cell label="sm + icon"><Bd variant="secondary" size="sm" full leading={Id.plus({ s: 16, c: T5.ink })}>Añadir</Bd></Cell>
      </div>
    </Panel>
  );
}

/* ---- 5 · Inputs (all states) ---------------------------------------- */
function DSInputs() {
  return (
    <Panel title="Campos" desc="default · focus · filled · error · disabled.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <Fd label="Default" prefix="$" placeholder="0.00" inputMode="decimal" value="" onChange={() => {}} hint="Precio actual $228.52" />
        <Fd label="Focus" prefix="$" placeholder="0.00" inputMode="decimal" value="" onChange={() => {}} focusedDefault hint="Recibe foco" />
        <Fd label="Filled" prefix="$" inputMode="decimal" value="232.50" onChange={() => {}} hint="Válido" />
        <Fd label="Error" prefix="$" inputMode="decimal" value="0" onChange={() => {}} error="Ingresa un precio mayor a 0." />
        <Fd label="Disabled" prefix="$" value="150.00" onChange={() => {}} disabled />
        <Fd label="Texto · símbolo" placeholder="AAPL" value="" onChange={() => {}} hint="En mayúsculas" />
      </div>
    </Panel>
  );
}

/* ---- 6 · Controls ---------------------------------------------------- */
function DSControls() {
  const [c, setC] = React.useState('above');
  return (
    <Panel title="Segmented control" desc="Selección de condición — arrastra el estado activo.">
      <div style={{ maxWidth: 360 }}>
        <Sd value={c} onChange={setC} options={[
          { value: 'above', label: 'Por encima', tone: 'up', icon: Id.arrowUp({ s: 14, c: c === 'above' ? T5.up : T5.ink3 }) },
          { value: 'below', label: 'Por debajo', tone: 'down', icon: Id.arrowDown({ s: 14, c: c === 'below' ? T5.down : T5.ink3 }) },
        ]} />
      </div>
    </Panel>
  );
}

/* ---- 7 · List rows + alert states ----------------------------------- */
function DSRows() {
  const alerts = [
    { id: 'd1', sym: 'NVDA', cond: 'above', target: 1100, status: 'triggered', when: 'Hoy · 10:24' },
    { id: 'd2', sym: 'AAPL', cond: 'above', target: 230, status: 'active', when: 'Hace 2 días' },
    { id: 'd3', sym: 'MSFT', cond: 'below', target: 450, status: 'paused', when: 'Hace 1 semana' },
  ];
  return (
    <Panel title="Filas & alertas" desc="Stock row + estados de alerta: activa · disparada · pausada." pad={0}>
      <div style={{ padding: '0 0 4px' }}>
        <div style={{ background: T5.bg, borderRadius: T5.rMd, overflow: 'hidden', margin: '0 16px' }}>
          <Rd s={STd[0]} onClick={() => {}} />
          <div style={{ height: 1, background: T5.hair, marginLeft: 68 }} />
          <Rd s={STd[2]} onClick={() => {}} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
          {alerts.map(a => <Ad key={a.id} a={a} onToggle={() => {}} />)}
        </div>
      </div>
    </Panel>
  );
}

/* ---- 8 · Feedback states (skeleton/empty/error/success) ------------- */
function Skel({ w, h, r = 8 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: `linear-gradient(90deg, ${T5.bg3} 0%, ${T5.bg4} 50%, ${T5.bg3} 100%)`, backgroundSize: '200% 100%', animation: 'dl-shimmer 1.4s ease infinite' }} />;
}
function DSStates() {
  const box = { background: T5.bg, border: `1px solid ${T5.hair}`, borderRadius: T5.rMd, padding: 18, minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center' };
  return (
    <Panel title="Estados de feedback" desc="loading (skeleton) · empty · error · success.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {/* skeleton */}
        <div style={box}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Skel w={40} h={40} r={12} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}><Skel w="70%" h={11} /><Skel w="45%" h={9} /></div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}><Skel w="100%" h={9} /><Skel w="80%" h={9} /></div>
          <div style={{ fontFamily: T5.mono, fontSize: 10.5, color: T5.ink3, marginTop: 14 }}>loading</div>
        </div>
        {/* empty */}
        <div style={{ ...box, textAlign: 'center', alignItems: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: T5.rPill, background: T5.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Id.bell({ s: 22, c: T5.ink3 })}</div>
          <div style={{ fontFamily: T5.sans, fontSize: 13.5, fontWeight: 700, color: T5.ink, marginTop: 10 }}>Sin alertas</div>
          <div style={{ fontFamily: T5.mono, fontSize: 10.5, color: T5.ink3, marginTop: 'auto', paddingTop: 12 }}>empty</div>
        </div>
        {/* error */}
        <div style={{ ...box, textAlign: 'center', alignItems: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: T5.rPill, background: T5.downDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Id.x({ s: 24, c: T5.down })}</div>
          <div style={{ fontFamily: T5.sans, fontSize: 13.5, fontWeight: 700, color: T5.ink, marginTop: 10 }}>Algo falló</div>
          <div style={{ fontFamily: T5.sans, fontSize: 11.5, color: T5.ink3, marginTop: 3 }}>Reintentar</div>
          <div style={{ fontFamily: T5.mono, fontSize: 10.5, color: T5.ink3, marginTop: 'auto', paddingTop: 12 }}>error</div>
        </div>
        {/* success */}
        <div style={{ ...box, textAlign: 'center', alignItems: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: T5.rPill, background: T5.upDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Id.check({ s: 26, c: T5.up })}</div>
          <div style={{ fontFamily: T5.sans, fontSize: 13.5, fontWeight: 700, color: T5.ink, marginTop: 10 }}>Alerta creada</div>
          <div style={{ fontFamily: T5.mono, fontSize: 10.5, color: T5.ink3, marginTop: 'auto', paddingTop: 12 }}>success</div>
        </div>
      </div>
    </Panel>
  );
}

Object.assign(window, { DSColors, DSType, DSData, DSButtons, DSInputs, DSControls, DSRows, DSStates });
