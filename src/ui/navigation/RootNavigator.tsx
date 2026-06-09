import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';

import { container } from '@/config/di';
import { TYPES } from '@/config/types';

import { AlertsListScreen } from '@/ui/screens/AlertsList/AlertsListScreen';
import { CreateStockAlertScreen } from '@/ui/screens/CreateStockAlert/CreateStockAlertScreen';
import { HomeScreen } from '@/ui/screens/Home/HomeScreen';
import { LoginScreen } from '@/ui/screens/Login/LoginScreen';
import { SessionViewModel } from '@/ui/screens/Login/SessionViewModel';
import { PermissionsScreen } from '@/ui/screens/Permissions/PermissionsScreen';
import { StockDetailScreen } from '@/ui/screens/StockDetail/StockDetailScreen';

export type AppTabParamList = {
  Home: undefined;
  Alerts: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Permissions: undefined;
  Main: NavigatorScreenParams<AppTabParamList> | undefined;
  StockDetail: { symbol: string };
  CreateStockAlert: { symbol?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

const tabIcon = (glyph: string) => {
  const TabIcon = ({ color }: { color: string }) => (
    <Text style={{ fontSize: 18, color }}>{glyph}</Text>
  );
  return TabIcon;
};

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: true, tabBarActiveTintColor: '#2563EB' }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'Home', tabBarIcon: tabIcon('🏠') }}
    />
    <Tab.Screen
      name="Alerts"
      component={AlertsListScreen}
      options={{ title: 'Alerts', tabBarIcon: tabIcon('🔔') }}
    />
  </Tab.Navigator>
);

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
          session.needsPermissionsOnboarding ? (
            <Stack.Screen
              name="Permissions"
              component={PermissionsScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen
                name="Main"
                component={AppTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="StockDetail"
                component={StockDetailScreen}
                options={{ title: 'Stock detail' }}
              />
              <Stack.Screen
                name="CreateStockAlert"
                component={CreateStockAlertScreen}
                options={{
                  title: 'New alert',
                  presentation: 'formSheet',
                  sheetAllowedDetents: 'fitToContents',
                }}
              />
            </>
          )
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
