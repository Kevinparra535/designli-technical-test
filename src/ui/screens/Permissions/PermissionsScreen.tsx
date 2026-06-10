import React, { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { BlurView } from 'expo-blur';

import { TYPES } from '@/config/types';

import { colors, type ColorToken, radii, spacing } from '@/ui/styles/tokens';

import {
  Appear,
  Button,
  Icon,
  type IconName,
  PressableScale,
  Txt,
} from '@/ui/components';
import { useViewModel } from '@/ui/hooks/useViewModel';
import { SessionViewModel } from '@/ui/screens/Login/SessionViewModel';

import { PermissionsViewModel } from './PermissionsViewModel';

type Benefit = {
  icon: IconName;
  color: ColorToken;
  bg: ColorToken;
  title: string;
  desc: string;
};

const BENEFITS: Benefit[] = [
  {
    icon: 'bolt',
    color: 'up',
    bg: 'upDim',
    title: 'Alertas al instante',
    desc: 'En cuanto el precio cruza tu objetivo.',
  },
  {
    icon: 'pulse',
    color: 'info',
    bg: 'infoDim',
    title: 'Movimientos del mercado',
    desc: 'Subidas y caídas relevantes de tu lista.',
  },
  {
    icon: 'bell',
    color: 'warn',
    bg: 'warnDim',
    title: 'Solo lo que importa',
    desc: 'Tú eliges los precios. Sin spam, nunca.',
  },
];

export const PermissionsScreen = observer(() => {
  const viewModel = useViewModel<PermissionsViewModel>(
    TYPES.PermissionsViewModel,
  );
  const session = useViewModel<SessionViewModel>(TYPES.SessionViewModel);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEnable = async () => {
    const granted = await viewModel.enable();
    if (granted) {
      // Let the success state breathe, then enter the app.
      timer.current = setTimeout(
        () => session.completePermissionsOnboarding(),
        900,
      );
    }
  };

  const onSkip = () => {
    if (timer.current) clearTimeout(timer.current);
    session.completePermissionsOnboarding();
  };

  const granted = viewModel.isGranted;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ambient amber glow */}
      <View pointerEvents="none" style={styles.glow} />

      <BlurView
        pointerEvents="none"
        tint="dark"
        intensity={80}
        blurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />

      {/* bell hero */}
      <Appear>
        <View style={styles.heroWrap}>
          <View style={styles.heroRing}>
            <View style={styles.heroCore}>
              <Icon
                name={granted ? 'check' : 'bell'}
                size={40}
                color={granted ? colors.up : colors.warn}
              />
            </View>
            {!granted ? (
              <View style={styles.badge}>
                <Txt
                  color="ink"
                  style={{ fontSize: 12, lineHeight: 16 }}
                  variant="label"
                >
                  1
                </Txt>
              </View>
            ) : null}
          </View>
        </View>
      </Appear>

      {/* headline */}
      <Appear index={1} style={styles.headline}>
        <Txt variant="title" align="center">
          {granted ? '¡Listo!' : 'No te pierdas ningún movimiento'}
        </Txt>
        <Txt variant="body" color="ink2" align="center" style={styles.subtitle}>
          {granted
            ? 'Te avisaremos en cuanto algo importante pase.'
            : 'Activa las notificaciones para recibir tus alertas de precio.'}
        </Txt>
      </Appear>

      {/* benefits + actions (hidden once granted) */}
      {!granted ? (
        <>
          <View style={styles.benefits}>
            {BENEFITS.map((b, i) => (
              <Appear key={b.title} index={2 + i}>
                <View style={styles.card}>
                  <View
                    style={[styles.cardIcon, { backgroundColor: colors[b.bg] }]}
                  >
                    <Icon name={b.icon} size={21} color={colors[b.color]} />
                  </View>
                  <View style={styles.cardText}>
                    <Txt variant="bodyStrong">{b.title}</Txt>
                    <Txt variant="caption" color="ink3">
                      {b.desc}
                    </Txt>
                  </View>
                </View>
              </Appear>
            ))}
          </View>

          <Appear index={5} style={styles.actions}>
            <Button
              label="Activar notificaciones"
              onPress={onEnable}
              loading={viewModel.isRequesting}
              leading={<Icon name="bell" size={19} color={colors.upInk} />}
              full
            />

            <PressableScale
              onPress={onSkip}
              scaleTo={0.96}
              accessibilityRole="button"
              style={styles.skip}
            >
              <Txt variant="bodyStrong" color="ink3">
                Ahora no
              </Txt>
            </PressableScale>

            {viewModel.wasDenied ? (
              <Txt variant="caption" color="ink3" align="center">
                No se concedió el permiso. Puedes activarlo luego en Ajustes.
              </Txt>
            ) : null}

            <View style={styles.privacy}>
              <Icon name="lock" size={13} color={colors.ink4} />
              <Txt variant="caption" color="ink4">
                Gestionado por el sistema · cámbialo cuando quieras
              </Txt>
            </View>
          </Appear>
        </>
      ) : null}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 48,
  },
  glow: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 420,
    height: 320,
    borderRadius: 210,
    backgroundColor: colors.warnDim,
    opacity: 0.5,
  },
  heroWrap: { alignItems: 'center', marginBottom: 26 },
  heroRing: {
    width: 96,
    height: 96,
    borderRadius: radii.pill,
    backgroundColor: colors.warnDim,
  },
  heroCore: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.hair2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.down,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: { marginBottom: 26 },
  subtitle: { marginTop: spacing.sm },
  benefits: { gap: spacing.md, marginBottom: 30 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.hair,
    borderRadius: radii.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardText: { flex: 1, gap: 2 },
  actions: { gap: spacing.md },
  skip: { alignSelf: 'center', paddingVertical: 8 },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
});
