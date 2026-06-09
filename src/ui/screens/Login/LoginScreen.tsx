import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { observer } from 'mobx-react-lite';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { config } from '@/config/config';
import { container } from '@/config/di';
import { TYPES } from '@/config/types';

import {
  Appear,
  BrandMark,
  Button,
  Field,
  PressableScale,
  Txt,
} from '@/ui/components';
import { colors, fonts, screenPad, spacing } from '@/ui/theme/tokens';

import { SessionViewModel } from './SessionViewModel';

const schema = z.object({
  email: z
    .string()
    .trim()
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Correo no válido.'),
  password: z.string().min(6, 'Mínimo 6 caracteres.'),
});

type FormValues = z.infer<typeof schema>;

// Faint ticker tape for atmosphere (decorative).
const TICKERS = [
  { sym: 'NVDA', pct: 3.42 },
  { sym: 'AAPL', pct: 0.86 },
  { sym: 'TSLA', pct: -2.13 },
  { sym: 'MSFT', pct: 1.2 },
  { sym: 'COIN', pct: 5.1 },
  { sym: 'META', pct: -0.77 },
];

const fmtPct = (n: number) =>
  (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(2) + '%';

export const LoginScreen = observer(() => {
  const vm = useMemo(
    () => container.get<SessionViewModel>(TYPES.SessionViewModel),
    [],
  );

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    // Demo convenience: prefilled working test credentials → one-tap sign-in.
    defaultValues: {
      email: config.TEST_USER.email,
      password: config.TEST_USER.password,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    // On success the RootNavigator swaps to the app stack automatically
    // (it observes session.isAuthenticated); on failure submitError shows below.
    await vm.signIn({ email: values.email.trim(), password: values.password });
  });

  const notAvailable = () =>
    Alert.alert('Próximamente', 'Esta opción aún no está disponible.');

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ambient green glow */}
      <View pointerEvents="none" style={styles.glow} />

      {/* faint ticker tape */}
      <View pointerEvents="none" style={styles.ticker}>
        {TICKERS.map((t) => (
          <View key={t.sym} style={styles.tickerItem}>
            <Txt
              style={{ fontFamily: fonts.mono.semibold, fontSize: 11.5 }}
              color="ink2"
            >
              {t.sym}
            </Txt>
            <Txt
              style={{ fontFamily: fonts.mono.semibold, fontSize: 11.5 }}
              color={t.pct >= 0 ? 'up' : 'down'}
            >
              {fmtPct(t.pct)}
            </Txt>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* brand */}
        <Appear>
          <BrandMark />
          <Txt variant="title" style={styles.headline}>
            {'Tus alertas,\nen tiempo real.'}
          </Txt>
          <Txt variant="body" color="ink3" style={styles.subcopy}>
            Sigue acciones y recibe una notificación cuando crucen tu precio
            objetivo.
          </Txt>
        </Appear>

        {/* form */}
        <Appear index={1} style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field
                label="Correo"
                placeholder="tucorreo@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                accessibilityLabel="Correo electrónico"
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Field
                label="Contraseña"
                placeholder="••••••••"
                suffix="Olvidé"
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                accessibilityLabel="Contraseña"
              />
            )}
          />

          {vm.submitError ? (
            <Txt variant="caption" color="down">
              {vm.submitError}
            </Txt>
          ) : null}

          <View style={styles.submit}>
            <Button
              label="Iniciar sesión"
              onPress={onSubmit}
              loading={vm.isSubmitting}
              disabled={!isValid}
              full
            />
          </View>
        </Appear>

        {/* divider */}
        <Appear index={2} style={styles.divider}>
          <View style={styles.hair} />
          <Txt variant="caption" color="ink3">
            o continúa con
          </Txt>
          <View style={styles.hair} />
        </Appear>

        {/* social */}
        <Appear index={3} style={styles.social}>
          <View style={styles.socialItem}>
            <Button
              label="Apple"
              variant="secondary"
              onPress={notAvailable}
              leading={<AppleLogo />}
              full
            />
          </View>
          <View style={styles.socialItem}>
            <Button
              label="Google"
              variant="secondary"
              onPress={notAvailable}
              leading={<GoogleLogo />}
              full
            />
          </View>
        </Appear>

        {/* footer */}
        <Appear index={4} style={styles.footer}>
          <Txt variant="caption" color="ink3">
            ¿No tienes cuenta?{' '}
          </Txt>
          <PressableScale onPress={notAvailable} scaleTo={0.94}>
            <Txt
              variant="caption"
              color="up"
              style={{ fontFamily: fonts.sans.bold }}
            >
              Crear cuenta
            </Txt>
          </PressableScale>
        </Appear>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

// Brand logos — fixed brand colors (not theme tokens).
function AppleLogo({ size = 19 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fill={colors.ink}
        d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7 1.9-1.1 2.6-2.1c.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.5Z"
      />
      <Path
        fill={colors.ink}
        d="M14.6 6.2c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2Z"
      />
    </Svg>
  );
}

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6c-.2 1.3-1 2.4-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z"
      />
      <Path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.6c-.9.6-2 1-3.3 1-2.6 0-4.7-1.7-5.5-4.1H3.1v2.6C4.8 19.8 8.1 22 12 22Z"
      />
      <Path
        fill="#FBBC05"
        d="M6.5 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.5H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.5l3.4-2.6Z"
      />
      <Path
        fill="#EA4335"
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.1 7.5l3.4 2.6C7.3 7.7 9.4 6 12 6Z"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  glow: {
    position: 'absolute',
    top: -160,
    alignSelf: 'center',
    width: 420,
    height: 360,
    borderRadius: 210,
    backgroundColor: colors.upDim,
    opacity: 0.6,
  },
  ticker: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    paddingHorizontal: 20,
    opacity: 0.5,
  },
  tickerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 48,
  },
  headline: { fontSize: 30, letterSpacing: -0.9, marginTop: spacing.xl },
  subcopy: { marginTop: spacing.sm },
  form: { marginTop: 28, gap: 14 },
  submit: { marginTop: spacing.xs },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: 22,
  },
  hair: { flex: 1, height: 1, backgroundColor: colors.hair },
  social: { flexDirection: 'row', gap: spacing.md },
  socialItem: { flex: 1 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
});
