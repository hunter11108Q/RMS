import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import { ownerApi } from '../../api/owner.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatCurrencyINR } from '@rms/utils';

export const InventoryOverviewScreen: React.FC = () => {
  const { selectedBranch } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getInventorySummary({
        branchId: selectedBranch?.id || undefined,
      });
      if (res.success && res.data) {
        setSummary(res.data);
      } else {
        loadMockInventory();
      }
    } catch {
      loadMockInventory();
    } finally {
      setLoading(false);
    }
  };

  const loadMockInventory = () => {
    setSummary({
      totalValue: 84500,
      foodCostPct: 32.4,
      wastageAmt: 1420,
      lowStockItems: [
        { name: 'Paneer Cheese', stock: '4.2 kg', reorder: '10 kg' },
        { name: 'Cooking Oil', stock: '8.0 L', reorder: '20 L' },
        { name: 'Onions', stock: '12.0 kg', reorder: '25 kg' },
        { name: 'Basmati Rice', stock: '15.0 kg', reorder: '30 kg' },
      ],
      outOfStock: [
        { name: 'Garlic Paste', sku: 'ING-091' },
        { name: 'Mint Leaves', sku: 'ING-102' },
      ],
    });
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedBranch]);

  if (loading && !summary) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cost Analysis card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Inventory valuation</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiLabel}>Stock Value</Text>
              <Text style={styles.kpiVal}>{formatCurrencyINR(summary?.totalValue || 0)}</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiLabel}>Food Cost %</Text>
              <Text style={[styles.kpiVal, { color: colors.warning }]}>
                {summary?.foodCostPct || 0}%
              </Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiLabel}>Wastage (Today)</Text>
              <Text style={[styles.kpiVal, { color: colors.error }]}>
                {formatCurrencyINR(summary?.wastageAmt || 0)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Low Stock checklist */}
        <Card style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>⚠️ Low Stock Warnings ({summary?.lowStockItems?.length || 0})</Text>
          {summary?.lowStockItems?.map((item: any, i: number) => (
            <View key={i} style={styles.listItem}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>Reorder level: {item.reorder}</Text>
              </View>
              <Badge label={`Stock: ${item.stock}`} variant="warning" />
            </View>
          ))}
        </Card>

        {/* Out of Stock */}
        <Card style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>🚫 Critical: Out of Stock</Text>
          {summary?.outOfStock?.length > 0 ? (
            summary.outOfStock.map((item: any, i: number) => (
              <View key={i} style={styles.listItem}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>SKU: {item.sku}</Text>
                </View>
                <Badge label="Zero Stock" variant="danger" />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>All ingredients are currently in stock!</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: layout.spacing.md,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 640,
    padding: 16,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  kpiItem: {
    alignItems: 'center',
    flex: 1,
  },
  kpiLabel: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiVal: {
    fontSize: typography.sizes.base,
    fontWeight: '800',
    color: colors.foreground,
    marginTop: 6,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default InventoryOverviewScreen;
