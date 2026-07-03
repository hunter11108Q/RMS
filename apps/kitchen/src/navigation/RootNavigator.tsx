import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import useAuthStore from '../store/auth.store';
import { AuthStackParamList, AppStackParamList } from './types';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import AppNavigator from './AppNavigator';

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
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="HomeTabs" component={AppNavigator} />
    </AppStack.Navigator>
  );
};

export default RootNavigator;
