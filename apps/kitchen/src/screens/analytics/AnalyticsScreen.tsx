import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useKdsStore from '../../store/kds.store';
import Card from '../../components/ui/Card';

export const AnalyticsScreen: React.FC = () => {
  const { kots } = useKdsStore();

  const completedCount = kots.filter((k) => k.status === 'SERVED').length;
  const preparingCount = kots.filter((k) => k.status === 'PREPARING').length;
  const activeCount = kots.filter((k) => k.status !== 'SERVED' && k.status !== 'REJECTED').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Metric Summary Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Shift Cooking Analytics</Text>
          
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Dispatched KOTs</Text>
              <Text style={styles.metricVal}>{kots.length}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Completed (Served)</Text>
              <Text style={styles.metricVal}>{completedCount}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Pending Prep</Text>
              <Text style={styles.metricVal}>{activeCount}</Text>
            </View>
          </View>
        </Card>

        {/* Busy Hours Analytics */}
        <Card style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Peak Hours Distribution</Text>
          <Text style={styles.subtitle}>Historical loads hourly analysis</Text>

          <View style={styles.barsBlock}>
            {[
              { time: '12:00 - 13:00', load: 35 },
              { time: '13:00 - 14:00', load: 85 },
              { time: '14:00 - 15:00', load: 60 },
              { time: '19:00 - 20:00', load: 45 },
              { time: '20:00 - 21:00', load: 95 },
              { time: '21:00 - 22:00', load: 75 },
            ].map((bar, i) => (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barLabel}>{bar.time}</Text>
                <View style={styles.barWrapper}>
                  <View style={[styles.barValue, { width: `${bar.load}%` }]} />
                </View>
                <Text style={styles.barText}>{bar.load}%</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Station Performance breakdown */}
        <Card style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Station Prep Timings</Text>
          <View style={styles.statList}>
            {[
              { station: 'Main Curry Kitchen', time: '11 mins', compliance: '96%' },
              { station: 'Tandoor Grill Station', time: '14 mins', compliance: '92%' },
              { station: 'Bakery & Bread Counter', time: '6 mins', compliance: '98%' },
              { station: 'Dessert & Juices', time: '5 mins', compliance: '99%' },
              { station: 'Cocktail Bar Counter', time: '4 mins', compliance: '99%' },
            ].map((s, idx) => (
              <View key={idx} style={styles.statRow}>
                <Text style={styles.statName}>{s.station}</Text>
                <Text style={styles.statVal}>Avg: {s.time} ({s.compliance} SLA)</Text>
              </View>
            ))}
          </View>
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
  card: {
    width: '100%',
    maxWidth: 640,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.foreground,
    marginTop: 6,
  },
  barsBlock: {
    marginTop: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  barLabel: {
    fontSize: typography.sizes.xs,
    color: colors.foreground,
    width: 100,
    fontWeight: '600',
  },
  barWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  barValue: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  barText: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    width: 40,
    textAlign: 'right',
    fontWeight: '700',
  },
  statList: {
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statName: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontWeight: '600',
  },
  statVal: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    fontWeight: '600',
  },
});

export default AnalyticsScreen;
