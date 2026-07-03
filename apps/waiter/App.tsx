import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './src/store/auth.store';
import useOfflineStore from './src/store/offline.store';
import RootNavigator from './src/navigation/RootNavigator';
import offlineQueueProcessor from './src/services/offlineQueue';
import wsClient from './src/services/wsClient';
import { colors } from '@rms/theme';

const queryClient = new QueryClient();

export default function App() {
  const { restoreSession, isAuthenticated } = useAuthStore();
  const { loadQueue, isOnline, setOnlineStatus } = useOfflineStore();
  const [initLoading, setInitLoading] = useState(true);

  // 1. Initialise local databases, offline queue and restore active tokens
  useEffect(() => {
    const initApp = async () => {
      await loadQueue();
      await restoreSession();
      setInitLoading(false);
    };
    initApp();
  }, []);

  // 2. Manage WebSocket connection based on authentication
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

  // 3. Simple network polling to verify connectivity status & trigger sync
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        // Ping liveness health check endpoint
        const res = await fetch('http://localhost:3000/live', { method: 'GET' });
        if (res.ok) {
          if (!isOnline) {
            setOnlineStatus(true);
            // Trigger automatic synchronization of offline queue
            offlineQueueProcessor.sync();
          }
        } else {
          setOnlineStatus(false);
        }
      } catch (err) {
        setOnlineStatus(false);
      }
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 15000); // Check every 15s
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
