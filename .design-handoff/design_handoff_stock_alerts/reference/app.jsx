/* =========================================================================
   Designli · Interactive app shell + Profile + Push lockscreen
   ========================================================================= */
const T3 = window.T;
const { Icon: Ic, Button: Bt, Mono: Mn, Delta: Dl, TabBar: TB,
        Screen: Scr, HomeScreen: Home, DetailScreen: Detail, SetAlertSheet: Sheet,
        AlertsScreen: Alerts, Toast: Tst, byId: BY, ALERTS: SEED, fmt: Fm } = window;

/* ---- Profile (tab completeness) -------------------------------------- */
function ProfileScreen() {
  const [push, setPush] = React.useState(true);
  const rows = [
    ['Notificaciones push', push, setPush],
    ['Resumen diario', false, null],
    ['Cara · Face ID', true, null],
  ];
  return (
    <div>
      <div style={{ padding: `${56}px 20px 8px` }}>
        <div style={{ fontFamily: T3.sans, fontSize: 28, color: T3.ink, fontWeight: 800, letterSpacing: '-0.7px' }}>Perfil</div>
      </div>
      <div style={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: T3.bg2, borderRadius: T3.rLg, border: `1px solid ${T3.hair}` }}>
          <div style={{ width: 54, height: 54, borderRadius: T3.rPill, background: T3.upDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T3.mono, fontWeight: 700, fontSize: 20, color: T3.up }}>KP</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T3.sans, fontSize: 17, fontWeight: 700, color: T3.ink }}>Kevin Parra</div>
            <div style={{ fontFamily: T3.sans, fontSize: 13, color: T3.ink3 }}>kevin@designli.co</div>
          </div>
          <span style={{ fontFamily: T3.sans, fontSize: 11, fontWeight: 700, color: T3.up, background: T3.upDim, padding: '4px 9px', borderRadius: T3.rPill }}>PRO</span>
        </div>
      </div>
      <div style={{ padding: '8px 20px' }}>
        <div style={{ background: T3.bg2, borderRadius: T3.rLg, border: `1px solid ${T3.hair}`, overflow: 'hidden' }}>
          {rows.map(([label, on, set], i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '15px 16px', borderTop: i ? `1px solid ${T3.hair}` : 'none' }}>
              <span style={{ flex: 1, fontFamily: T3.sans, fontSize: 15, fontWeight: 600, color: T3.ink }}>{label}</span>
              <button onClick={() => set && set(!on)} style={{
                width: 50, height: 30, borderRadius: T3.rPill, border: 'none', cursor: set ? 'pointer' : 'default',
                background: on ? T3.up : T3.bg4, position: 'relative', transition: 'background .2s ease',
              }}>
                <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left .2s cubic-bezier(.3,1.3,.5,1)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Interactive app ------------------------------------------------- */
function InteractiveApp({ start = 'home' }) {
  const [tab, setTab] = React.useState(start);
  const [detailSym, setDetailSym] = React.useState(null);
  const [sheetSym, setSheetSym] = React.useState(null);
  const [alerts, setAlerts] = React.useState(SEED);
  const [toast, setToast] = React.useState(null);

  const alertFor = (sym) => alerts.find(a => a.sym === sym && a.status !== 'paused');

  const onCreated = (alert) => {
    setAlerts(prev => [{ ...alert }, ...prev.filter(a => !(a.sym === alert.sym && a.status === 'active'))]);
    setSheetSym(null);
    setToast(`Alerta de ${alert.sym} creada`);
    setTimeout(() => setToast(null), 2600);
  };
  const onToggle = (a) => {
    setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, status: x.status === 'paused' ? 'active' : 'paused' } : x));
  };

  let body;
  if (tab === 'home') {
    body = detailSym
      ? <Detail sym={detailSym} hasAlert={alertFor(detailSym)} onBack={() => setDetailSym(null)} onCreateAlert={() => setSheetSym(detailSym)} />
      : <Home onOpen={(sym) => setDetailSym(sym)} />;
  } else if (tab === 'alerts') {
    body = <Alerts alerts={alerts} onToggle={onToggle} onGoMarket={() => setTab('home')} />;
  } else {
    body = <ProfileScreen />;
  }

  return (
    <div style={{ height: '100%', background: T3.bg, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        {body}
      </div>
      <div style={{ paddingBottom: 22 }}>
        <TB active={tab} onTab={(t) => { setTab(t); setDetailSym(null); }} />
      </div>
      {sheetSym && <Sheet sym={sheetSym} onClose={() => setSheetSym(null)} onCreated={onCreated} />}
      {toast && <Tst>{toast}</Tst>}
    </div>
  );
}

/* ---- Push lockscreen mockup ------------------------------------------ */
function PushLockScreen() {
  const s = BY.NVDA;
  return (
    <div style={{
      height: '100%', position: 'relative', overflow: 'hidden',
      background: `radial-gradient(120% 80% at 50% -10%, #0e231a 0%, #0A0C0F 55%, #07090b 100%)`,
    }}>
      {/* faint grid glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 40% at 50% 22%, ${T3.upDim} 0%, transparent 70%)`, opacity: 0.5 }} />

      {/* clock */}
      <div style={{ position: 'relative', textAlign: 'center', paddingTop: 78 }}>
        <div style={{ fontFamily: T3.sans, fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px' }}>lunes, 8 de junio</div>
        <div style={{ fontFamily: T3.sans, fontSize: 86, fontWeight: 700, color: '#fff', letterSpacing: '-2px', lineHeight: 1, marginTop: 2 }}>9:41</div>
      </div>

      {/* notification banner */}
      <div style={{ position: 'absolute', left: 12, right: 12, top: 250 }}>
        <div style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'rgba(38,44,52,0.9)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: 22, border: `1px solid rgba(255,255,255,0.14)`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          animation: 'dl-drop .5s cubic-bezier(.2,1.1,.3,1)',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: T3.up, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {Ic.bell({ s: 22, c: T3.upInk })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: T3.sans, fontSize: 12.5, fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Designli</span>
              <span style={{ fontFamily: T3.sans, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>ahora</span>
            </div>
            <div style={{ fontFamily: T3.sans, fontSize: 14.5, fontWeight: 700, color: '#fff', marginTop: 3 }}>NVDA cruzó tu alerta 🚀</div>
            <div style={{ fontFamily: T3.sans, fontSize: 13.5, color: 'rgba(255,255,255,0.78)', marginTop: 2, lineHeight: 1.35 }}>
              Subió por encima de <span style={{ fontFamily: T3.mono, fontWeight: 600 }}>$1,100</span> · ahora <span style={{ fontFamily: T3.mono, fontWeight: 600, color: T3.up }}>{Fm.usd(s.price)} (+3.42%)</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 14, fontFamily: T3.sans, fontSize: 12.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
          Firebase Cloud Messaging
        </div>
      </div>

      {/* bottom lock hint */}
      <div style={{ position: 'absolute', bottom: 44, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 38px' }}>
        <div style={{ width: 44, height: 44, borderRadius: T3.rPill, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic.bolt({ s: 18, c: '#fff' })}</div>
        <div style={{ width: 44, height: 44, borderRadius: T3.rPill, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ic.search({ s: 18, c: '#fff' })}</div>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileScreen, InteractiveApp, PushLockScreen });
