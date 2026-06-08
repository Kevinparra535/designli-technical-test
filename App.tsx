import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from '@/ui/navigation/RootNavigator';

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}
