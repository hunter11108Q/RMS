import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './src/store/auth.store';
import useOfflineStore from './src/store/offline.store';
import useOwnerStore from './src/store/owner.store';
import RootNavigator from './src/navigation/RootNavigator';
import wsClient from './src/services/wsClient';
import { colors } from '@rms/theme';

const queryClient = new QueryClient();

export default function App() {
  const { restoreSession, isAuthenticated } = useAuthStore();
  const { isOnline, setOnlineStatus } = useOfflineStore();
  const { loadCache } = useOwnerStore();
  const [initLoading, setInitLoading] = useState(true);

  // 1. Restore cache and authentication session on mount
  useEffect(() => {
    const initApp = async () => {
      await loadCache();
      await restoreSession();
      setInitLoading(false);
    };
    initApp();
  }, []);

  // 2. Control WebSocket subscription based on login
  useEffect(() => {
    if (isAuthenticated) {
      wsClient.connect();
    } else {
      wsClient.disconnect();
    }
    return () => {
      wsClient.disconnect();
    };
  }, [isAuthenticated]);

  // 3. Monitor active connectivity status
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const res = await fetch('http://localhost:3000/live', { method: 'GET' });
        if (res.ok) {
          setOnlineStatus(true);
        } else {
          setOnlineStatus(false);
        }
      } catch (err) {
        setOnlineStatus(false);
      }
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 15000);
    return () => clearInterval(interval);
  }, [isOnline]);

  if (initLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
