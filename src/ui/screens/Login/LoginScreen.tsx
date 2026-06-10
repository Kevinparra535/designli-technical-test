import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { BlurView } from 'expo-blur';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { config } from '@/config/config';
import { TYPES } from '@/config/types';

import { colors, fonts, screenPad, spacing } from '@/ui/styles/tokens';
import { fmtPct } from '@/ui/utils/format';

import {
  Appear,
  BrandMark,
  BreathingGlow,
  Button,
  Field,
  Marquee,
  PressableScale,
  Txt,
} from '@/ui/components';
import { useViewModel } from '@/ui/hooks/useViewModel';
import { loginSchema } from '@/ui/schemas';

import { SessionViewModel } from './SessionViewModel';

import { AppleLogo, GoogleLogo } from './components/SocialLogos';

type FormValues = z.infer<typeof loginSchema>;

// Faint ticker tape for atmosphere (decorative). Kept long enough that one copy
// is wider than the screen so the marquee loop has no gaps.
const TICKERS = [
  { sym: 'NVDA', pct: 3.42 },
  { sym: 'AAPL', pct: 0.86 },
  { sym: 'TSLA', pct: -2.13 },
  { sym: 'MSFT', pct: 1.2 },
  { sym: 'COIN', pct: 5.1 },
  { sym: 'META', pct: -0.77 },
  { sym: 'GOOGL', pct: 1.95 },
  { sym: 'AMD', pct: -1.42 },
  { sym: 'AMZN', pct: 0.54 },
  { sym: 'NFLX', pct: 2.18 },
];

export const LoginScreen = observer(() => {
  const viewModel = useViewModel<SessionViewModel>(TYPES.SessionViewModel);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
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
    await viewModel.signIn({
      email: values.email.trim(),
      password: values.password,
    });
  });

  const notAvailable = () =>
    Alert.alert('Próximamente', 'Esta opción aún no está disponible.');

  return (
    <BlurView style={styles.flex} intensity={50} tint="dark">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* breathing ambient glow — soft orbs that pulse + drift */}
        <BreathingGlow />
        {/* blur layer sits ON TOP of the glow (but under the content) so the
            BlurView defocuses the hard circle into a soft halo. */}
        <BlurView
          pointerEvents="none"
          tint="dark"
          intensity={70}
          blurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />

        {/* infinite ticker tape */}
        <Marquee style={styles.ticker} speed={42}>
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
        </Marquee>

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

            {viewModel.submitError ? (
              <Txt variant="caption" color="down">
                {viewModel.submitError}
              </Txt>
            ) : null}

            <View style={styles.submit}>
              <Button
                label="Iniciar sesión"
                onPress={onSubmit}
                loading={viewModel.isSubmitting}
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
    </BlurView>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  ticker: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    opacity: 0.5,
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 20,
    flexShrink: 0,
  },
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
