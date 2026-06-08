import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Clean Architecture + MVVM scaffold (Expo + TypeScript).
// Real features live under src/ui/screens/<Feature>. This landing screen exists
// only to confirm the scaffold runs — replace it with your first feature.
export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Clean Architecture Stack</Text>
        <Text style={styles.subtitle}>Expo · TypeScript · MobX · Inversify</Text>
        <View style={styles.card}>
          <Text style={styles.flow}>ui → viewModel → useCase → domain</Text>
          <Text style={styles.flowSub}>data implements the domain contracts</Text>
        </View>
        <Text style={styles.hint}>
          Scaffold ready. Add your first feature under{'\n'}
          src/ui/screens/ — see /skills for the templates.
        </Text>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#F8FAFC', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#94A3B8', fontSize: 14, marginTop: 6 },
  card: {
    marginTop: 28,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  flow: { color: '#38BDF8', fontSize: 15, fontWeight: '600' },
  flowSub: { color: '#64748B', fontSize: 12, marginTop: 6 },
  hint: { color: '#CBD5E1', fontSize: 13, textAlign: 'center', marginTop: 28, lineHeight: 20 },
});
