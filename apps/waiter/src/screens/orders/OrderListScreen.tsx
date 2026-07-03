import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { orderApi } from '../../api/order.api';
import { formatCurrencyINR } from '@rms/utils';

type NavProp = StackNavigationProp<AppStackParamList>;

export const OrderListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const isFocused = useIsFocused();
  const { selectedBranch } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const fetchOrders = async () => {
    if (!selectedBranch) return;
    try {
      const res = await orderApi.listOrders(selectedBranch.id);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.warn('Error fetching orders queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchOrders();
    }
  }, [selectedBranch, isFocused]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase()));
    const matchesType = selectedType === 'ALL' || o.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <View style={styles.container}>
      {/* Search and filters */}
      <View style={styles.header}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by Order ID / Customer"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
        <View style={styles.filterTabs}>
          {['ALL', 'DINE_IN', 'TAKEAWAY', 'DELIVERY'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type)}
              style={[
                styles.filterTab,
                selectedType === type ? styles.activeFilterTab : null,
              ]}
            >
              <Text style={[
                styles.filterTabText,
                selectedType === type ? styles.activeFilterTabText : null,
              ]}>
                {type.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredOrders.length === 0 ? (
        <EmptyState title="No Active Orders" description="Create a new order for a table or customer to get started." />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              activeOpacity={0.8}
              style={styles.orderItem}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                <Badge 
                  label={item.status} 
                  variant={
                    item.status === 'KITCHEN' ? 'warning' :
                    item.status === 'SERVED' ? 'success' :
                    item.status === 'DRAFT' ? 'default' : 'info'
                  } 
                />
              </View>

              <View style={styles.orderFooter}>
                <View>
                  <Text style={styles.orderMeta}>Type: {item.type.replace('_', ' ')}</Text>
                  <Text style={styles.orderMeta}>Cust: {item.customerName || 'Walk-in'}</Text>
                </View>
                <Text style={styles.orderPrice}>{formatCurrencyINR(item.totalAmount)}</Text>
              </View>
            </TouchableOpacity>
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
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: layout.spacing.md,
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: layout.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabs: {
    flexDirection: 'row',
    marginTop: 10,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: layout.radius.sm,
    marginRight: 6,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  activeFilterTabText: {
    color: colors.card,
  },
  listContent: {
    padding: layout.spacing.md,
  },
  orderItem: {
    backgroundColor: colors.card,
    borderRadius: layout.radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  orderId: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  orderMeta: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  orderPrice: {
    fontSize: typography.sizes.base,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: typography.fontFamilyDisplay,
  },
});

export default OrderListScreen;
