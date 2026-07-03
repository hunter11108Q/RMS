import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import { ownerApi } from '../../api/owner.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatCurrencyINR } from '@rms/utils';

export const CustomerOverviewScreen: React.FC = () => {
  const { selectedBranch } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null);

  const fetchCustomerReport = async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getCustomerAnalytics({
        branchId: selectedBranch?.id || undefined,
      });
      if (res.success && res.data) {
        setCustomerData(res.data);
      } else {
        loadMockCustomers();
      }
    } catch {
      loadMockCustomers();
    } finally {
      setLoading(false);
    }
  };

  const loadMockCustomers = () => {
    setCustomerData({
      newCount: 42,
      returningCount: 156,
      topSpenders: [
        { name: 'Rohan Gupta', visits: 18, spent: 24500 },
        { name: 'Karan Malhotra', visits: 14, spent: 18200 },
        { name: 'Ananya Sharma', visits: 12, spent: 15400 },
      ],
      creditCustomers: [
        { name: 'Vijay Chawla', debt: 4500 },
        { name: 'Siddharth Roy', debt: 3200 },
      ],
    });
  };

  useEffect(() => {
    fetchCustomerReport();
  }, [selectedBranch]);

  if (loading && !customerData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Retention breakdown */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Visits breakdown</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCol}>
              <Text style={styles.kpiLabel}>New customers</Text>
              <Text style={styles.kpiVal}>{customerData?.newCount || 0}</Text>
            </View>
            <View style={styles.kpiCol}>
              <Text style={styles.kpiLabel}>Returning</Text>
              <Text style={[styles.kpiVal, { color: colors.primary }]}>
                {customerData?.returningCount || 0}
              </Text>
            </View>
          </View>
        </Card>

        {/* Top Spenders */}
        <Card style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Top Spending Customers</Text>
          {customerData?.topSpenders?.map((cust: any, i: number) => (
            <View key={i} style={styles.custRow}>
              <View>
                <Text style={styles.custName}>{cust.name}</Text>
                <Text style={styles.custVisits}>{cust.visits} visits total</Text>
              </View>
              <Text style={styles.spentAmount}>{formatCurrencyINR(cust.spent)}</Text>
            </View>
          ))}
        </Card>

        {/* Credit customers */}
        <Card style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Pending Credits Ledger</Text>
          {customerData?.creditCustomers?.length > 0 ? (
            customerData.creditCustomers.map((cust: any, i: number) => (
              <View key={i} style={styles.custRow}>
                <View>
                  <Text style={styles.custName}>{cust.name}</Text>
                  <Text style={styles.creditWarn}>⚠️ Balance Outstanding</Text>
                </View>
                <Text style={[styles.spentAmount, { color: colors.error }]}>
                  {formatCurrencyINR(cust.debt)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No pending customer credit claims.</Text>
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
  kpiCol: {
    flex: 1,
    alignItems: 'center',
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
  custRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  custName: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontWeight: '600',
  },
  custVisits: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  creditWarn: {
    fontSize: 10,
    color: colors.error,
    fontWeight: '700',
    marginTop: 2,
  },
  spentAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.foreground,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default CustomerOverviewScreen;
