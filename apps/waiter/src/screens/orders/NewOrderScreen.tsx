import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import useAuthStore from '../../store/auth.store';
import useCartStore from '../../store/cart.store';
import useOfflineStore from '../../store/offline.store';
import offlineQueueProcessor from '../../services/offlineQueue';
import { menuApi } from '../../api/menu.api';
import { orderApi } from '../../api/order.api';
import MenuItemCard from '../../components/MenuItemCard';
import CartSheet from '../../components/CartSheet';
import EmptyState from '../../components/ui/EmptyState';

type RoutePropType = RouteProp<AppStackParamList, 'NewOrder'>;
type NavPropType = StackNavigationProp<AppStackParamList>;

export const NewOrderScreen: React.FC = () => {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavPropType>();
  const { tableId, tableName, orderId } = route.params;

  const { selectedBranch } = useAuthStore();
  const { items, clearCart, setTable, setOrderId, notes } = useCartStore();
  const { isOnline, enqueueMutation } = useOfflineStore();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchMenuData = async () => {
    if (!selectedBranch) return;
    try {
      const [catRes, itemRes] = await Promise.all([
        menuApi.listCategories(),
        menuApi.listItems(selectedBranch.id),
      ]);
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (itemRes.success && itemRes.data) {
        setMenuItems(itemRes.data);
      }
    } catch (err) {
      console.warn('Error loading menu catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTable(tableId || null, tableName || null);
    setOrderId(orderId || null);
    fetchMenuData();
  }, [selectedBranch]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCatId === 'ALL' || item.categoryId === selectedCatId;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSendKOT = async () => {
    if (items.length === 0 || !selectedBranch) return;
    setBtnLoading(true);
    try {
      if (isOnline) {
        let activeOrderId = orderId;

        // 1. Create order if it is new
        if (!activeOrderId) {
          const orderRes = await orderApi.createOrder({
            branchId: selectedBranch.id,
            tableId: tableId || undefined,
            type: tableId ? 'DINE_IN' : 'TAKEAWAY',
            guestsCount: 1,
          });
          if (orderRes.success && orderRes.data) {
            activeOrderId = orderRes.data.id;
          }
        }

        if (activeOrderId) {
          // 2. Add items to order
          for (const item of items) {
            await orderApi.addOrderItem(activeOrderId, {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              notes: item.notes,
            });
          }

          // 3. Dispatch to kitchen (Generate KOT)
          await orderApi.generateKOT(activeOrderId, selectedBranch.id);
          Alert.alert('Success', 'KOT generated and sent to kitchen display.');
        }
      } else {
        // Enqueue offline mutations
        const clientOrderId = `offline-${Date.now()}`;
        await enqueueMutation('CREATE_ORDER', '/orders', 'POST', {
          branchId: selectedBranch.id,
          tableId: tableId || undefined,
          type: tableId ? 'DINE_IN' : 'TAKEAWAY',
          guestsCount: 1,
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, notes: i.notes })),
        });
        Alert.alert('Offline Mode', 'Order saved locally. Will sync when connection is restored.');
      }
      clearCart();
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to dispatch order');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleHoldOrder = async () => {
    if (items.length === 0 || !selectedBranch) return;
    setBtnLoading(true);
    try {
      if (isOnline) {
        let activeOrderId = orderId;
        if (!activeOrderId) {
          const orderRes = await orderApi.createOrder({
            branchId: selectedBranch.id,
            tableId: tableId || undefined,
            type: tableId ? 'DINE_IN' : 'TAKEAWAY',
            guestsCount: 1,
          });
          if (orderRes.success && orderRes.data) {
            activeOrderId = orderRes.data.id;
          }
        }
        if (activeOrderId) {
          for (const item of items) {
            await orderApi.addOrderItem(activeOrderId, {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              notes: item.notes,
            });
          }
          await orderApi.holdOrder(activeOrderId);
          Alert.alert('Success', 'Order draft put on HOLD status.');
        }
      } else {
        await enqueueMutation('CREATE_ORDER', '/orders', 'POST', {
          branchId: selectedBranch.id,
          tableId: tableId || undefined,
          type: tableId ? 'DINE_IN' : 'TAKEAWAY',
          guestsCount: 1,
          status: 'DRAFT',
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, notes: i.notes })),
        });
        Alert.alert('Offline Mode', 'Order draft saved locally.');
      }
      clearCart();
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to hold order');
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header filter & search bar */}
      <View style={styles.header}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name / item SKU code..."
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
        
        {/* Category horizontal scrolling bar */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'ALL', name: 'All Categories' }, ...categories]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCatId(item.id)}
              style={[
                styles.categoryTab,
                selectedCatId === item.id ? styles.activeCategoryTab : null,
              ]}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCatId === item.id ? styles.activeCategoryTabText : null,
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.categoriesList}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredItems.length === 0 ? (
        <EmptyState title="No Items Match" description="Try a different query or select another menu category." />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MenuItemCard
              item={{
                id: item.id,
                categoryId: item.categoryId,
                name: item.name,
                price: item.dineInPrice, // map price field
                isAvailable: item.isActive, // map isAvailable
                taxRate: 5,
              }}
              onAdd={() => useCartStore.getState().addItem({
                id: `cart-${Date.now()}-${Math.random()}`,
                itemId: `item-${item.id}`,
                menuItemId: item.id,
                name: item.name,
                quantity: 1,
                unitPrice: item.dineInPrice,
                notes: '',
              })}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Cart bottom sheet drawer trigger */}
      <CartSheet
        onSendKOT={handleSendKOT}
        onHold={handleHoldOrder}
        isLoading={btnLoading}
      />
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
  categoriesList: {
    marginTop: 12,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: layout.radius.sm,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeCategoryTab: {
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.muted,
  },
  activeCategoryTabText: {
    color: colors.card,
  },
  listContent: {
    padding: layout.spacing.md,
    paddingBottom: 90, // space for CartSheet bottom summary bar
  },
});

export default NewOrderScreen;
