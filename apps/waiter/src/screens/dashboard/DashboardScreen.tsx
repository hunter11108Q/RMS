import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { tableApi } from '../../api/table.api';
import { orderApi } from '../../api/order.api';

type NavProp = StackNavigationProp<AppStackParamList>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user, selectedBranch, logout } = useAuthStore();
  const [stats, setStats] = useState({
    activeTables: 0,
    activeOrders: 0,
    readyKots: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!selectedBranch) return;
      try {
        const [tablesRes, ordersRes] = await Promise.all([
          tableApi.listTables(selectedBranch.id),
          orderApi.listOrders(selectedBranch.id),
        ]);

        if (tablesRes.success && tablesRes.data && ordersRes.success && ordersRes.data) {
          const occupiedCount = tablesRes.data.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING_REQUESTED').length;
          const openOrdersCount = ordersRes.data.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
          
          // Let's list active KOTs to check for READY status
          const kotsRes = await orderApi.listKOTs(selectedBranch.id);
          const readyKotsCount = kotsRes.success && kotsRes.data 
            ? kotsRes.data.filter((k) => k.status === 'READY').length 
            : 0;

          setStats({
            activeTables: occupiedCount,
            activeOrders: openOrdersCount,
            readyKots: readyKotsCount,
          });
        }
      } catch (err) {
        console.warn('Error loading dashboard stats:', err);
      }
    };

    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [selectedBranch]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Banner */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste, {user?.username}</Text>
            <Text style={styles.branchSub}>{selectedBranch?.name || 'Loading Branch...'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Live status indicators */}
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiEmoji}>🪑</Text>
            <Text style={styles.kpiVal}>{stats.activeTables}</Text>
            <Text style={styles.kpiTitle}>Active Tables</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <Text style={styles.kpiEmoji}>📋</Text>
            <Text style={styles.kpiVal}>{stats.activeOrders}</Text>
            <Text style={styles.kpiTitle}>Active Orders</Text>
          </Card>
        </View>

        {stats.readyKots > 0 ? (
          <TouchableOpacity 
            onPress={() => navigation.navigate('HomeTabs', { screen: 'Orders' } as any)}
            style={styles.alertBanner}
          >
            <Badge label="Ready to Serve" variant="success" />
            <Text style={styles.alertText}>{stats.readyKots} KOT orders waiting in kitchen.</Text>
          </TouchableOpacity>
        ) : null}

        {/* Quick Actions grid */}
        <Text style={styles.sectionTitle}>Quick Operations</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('NewOrder', {})}
            style={styles.actionBtn}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionLabel}>New Order</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('HomeTabs', { screen: 'Tables' } as any)}
            style={styles.actionBtn}
          >
            <Text style={styles.actionIcon}>🪑</Text>
            <Text style={styles.actionLabel}>Floor Layout</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('HomeTabs', { screen: 'Orders' } as any)}
            style={styles.actionBtn}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>Active Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('HomeTabs', { screen: 'Reservations' } as any)}
            style={styles.actionBtn}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionLabel}>Bookings</Text>
          </TouchableOpacity>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.spacing.lg,
  },
  greeting: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
  },
  branchSub: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: layout.radius.sm,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: typography.sizes.sm,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: layout.spacing.md,
  },
  kpiCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 18,
  },
  kpiEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  kpiVal: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
  },
  kpiTitle: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  alertBanner: {
    backgroundColor: 'rgba(22,163,74,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.2)',
    borderRadius: layout.radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: layout.spacing.lg,
  },
  alertText: {
    marginLeft: 8,
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  actionBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius.md,
    paddingVertical: 20,
    width: '48%',
    alignItems: 'center',
    margin: '1%',
    elevation: 1,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.foreground,
  },
});

export default DashboardScreen;
