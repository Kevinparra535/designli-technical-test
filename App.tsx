import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from '@/ui/navigation/RootNavigator';

import { Spinner } from '@/ui/components';
import { fontAssets } from '@/ui/styles/fonts';
import { colors } from '@/ui/styles/tokens';

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <Spinner size={28} color={colors.up} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <RootNavigator />
      <StatusBar style="light" />
    </>
  );
}

const styles = {
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
} as const;
