import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from './types';
import { colors } from '@rms/theme';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import FloorScreen from '../screens/tables/FloorScreen';
import OrderListScreen from '../screens/orders/OrderListScreen';
import MenuBrowseScreen from '../screens/menu/MenuBrowseScreen';
import ReservationListScreen from '../screens/reservations/ReservationListScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcon = (route: string, focused: boolean) => {
  let icon = '•';
  if (route === 'Dashboard') icon = '⊞';
  else if (route === 'Tables') icon = '🪑';
  else if (route === 'Orders') icon = '📋';
  else if (route === 'Menu') icon = '📖';
  else if (route === 'Reservations') icon = '📅';

  return icon;
};

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          return (
            <span style={{ 
              fontSize: 20, 
              color: focused ? colors.primary : colors.muted,
              fontWeight: focused ? 'bold' : 'normal'
            }}>
              {tabIcon(route.name, focused)}
            </span>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontFamily: 'System',
          fontWeight: '700',
          fontSize: 18,
          color: colors.foreground,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Tables" component={FloorScreen} options={{ title: 'Floor Layout' }} />
      <Tab.Screen name="Orders" component={OrderListScreen} options={{ title: 'Orders Queue' }} />
      <Tab.Screen name="Menu" component={MenuBrowseScreen} options={{ title: 'Browse Menu' }} />
      <Tab.Screen name="Reservations" component={ReservationListScreen} options={{ title: 'Bookings' }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
