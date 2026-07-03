import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import { OrderItem } from '@rms/types';
import { formatCurrencyINR } from '@rms/utils';

interface OrderItemRowProps {
  item: OrderItem;
  onRemove?: () => void;
  onUpdateQty?: (qty: number) => void;
}

export const OrderItemRow: React.FC<OrderItemRowProps> = ({
  item,
  onRemove,
  onUpdateQty,
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.itemInfo}>
        <Text style={styles.name}>{item.name}</Text>
        {item.notes ? <Text style={styles.notes}>Note: {item.notes}</Text> : null}
        {item.modifiers && item.modifiers.length > 0 ? (
          <Text style={styles.modifiers}>
            + {item.modifiers.map((m) => `${m.name} (${formatCurrencyINR(m.price)})`).join(', ')}
          </Text>
        ) : null}
      </View>

      <View style={styles.actionContainer}>
        {onUpdateQty ? (
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              onPress={() => onUpdateQty(item.quantity - 1)}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => onUpdateQty(item.quantity + 1)}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.qtyTextStatic}>x{item.quantity}</Text>
        )}

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {formatCurrencyINR((item.unitPrice || 0) * item.quantity)}
          </Text>
          {onRemove ? (
            <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
              <Text style={styles.removeText}>🗑️</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1.2,
    marginRight: 8,
  },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.foreground,
  },
  notes: {
    fontSize: typography.sizes.xs,
    color: colors.warning,
    marginTop: 3,
    fontWeight: '500',
  },
  modifiers: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius.sm,
    backgroundColor: '#F1F5F9',
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  qtyText: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    paddingHorizontal: 8,
    color: colors.foreground,
  },
  qtyTextStatic: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.muted,
    marginRight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 90,
  },
  price: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.foreground,
  },
  removeButton: {
    marginLeft: 8,
    padding: 6,
  },
  removeText: {
    fontSize: 16,
  },
});

export default OrderItemRow;
