import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import { menuApi } from '../../api/menu.api';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrencyINR } from '@rms/utils';

export const MenuBrowseScreen: React.FC = () => {
  const { selectedBranch } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [search, setSearch] = useState('');

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
    fetchMenuData();
  }, [selectedBranch]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCatId === 'ALL' || item.categoryId === selectedCatId;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search items by name / SKU code..."
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
        
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
            <View style={styles.itemRow}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSku}>SKU: {item.sku}</Text>
              </View>
              <View style={styles.rightBlock}>
                <Text style={styles.itemPrice}>{formatCurrencyINR(item.dineInPrice)}</Text>
                <Text style={[
                  styles.availText, 
                  { color: item.isActive ? colors.success : colors.error }
                ]}>
                  {item.isActive ? 'AVAILABLE' : 'OUT OF STOCK'}
                </Text>
              </View>
            </View>
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
  },
  itemRow: {
    backgroundColor: colors.card,
    borderRadius: layout.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.foreground,
  },
  itemSku: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  rightBlock: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
  },
  availText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
});

export default MenuBrowseScreen;
