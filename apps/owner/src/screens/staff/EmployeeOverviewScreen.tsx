import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatCurrencyINR } from '@rms/utils';

export const EmployeeOverviewScreen: React.FC = () => {
  const { selectedBranch } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState<any>(null);

  useEffect(() => {
    // Mock fetch for cashier activity and active shift status
    const loadStaff = () => {
      setStaffData({
        shiftActive: true,
        openingTime: '09:30 AM',
        waitersActive: 4,
        cashierSales: 18450,
        employees: [
          { name: 'Amit Singh', role: 'CASHIER', status: 'ACTIVE', sales: 18450 },
          { name: 'Rahul Sharma', role: 'WAITER', status: 'ACTIVE', orders: 12 },
          { name: 'Sanjay Kumar', role: 'CHEF', status: 'ON_BREAK' },
          { name: 'Vikram Seth', role: 'WAITER', status: 'ACTIVE', orders: 8 },
        ],
      });
      setLoading(false);
    };
    loadStaff();
  }, [selectedBranch]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Active shift details */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Current Shift Status</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCol}>
              <Text style={styles.kpiLabel}>Shift status</Text>
              <Badge label={staffData.shiftActive ? 'OPEN' : 'CLOSED'} variant="success" />
            </View>
            <View style={styles.kpiCol}>
              <Text style={styles.kpiLabel}>Opened At</Text>
              <Text style={styles.kpiVal}>{staffData.openingTime}</Text>
            </View>
            <View style={styles.kpiCol}>
              <Text style={styles.kpiLabel}>Cashier Sales</Text>
              <Text style={[styles.kpiVal, { color: colors.primary }]}>
                {formatCurrencyINR(staffData.cashierSales)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Staff roster grid */}
        <Card style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Active Employees ({staffData.employees.length})</Text>
          {staffData.employees.map((emp: any, i: number) => (
            <View key={i} style={styles.empRow}>
              <View>
                <Text style={styles.empName}>{emp.name}</Text>
                <Text style={styles.empRole}>{emp.role} · {emp.sales ? `Sales: ${formatCurrencyINR(emp.sales)}` : emp.orders ? `${emp.orders} orders` : 'Kitchen'}</Text>
              </View>
              <Badge 
                label={emp.status} 
                variant={emp.status === 'ACTIVE' ? 'success' : 'warning'} 
              />
            </View>
          ))}
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
    marginBottom: 6,
  },
  kpiVal: {
    fontSize: typography.sizes.base,
    fontWeight: '800',
    color: colors.foreground,
  },
  empRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  empName: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontWeight: '600',
  },
  empRole: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
});

export default EmployeeOverviewScreen;
