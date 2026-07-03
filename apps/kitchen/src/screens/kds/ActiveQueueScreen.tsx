import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import useKdsStore from '../../store/kds.store';
import useOfflineStore from '../../store/offline.store';
import { kdsApi } from '../../api/kds.api';
import KotDisplayCard from '../../components/KotDisplayCard';
import EmptyState from '../../components/ui/EmptyState';
import * as Haptics from 'expo-haptics';

export const ActiveQueueScreen: React.FC = () => {
  const { selectedBranch } = useAuthStore();
  const { kots, setKots, tables, setTables, selectedStation, soundEnabled } = useKdsStore();
  const { isOnline, enqueueMutation } = useOfflineStore();
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!selectedBranch) return;
    try {
      const [kotsRes, tablesRes] = await Promise.all([
        kdsApi.listKOTs(selectedBranch.id),
        kdsApi.listTables(selectedBranch.id),
      ]);

      if (kotsRes.success && kotsRes.data) {
        // Sound alert if new KOT arrives
        if (soundEnabled && kots.length > 0 && kotsRes.data.length > kots.length) {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {
            // Ignore
          }
        }
        setKots(kotsRes.data);
      }

      if (tablesRes.success && tablesRes.data) {
        setTables(tablesRes.data);
      }
    } catch (err) {
      console.warn('KDS queue fetch failure:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // refresh KOTs every 8s
    return () => clearInterval(interval);
  }, [selectedBranch, kots.length]);

  const handleUpdateStatus = async (kotId: string, nextStatus: string) => {
    try {
      if (isOnline) {
        const res = await kdsApi.updateKOTStatus(kotId, nextStatus);
        if (res.success) {
          // Update locally immediately
          useKdsStore.getState().updateKotLocalStatus(kotId, nextStatus);
        }
      } else {
        // Enqueue offline action
        await enqueueMutation('UPDATE_KOT_STATUS', `/orders/kots/${kotId}/status`, 'PATCH', {
          status: nextStatus,
        });
        useKdsStore.getState().updateKotLocalStatus(kotId, nextStatus);
        Alert.alert('Offline Cache', 'KOT status update cached locally. Will sync when online.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status');
    }
  };

  // ─── Kitchen Station Routing logic ─────────────────────────────────────────
  const isItemMatchingStation = (itemName: string) => {
    if (selectedStation === 'ALL') return true;

    const lower = itemName.toLowerCase();
    const isDrink = lower.includes('juice') || lower.includes('drink') || lower.includes('wine') || 
                    lower.includes('beer') || lower.includes('cola') || lower.includes('soda') || 
                    lower.includes('tea') || lower.includes('coffee') || lower.includes('beverage') || 
                    lower.includes('mocktail');
    const isDessert = lower.includes('ice cream') || lower.includes('brownie') || lower.includes('kulfi') || 
                      lower.includes('dessert') || lower.includes('halwa') || lower.includes('jamun');
    const isTandoor = lower.includes('naan') || lower.includes('roti') || lower.includes('kulcha') || 
                      lower.includes('tandoori') || lower.includes('kebab') || lower.includes('tikka');
    const isChinese = lower.includes('noodles') || lower.includes('manchurian') || lower.includes('rice') || 
                      lower.includes('momo') || lower.includes('soup') || lower.includes('spring');
    const isBakery = lower.includes('bread') || lower.includes('loaf') || lower.includes('bun') || 
                     lower.includes('cake') || lower.includes('pastry');

    if (selectedStation === 'BAR') return isDrink;
    if (selectedStation === 'DESSERT') return isDessert;
    if (selectedStation === 'TANDOOR') return isTandoor;
    if (selectedStation === 'CHINESE') return isChinese;
    if (selectedStation === 'BAKERY') return isBakery;
    
    // MAIN_KITCHEN (Curries, standard dishes) matches anything else
    if (selectedStation === 'MAIN_KITCHEN') {
      return !isDrink && !isDessert && !isTandoor && !isChinese && !isBakery;
    }
    
    return true;
  };

  // Filter KOTs and KOT items
  const activeKots = kots
    .filter((k) => k.status !== 'SERVED' && k.status !== 'REJECTED')
    .map((kot) => {
      // Find table name mapping
      const tableObj = tables.find((t) => t.id === kot.tableId);
      const tableName = tableObj ? tableObj.name : undefined;

      // Filter item list to only match selected station categories
      const filteredItems = kot.items.filter((item: any) => isItemMatchingStation(item.name));

      return {
        ...kot,
        tableName,
        items: filteredItems,
      };
    })
    .filter((k) => k.items.length > 0); // Hide KOT card if no items match station filter

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activeKots.length === 0 ? (
        <EmptyState title="No Active Orders" description="Awaiting new dispatches from waitstaff terminals." />
      ) : (
        <FlatList
          data={activeKots}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <KotDisplayCard
              kot={item}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 8,
  },
});

export default ActiveQueueScreen;
