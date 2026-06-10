import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';

import { TYPES } from '@/config/types';

import { colors, fonts, radii, spacing } from '@/ui/styles/tokens';
import { accountInitials, accountName } from '@/ui/utils/format';

import { Appear, Button, Txt } from '@/ui/components';
import { useViewModel } from '@/ui/hooks/useViewModel';
import { SessionViewModel } from '@/ui/screens/Login/SessionViewModel';

export const ProfileScreen = observer(() => {
  const session = useViewModel<SessionViewModel>(TYPES.SessionViewModel);
  const insets = useSafeAreaInsets();

  // Local preferences (UI only — not persisted to a backend).
  const [push, setPush] = useState(true);
  const [daily, setDaily] = useState(false);
  const [faceId, setFaceId] = useState(true);

  const toggles: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }[] = [
    { label: 'Notificaciones push', value: push, onChange: setPush },
    { label: 'Resumen diario', value: daily, onChange: setDaily },
    { label: 'Cara · Face ID', value: faceId, onChange: setFaceId },
  ];

  const email = session.currentUser?.email;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.sm },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Txt variant="title">Perfil</Txt>
        </Appear>

        {/* identity card */}
        <Appear index={1}>
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Txt
                style={{
                  fontFamily: fonts.mono.bold,
                  fontSize: 20,
                  color: colors.up,
                }}
              >
                {accountInitials(email)}
              </Txt>
            </View>
            <View style={styles.identity}>
              <Txt variant="headline">{accountName(email)}</Txt>
              <Txt variant="caption" color="ink3">
                {email ?? '—'}
              </Txt>
            </View>
            <View style={styles.pro}>
              <Txt variant="label" style={{ color: colors.up }}>
                PRO
              </Txt>
            </View>
          </View>
        </Appear>

        {/* preferences */}
        <Appear index={2}>
          <View style={styles.list}>
            {toggles.map((t, i) => (
              <View
                key={t.label}
                style={[styles.listRow, i > 0 && styles.listRowDivider]}
              >
                <Txt variant="bodyStrong" style={styles.listLabel}>
                  {t.label}
                </Txt>
                <Switch
                  value={t.value}
                  onValueChange={t.onChange}
                  trackColor={{ false: colors.bg4, true: colors.up }}
                  thumbColor={colors.ink}
                  ios_backgroundColor={colors.bg4}
                />
              </View>
            ))}
          </View>
        </Appear>

        {/* sign out */}
        <Appear index={3} style={styles.signOut}>
          <Button
            label="Cerrar sesión"
            variant="danger"
            onPress={() => session.signOut()}
            full
          />
        </Appear>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.hair,
    borderRadius: radii.lg,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.upDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1, gap: 2 },
  pro: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.upDim,
  },
  list: {
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.hair,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listRowDivider: { borderTopWidth: 1, borderTopColor: colors.hair },
  listLabel: { flex: 1 },
  signOut: { marginTop: spacing.sm },
});
