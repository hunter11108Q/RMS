import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from './types';
import { colors } from '@rms/theme';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SalesAnalyticsScreen from '../screens/analytics/SalesAnalyticsScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import ReportHubScreen from '../screens/reports/ReportHubScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcon = (route: string) => {
  if (route === 'Dashboard') return '📈';
  if (route === 'Analytics') return '📊';
  if (route === 'Notifications') return '🔔';
  return '📋';
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Executive Overview' }} />
      <Tab.Screen name="Analytics" component={SalesAnalyticsScreen} options={{ title: 'Sales Analytics' }} />
      <Tab.Screen name="Notifications" component={NotificationCenterScreen} options={{ title: 'Business Alerts' }} />
      <Tab.Screen name="Reports" component={ReportHubScreen} options={{ title: 'Report Hub' }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
