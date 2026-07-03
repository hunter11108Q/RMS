import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import { useRoute, useNavigation, useIsFocused, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import { orderApi } from '../../api/order.api';
import { tableApi } from '../../api/table.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import OrderItemRow from '../../components/OrderItemRow';
import KotStatusBadge from '../../components/KotStatusBadge';
import { formatCurrencyINR } from '@rms/utils';

type RoutePropType = RouteProp<AppStackParamList, 'OrderDetail'>;
type NavPropType = StackNavigationProp<AppStackParamList>;

export const OrderDetailScreen: React.FC = () => {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavPropType>();
  const isFocused = useIsFocused();
  const { orderId } = route.params;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrder(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.warn('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchOrderDetails();
    }
  }, [orderId, isFocused]);

  const handleRequestBill = async () => {
    if (!order?.tableId) return;
    setBtnLoading(true);
    try {
      const res = await tableApi.updateStatus(order.tableId, 'BILLING_REQUESTED');
      if (res.success) {
        Alert.alert('Success', 'Bill requested successfully.');
        fetchOrderDetails();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to request bill');
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const billRequested = order?.status === 'COMPLETED' || order?.table?.status === 'BILLING_REQUESTED';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Order info summary */}
      <Card style={styles.infoCard}>
        <View style={styles.row}>
          <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
          <Badge 
            label={order.status} 
            variant={
              order.status === 'KITCHEN' ? 'warning' :
              order.status === 'SERVED' ? 'success' :
              order.status === 'DRAFT' ? 'default' : 'info'
            } 
          />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Type: {order.type.replace('_', ' ')}</Text>
          <Text style={styles.metaText}>Guests: {order.guestsCount} pax</Text>
        </View>
      </Card>

      {/* Ordered items */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Ordered Items</Text>
        {order.items?.map((item: any) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{formatCurrencyINR(order.totalAmount)}</Text>
        </View>
      </Card>

      {/* KOT Tickets timeline */}
      {order.kots && order.kots.length > 0 ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Kitchen Tickets (KOT)</Text>
          {order.kots.map((kot: any, index: number) => (
            <View key={kot.id} style={styles.kotRow}>
              <View style={styles.row}>
                <Text style={styles.kotNumber}>KOT #{kot.kotNumber}</Text>
                <KotStatusBadge status={kot.status} />
              </View>
              <View style={styles.kotItems}>
                {kot.items?.map((item: any, i: number) => (
                  <Text key={i} style={styles.kotItemText}>
                    • {item.name} x {item.quantity}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      {/* Actions */}
      <View style={styles.actionBlock}>
        {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' ? (
          <>
            <Button
              label="Add / Modify Items"
              onPress={() => {
                navigation.navigate('NewOrder', { tableId: order.tableId, orderId: order.id });
              }}
              style={styles.actionBtn}
            />
            {order.tableId && !billRequested ? (
              <Button
                label="Request Final Bill"
                variant="secondary"
                onPress={handleRequestBill}
                isLoading={btnLoading}
                style={[styles.actionBtn, { marginTop: 12 }]}
              />
            ) : null}
          </>
        ) : null}
      </View>
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
  infoCard: {
    marginBottom: layout.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    fontWeight: '500',
  },
  card: {
    marginBottom: layout.spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.foreground,
  },
  totalValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: typography.fontFamilyDisplay,
  },
  kotRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  kotNumber: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.foreground,
  },
  kotItems: {
    marginTop: 6,
    paddingLeft: 6,
  },
  kotItemText: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  actionBlock: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionBtn: {
    width: '100%',
  },
});

export default OrderDetailScreen;
