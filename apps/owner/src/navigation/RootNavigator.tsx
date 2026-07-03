import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import useAuthStore from '../store/auth.store';
import { AuthStackParamList, AppStackParamList } from './types';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import AppNavigator from './AppNavigator';
import EmployeeOverviewScreen from '../screens/staff/EmployeeOverviewScreen';
import CustomerOverviewScreen from '../screens/customers/CustomerOverviewScreen';
import InventoryOverviewScreen from '../screens/inventory/InventoryOverviewScreen';

const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <AppStack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
      <AppStack.Screen name="HomeTabs" component={AppNavigator} options={{ headerShown: false }} />
      <AppStack.Screen name="StaffOverview" component={EmployeeOverviewScreen} options={{ title: 'Staff Performance' }} />
      <AppStack.Screen name="CustomerOverview" component={CustomerOverviewScreen} options={{ title: 'Customer Ledger' }} />
      <AppStack.Screen name="InventoryOverview" component={InventoryOverviewScreen} options={{ title: 'Inventory Analytics' }} />
    </AppStack.Navigator>
  );
};

export default RootNavigator;
