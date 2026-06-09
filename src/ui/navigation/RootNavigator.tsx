import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
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
import { ProfileScreen } from '@/ui/screens/Profile/ProfileScreen';
import { StockDetailScreen } from '@/ui/screens/StockDetail/StockDetailScreen';

import { Icon, type IconName, Spinner } from '@/ui/components';
import { colors, fonts } from '@/ui/theme/tokens';

export type AppTabParamList = {
  Home: undefined;
  Alerts: undefined;
  Profile: undefined;
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

const tabIcon = (name: IconName) => {
  const TabIcon = ({ color, focused }: { color: string; focused: boolean }) => (
    <Icon
      name={name}
      size={24}
      color={color}
      fill={focused ? colors.upDim : 'none'}
    />
  );
  return TabIcon;
};

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg2,
    border: colors.hair,
    primary: colors.up,
    text: colors.ink,
  },
};

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.up,
      tabBarInactiveTintColor: colors.ink3,
      tabBarStyle: {
        backgroundColor: colors.bg2,
        borderTopColor: colors.hair,
        borderTopWidth: 1,
      },
      tabBarLabelStyle: { fontFamily: fonts.sans.bold, fontSize: 10.5 },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'Mercado', tabBarIcon: tabIcon('home') }}
    />
    <Tab.Screen
      name="Alerts"
      component={AlertsListScreen}
      options={{ title: 'Alertas', tabBarIcon: tabIcon('bellTab') }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Perfil', tabBarIcon: tabIcon('user') }}
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
        <Spinner size={28} color={colors.up} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
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
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CreateStockAlert"
                component={CreateStockAlertScreen}
                options={{
                  title: 'Nueva alerta',
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
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  } as const,
};
