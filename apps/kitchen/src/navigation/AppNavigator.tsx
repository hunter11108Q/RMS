import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from './types';
import { colors } from '@rms/theme';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ActiveQueueScreen from '../screens/kds/ActiveQueueScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import StationSettingsScreen from '../screens/settings/StationSettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcon = (route: string) => {
  if (route === 'Dashboard') return '⊞';
  if (route === 'KDSQueue') return '🍳';
  if (route === 'Analytics') return '📊';
  return '⚙️';
};

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          return (
            <span style={{ 
              fontSize: 22, 
              color: focused ? colors.primary : colors.muted,
              fontWeight: focused ? 'bold' : 'normal'
            }}>
              {tabIcon(route.name)}
            </span>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: colors.foreground,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Kitchen Metrics' }} />
      <Tab.Screen name="KDSQueue" component={ActiveQueueScreen} options={{ title: 'Kitchen Order Tickets' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'KDS Analytics' }} />
      <Tab.Screen name="Settings" component={StationSettingsScreen} options={{ title: 'Station Config' }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
