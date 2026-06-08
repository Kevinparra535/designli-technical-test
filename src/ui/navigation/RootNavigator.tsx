import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateStockAlertScreen } from '@/ui/screens/CreateStockAlert/CreateStockAlertScreen';
import { HomeScreen } from '@/ui/screens/Home/HomeScreen';

export type RootStackParamList = {
  Home: undefined;
  CreateStockAlert: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="CreateStockAlert"
        component={CreateStockAlertScreen}
        options={{
          title: 'New alert',
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
