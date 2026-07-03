import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import { MenuItem } from '@rms/types';
import { formatCurrencyINR } from '@rms/utils';
import * as Haptics from 'expo-haptics';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAdd }) => {
  const handlePress = () => {
    if (!item.isAvailable) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored
    }
    onAdd();
  };

  return (
    <View style={[styles.card, !item.isAvailable && styles.disabledCard]}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{formatCurrencyINR(item.price)}</Text>
      </View>
      <TouchableOpacity
        onPress={handlePress}
        disabled={!item.isAvailable}
        activeOpacity={0.8}
        style={[styles.addButton, !item.isAvailable && styles.disabledAddButton]}
      >
        <Text style={styles.addButtonText}>{item.isAvailable ? '+' : 'OUT'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  disabledCard: {
    opacity: 0.55,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.foreground,
  },
  price: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledAddButton: {
    backgroundColor: colors.muted,
  },
  addButtonText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default MenuItemCard;
