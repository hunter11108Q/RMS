import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import useAuthStore from '../store/auth.store';
import { AuthStackParamList, AppStackParamList } from './types';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import PinLoginScreen from '../screens/auth/PinLoginScreen';
import AppNavigator from './AppNavigator';
import TableDetailScreen from '../screens/tables/TableDetailScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import NewOrderScreen from '../screens/orders/NewOrderScreen';

const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="PinLogin" component={PinLoginScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <AppStack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
      <AppStack.Screen name="HomeTabs" component={AppNavigator} options={{ headerShown: false }} />
      <AppStack.Screen 
        name="TableDetail" 
        component={TableDetailScreen} 
        options={({ route }) => ({ title: `Table ${route.params.tableName}` })} 
      />
      <AppStack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen} 
        options={({ route }) => ({ title: `Order #${route.params.orderId.slice(-6).toUpperCase()}` })} 
      />
      <AppStack.Screen 
        name="NewOrder" 
        component={NewOrderScreen} 
        options={{ title: 'Place Order' }} 
      />
    </AppStack.Navigator>
  );
};

export default RootNavigator;
