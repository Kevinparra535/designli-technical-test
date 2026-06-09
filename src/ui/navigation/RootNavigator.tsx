import { useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';

import { container } from '@/config/di';
import { TYPES } from '@/config/types';

import { CreateStockAlertScreen } from '@/ui/screens/CreateStockAlert/CreateStockAlertScreen';
import { HomeScreen } from '@/ui/screens/Home/HomeScreen';
import { LoginScreen } from '@/ui/screens/Login/LoginScreen';
import { SessionViewModel } from '@/ui/screens/Login/SessionViewModel';
import { StockDetailScreen } from '@/ui/screens/StockDetail/StockDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  StockDetail: { symbol: string };
  CreateStockAlert: { symbol?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = observer(() => {
  const session = useMemo(
    () => container.get<SessionViewModel>(TYPES.SessionViewModel),
    [],
  );

  // Resolve the stored session on app start (Login vs app stack).
  useEffect(() => {
    session.checkSession();
  }, [session]);

  if (session.isCheckingSession) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {session.isAuthenticated ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Home', headerBackVisible: false }}
            />
            <Stack.Screen
              name="StockDetail"
              component={StockDetailScreen}
              options={{ title: 'Stock detail' }}
            />
            <Stack.Screen
              name="CreateStockAlert"
              component={CreateStockAlertScreen}
              options={{ title: 'New alert' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

const styles = {
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center' } as const,
};
