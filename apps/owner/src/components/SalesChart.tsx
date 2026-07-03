import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import { formatCurrencyINR } from '@rms/utils';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface SalesChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, height = 200 }) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.chartWrapper, { height }]}>
        {/* Y Axis Grid lines */}
        <View style={StyleSheet.absoluteFill}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <View 
              key={i} 
              style={[
                styles.gridLine, 
                { bottom: `${ratio * 100}%` }
              ]} 
            />
          ))}
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barHeightPercent = (item.value / maxValue) * 100;
            return (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barValText}>
                  {item.value > 1000 ? `₹${(item.value / 1000).toFixed(1)}k` : `₹${item.value}`}
                </Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barValue, { height: `${barHeightPercent}%` }]} />
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  chartWrapper: {
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    zIndex: 2,
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  barTrack: {
    width: 22,
    height: '70%',
    backgroundColor: '#F1F5F9',
    borderRadius: layout.radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barValue: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: layout.radius.sm,
  },
  barLabel: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '600',
    marginTop: 6,
  },
});

export default SalesChart;
