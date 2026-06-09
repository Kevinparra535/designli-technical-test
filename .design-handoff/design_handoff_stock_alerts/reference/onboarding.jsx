/* =========================================================================
   Designli · Onboarding — Login + Notification permissions
   ========================================================================= */
const T6 = window.T;
const { Icon: Io, Button: Bo, Field: Fo, Sparkline: So, Delta: Do, Mono: Mo,
        usePress: uP, fmt: Fo2, STOCKS: STo } = window;

/* extra glyphs local to onboarding */
const GApple = (p = {}) => (
  <svg width={p.s || 20} height={p.s || 20} viewBox="0 0 24 24" fill="none">
    <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7 1.9-1.1 2.6-2.1c.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.5Z" fill={p.c || '#fff'}/>
    <path d="M14.6 6.2c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2Z" fill={p.c || '#fff'}/>
  </svg>
);
const GGoogle = (p = {}) => (
  <svg width={p.s || 20} height={p.s || 20} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6c-.2 1.3-1 2.4-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.6c-.9.6-2 1-3.3 1-2.6 0-4.7-1.7-5.5-4.1H3.1v2.6C4.8 19.8 8.1 22 12 22Z"/>
    <path fill="#FBBC05" d="M6.5 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.5H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.5l3.4-2.6Z"/>
    <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.1 7.5l3.4 2.6C7.3 7.7 9.4 6 12 6Z"/>
  </svg>
);
const GFace = (p = {}) => (
  <svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" fill="none">
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M9 9.5v1M15 9.5v1M12 9v3l-1 .8M9.2 14.5s1 1.2 2.8 1.2 2.8-1.2 2.8-1.2" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const GLock = (p = {}) => (
  <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" stroke={p.c || 'currentColor'} strokeWidth="1.7"/>
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
);

const SAFE6 = 56;

/* ---- Brand mark ------------------------------------------------------ */
function BrandMark({ size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, position: 'relative',
      background: `linear-gradient(150deg, ${T6.up}, #12B873)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 10px 30px -8px ${T6.up}`,
    }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
        <path d="M3 16l4.5-5 3.5 3.5L20 6" stroke={T6.upInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 6h5v5" stroke={T6.upInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ---- LOGIN ----------------------------------------------------------- */
function LoginScreen({ onSubmit }) {
  const [email, setEmail] = React.useState('kevin@designli.co');
  const [pw, setPw] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [phase, setPhase] = React.useState('idle'); // idle | loading

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const pwOk = pw.length >= 6;
  const emailErr = touched && !emailOk ? 'Correo no válido.' : null;
  const pwErr = touched && !pwOk ? 'Mínimo 6 caracteres.' : null;

  const submit = async () => {
    setTouched(true);
    if (!emailOk || !pwOk) return;
    setPhase('loading');
    await new Promise(r => setTimeout(r, 1100));
    onSubmit && onSubmit();
  };

  // faint ticker strip for atmosphere
  const ticker = STo.slice(0, 6);

  return (
    <div style={{ height: '100%', background: T6.bg, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* ambient glow */}
      <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 460, height: 360, background: `radial-gradient(50% 50% at 50% 50%, ${T6.upDim} 0%, transparent 72%)`, pointerEvents: 'none' }} />
      {/* faint ticker tape */}
      <div style={{ position: 'absolute', top: SAFE6 + 6, left: 0, right: 0, display: 'flex', gap: 18, padding: '0 20px', opacity: 0.5, overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)' }}>
        {ticker.map(s => (
          <div key={s.sym} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontFamily: T6.mono, fontSize: 11.5, color: T6.ink2, fontWeight: 600 }}>{s.sym}</span>
            <span style={{ fontFamily: T6.mono, fontSize: 11.5, color: s.pct >= 0 ? T6.up : T6.down, fontWeight: 600 }}>{Fo2.pct(s.pct)}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px', position: 'relative' }}>
        {/* brand */}
        <div style={{ marginBottom: 28 }}>
          <BrandMark />
          <div style={{ fontFamily: T6.sans, fontSize: 30, fontWeight: 800, color: T6.ink, letterSpacing: '-0.9px', marginTop: 20, lineHeight: 1.1 }}>
            Tus alertas,<br />en tiempo real.
          </div>
          <div style={{ fontFamily: T6.sans, fontSize: 15, color: T6.ink3, marginTop: 8, lineHeight: 1.45 }}>
            Sigue acciones y recibe una notificación cuando crucen tu precio objetivo.
          </div>
        </div>

        {/* form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Fo label="Correo" placeholder="tucorreo@email.com" value={email} error={emailErr}
              onChange={(v) => setEmail(v)} inputMode="email" />
          <Fo label="Contraseña" placeholder="••••••••" value={pw} error={pwErr}
              onChange={(v) => setPw(v)} suffix="Olvidé" />

          <div style={{ marginTop: 4 }}>
            <Bo variant="primary" full loading={phase === 'loading'} onClick={submit}>
              {phase === 'loading' ? 'Entrando…' : 'Iniciar sesión'}
            </Bo>
          </div>
        </div>

        {/* divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
          <div style={{ flex: 1, height: 1, background: T6.hair }} />
          <span style={{ fontFamily: T6.sans, fontSize: 12, color: T6.ink3, fontWeight: 600 }}>o continúa con</span>
          <div style={{ flex: 1, height: 1, background: T6.hair }} />
        </div>

        {/* social */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Bo variant="secondary" full leading={GApple({ s: 19 })}>Apple</Bo>
          <Bo variant="secondary" full leading={GGoogle({ s: 18 })}>Google</Bo>
        </div>
      </div>

      {/* footer */}
      <div style={{ textAlign: 'center', padding: '0 26px 36px' }}>
        <span style={{ fontFamily: T6.sans, fontSize: 13.5, color: T6.ink3 }}>¿No tienes cuenta? </span>
        <span style={{ fontFamily: T6.sans, fontSize: 13.5, color: T6.up, fontWeight: 700 }}>Crear cuenta</span>
      </div>
    </div>
  );
}

/* ---- iOS system permission dialog ------------------------------------ */
function IOSPermDialog({ onAllow, onDeny }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{
        position: 'relative', width: 270, borderRadius: 16, overflow: 'hidden',
        background: 'rgba(44,44,46,0.82)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '0.5px solid rgba(255,255,255,0.12)', animation: 'dl-popv .3s cubic-bezier(.2,1.2,.4,1)',
        fontFamily: '-apple-system, system-ui, sans-serif', textAlign: 'center',
      }}>
        <div style={{ padding: '18px 16px 14px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>"Designli" quiere enviarte notificaciones</div>
          <div style={{ fontSize: 12.5, color: 'rgba(235,235,245,0.7)', marginTop: 5, lineHeight: 1.35 }}>
            Las notificaciones pueden incluir alertas, sonidos e íconos. Configúralas en Ajustes.
          </div>
        </div>
        <div style={{ display: 'flex', borderTop: '0.5px solid rgba(255,255,255,0.14)' }}>
          <button onClick={onDeny} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderRight: '0.5px solid rgba(255,255,255,0.14)', color: '#0A84FF', fontSize: 16, fontWeight: 400, cursor: 'pointer' }}>No permitir</button>
          <button onClick={onAllow} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', color: '#0A84FF', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>Permitir</button>
        </div>
      </div>
    </div>
  );
}

/* ---- PERMISSIONS ----------------------------------------------------- */
function PermissionsScreen({ onDone, forceDialog = false }) {
  const [dialog, setDialog] = React.useState(forceDialog);
  const [granted, setGranted] = React.useState(false);

  const benefits = [
    [Io.bolt, T6.up, 'Alertas al instante', 'En cuanto el precio cruza tu objetivo.'],
    [Io.pulse, T6.info, 'Movimientos del mercado', 'Subidas y caídas relevantes de tu lista.'],
    [Io.bell, T6.warn, 'Solo lo que importa', 'Tú eliges los precios. Sin spam, nunca.'],
  ];

  const allow = () => { setDialog(false); setGranted(true); setTimeout(() => onDone && onDone(), 700); };

  return (
    <div style={{ height: '100%', background: T6.bg, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 420, height: 320, background: `radial-gradient(50% 50% at 50% 50%, ${T6.warnDim} 0%, transparent 72%)`, pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px', position: 'relative' }}>
        {/* bell hero */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: T6.rPill, background: T6.warnDim }} />
            <div style={{ position: 'absolute', inset: 14, borderRadius: T6.rPill, background: T6.bg2, border: `1px solid ${T6.hair2}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {granted ? Io.check({ s: 40, c: T6.up }) : Io.bell({ s: 40, c: T6.warn })}
            </div>
            {!granted && <span style={{ position: 'absolute', top: 18, right: 18, minWidth: 22, height: 22, padding: '0 6px', borderRadius: T6.rPill, background: T6.down, color: '#fff', fontFamily: T6.sans, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${T6.bg}` }}>1</span>}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ fontFamily: T6.sans, fontSize: 25, fontWeight: 800, color: T6.ink, letterSpacing: '-0.6px' }}>
            {granted ? '¡Listo!' : 'No te pierdas ningún movimiento'}
          </div>
          <div style={{ fontFamily: T6.sans, fontSize: 14.5, color: T6.ink2, marginTop: 7, lineHeight: 1.45 }}>
            {granted ? 'Te avisaremos en cuanto algo importante pase.' : 'Activa las notificaciones para recibir tus alertas de precio.'}
          </div>
        </div>

        {/* benefits */}
        {!granted && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
            {benefits.map(([icon, col, title, desc]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: T6.bg2, border: `1px solid ${T6.hair}`, borderRadius: T6.rMd }}>
                <div style={{ width: 40, height: 40, borderRadius: T6.rSm, background: col + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon({ s: 21, c: col })}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T6.sans, fontSize: 14.5, fontWeight: 700, color: T6.ink }}>{title}</div>
                  <div style={{ fontFamily: T6.sans, fontSize: 12.5, color: T6.ink3, marginTop: 1 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* actions */}
      {!granted && (
        <div style={{ padding: '0 26px 30px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Bo variant="primary" full onClick={() => setDialog(true)} leading={Io.bell({ s: 19, c: T6.upInk })}>
            Activar notificaciones
          </Bo>
          <button onClick={() => onDone && onDone()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, fontFamily: T6.sans, fontSize: 14.5, fontWeight: 700, color: T6.ink3 }}>
            Ahora no
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2 }}>
            {GLock({ s: 13, c: T6.ink4 })}
            <span style={{ fontFamily: T6.sans, fontSize: 11.5, color: T6.ink4 }}>Gestionado por iOS · cámbialo cuando quieras</span>
          </div>
        </div>
      )}

      {dialog && <IOSPermDialog onAllow={allow} onDeny={() => setDialog(false)} />}
    </div>
  );
}

Object.assign(window, { LoginScreen, PermissionsScreen, IOSPermDialog, BrandMark });
