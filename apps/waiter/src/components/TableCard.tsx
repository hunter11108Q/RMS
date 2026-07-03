import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import { RestaurantTableInfo } from '@rms/types';
import * as Haptics from 'expo-haptics';

interface TableCardProps {
  table: RestaurantTableInfo;
  onPress: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onPress }) => {
  const getStatusStyles = () => {
    switch (table.status) {
      case 'AVAILABLE':
        return {
          bg: '#F0FDF4',
          border: 'rgba(22,163,74,0.3)',
          indicator: '#16A34A',
          textColor: '#16A34A',
        };
      case 'OCCUPIED':
        return {
          bg: '#FEF2F2',
          border: 'rgba(220,38,38,0.3)',
          indicator: '#DC2626',
          textColor: '#DC2626',
        };
      case 'RESERVED':
        return {
          bg: '#FFF7ED',
          border: 'rgba(217,119,6,0.3)',
          indicator: '#D97706',
          textColor: '#D97706',
        };
      case 'BILLING_REQUESTED':
        return {
          bg: '#EFF6FF',
          border: 'rgba(2,132,199,0.3)',
          indicator: '#0284C7',
          textColor: '#0284C7',
        };
      default:
        return {
          bg: '#F8FAFC',
          border: colors.border,
          indicator: colors.muted,
          textColor: colors.muted,
        };
    }
  };

  const statusStyles = getStatusStyles();

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.card,
        { backgroundColor: statusStyles.bg, borderColor: statusStyles.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: statusStyles.textColor }]}>
          {table.name}
        </Text>
        <View style={[styles.dot, { backgroundColor: statusStyles.indicator }]} />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.subtitle}>Max: {table.capacity} pax</Text>
        <Text style={[styles.statusText, { color: statusStyles.textColor }]}>
          {table.status.replace('_', ' ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: layout.radius.md,
    padding: 14,
    margin: 6,
    flex: 1,
    minWidth: 100,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    fontFamily: typography.fontFamilyDisplay,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    marginTop: 12,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    fontWeight: '500',
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
  },
});

export default TableCard;
