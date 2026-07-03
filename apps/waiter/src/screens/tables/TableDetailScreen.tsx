import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import { useRoute, useNavigation, useIsFocused, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import useAuthStore from '../../store/auth.store';
import useCartStore from '../../store/cart.store';
import { tableApi } from '../../api/table.api';
import { orderApi } from '../../api/order.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import OrderItemRow from '../../components/OrderItemRow';

type RoutePropType = RouteProp<AppStackParamList, 'TableDetail'>;
type NavPropType = StackNavigationProp<AppStackParamList>;

export const TableDetailScreen: React.FC = () => {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavPropType>();
  const isFocused = useIsFocused();
  const { tableId, tableName } = route.params;
  const { selectedBranch } = useAuthStore();
  const { loadOrder, clearCart } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState<any>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchTableDetails = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    try {
      // 1. Fetch tables list to get this specific table status
      const tablesRes = await tableApi.listTables(selectedBranch.id);
      if (tablesRes.success && tablesRes.data) {
        const t = tablesRes.data.find((x) => x.id === tableId);
        setTable(t);

        // 2. Fetch active orders to find if there is an open order on this table
        if (t && (t.status === 'OCCUPIED' || t.status === 'BILLING_REQUESTED')) {
          const ordersRes = await orderApi.listOrders(selectedBranch.id);
          if (ordersRes.success && ordersRes.data) {
            const order = ordersRes.data.find(
              (o) => o.tableId === tableId && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
            );
            if (order) {
              // Get full order details with items
              const detailRes = await orderApi.getOrder(order.id);
              if (detailRes.success && detailRes.data) {
                setActiveOrder(detailRes.data);
              }
            }
          }
        } else {
          setActiveOrder(null);
        }
      }
    } catch (err) {
      console.warn('Error fetching table details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchTableDetails();
    }
  }, [tableId, isFocused, selectedBranch]);

  const handleRequestBill = async () => {
    if (!activeOrder) return;
    setBtnLoading(true);
    try {
      const res = await tableApi.updateStatus(tableId, 'BILLING_REQUESTED');
      if (res.success) {
        Alert.alert('Success', 'Bill requested. Cashier terminal has been alerted.');
        fetchTableDetails();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to request bill');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleClearTable = async () => {
    setBtnLoading(true);
    try {
      const res = await tableApi.updateStatus(tableId, 'AVAILABLE');
      if (res.success) {
        Alert.alert('Success', 'Table status marked as Available.');
        fetchTableDetails();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to clear table');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleEditOrder = () => {
    if (!activeOrder) return;
    clearCart();
    loadOrder(activeOrder);
    navigation.navigate('NewOrder', { tableId, tableName, orderId: activeOrder.id });
  };

  const handleCreateOrder = () => {
    clearCart();
    navigation.navigate('NewOrder', { tableId, tableName });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isOccupied = table?.status === 'OCCUPIED' || table?.status === 'BILLING_REQUESTED';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.statusCard}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Table Status</Text>
          <Badge 
            label={table?.status.replace('_', ' ') || 'UNKNOWN'} 
            variant={
              table?.status === 'AVAILABLE' ? 'success' : 
              table?.status === 'RESERVED' ? 'warning' : 
              table?.status === 'OCCUPIED' ? 'danger' : 'info'
            } 
          />
        </View>
        <Text style={styles.subtitle}>Capacity: {table?.capacity} guests maximum</Text>
      </Card>

      {isOccupied && activeOrder ? (
        <View style={styles.orderContainer}>
          <Card style={styles.orderCard}>
            <View style={styles.row}>
              <Text style={styles.orderTitle}>Active Order</Text>
              <Text style={styles.orderId}>#{activeOrder.id.slice(-6).toUpperCase()}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>Customer: {activeOrder.customerName || 'Walk-in'}</Text>
              <Text style={styles.detailText}>Guests: {activeOrder.guestsCount || 1} pax</Text>
            </View>

            <View style={styles.itemsList}>
              <Text style={styles.itemsTitle}>Items Ordered</Text>
              {activeOrder.items?.map((item: any) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </View>
          </Card>

          <View style={styles.actionBlock}>
            <Button
              label="Add / Edit Items"
              onPress={handleEditOrder}
              style={styles.mainBtn}
            />
            {table.status !== 'BILLING_REQUESTED' ? (
              <Button
                label="Request Bill / Invoice"
                variant="secondary"
                onPress={handleRequestBill}
                isLoading={btnLoading}
                style={[styles.mainBtn, { marginTop: 12 }]}
              />
            ) : null}
            <Button
              label="Clear Table (Mark Available)"
              variant="outline"
              onPress={handleClearTable}
              isLoading={btnLoading}
              style={[styles.mainBtn, { marginTop: 12 }]}
            />
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active order session on this table.</Text>
          <Button
            label="Open New Order"
            onPress={handleCreateOrder}
            style={styles.createBtn}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: layout.spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    marginBottom: layout.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: 6,
  },
  orderContainer: {
    marginTop: 8,
  },
  orderCard: {
    marginBottom: layout.spacing.lg,
  },
  orderTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.foreground,
  },
  orderId: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  detailText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
  itemsList: {
    marginTop: 12,
  },
  itemsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 6,
  },
  actionBlock: {
    marginTop: 8,
  },
  mainBtn: {
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.muted,
    marginBottom: 20,
    fontWeight: '500',
  },
  createBtn: {
    paddingHorizontal: 32,
  },
});

export default TableDetailScreen;
