import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useCartStore from '../store/cart.store';
import OrderItemRow from './OrderItemRow';
import { formatCurrencyINR } from '@rms/utils';
import Button from './ui/Button';

interface CartSheetProps {
  onSendKOT: () => void;
  onHold: () => void;
  isLoading?: boolean;
}

export const CartSheet: React.FC<CartSheetProps> = ({
  onSendKOT,
  onHold,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, clearCart, tableName, updateQuantity, removeItem, customerName, guestsCount } = useCartStore();

  const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Bottom Summary Bar */}
      <TouchableOpacity 
        onPress={() => setIsOpen(true)}
        activeOpacity={0.9} 
        style={styles.summaryBar}
      >
        <View>
          <Text style={styles.summaryTitle}>
            {tableName ? `Table: ${tableName}` : 'Walk-in Order'} · {items.length} items
          </Text>
          <Text style={styles.summaryTotal}>Total: {formatCurrencyINR(totalAmount)}</Text>
        </View>
        <Text style={styles.expandLabel}>View Cart ▴</Text>
      </TouchableOpacity>

      {/* Cart Modal Drawer */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.dismissOverlay} 
            onPress={() => setIsOpen(false)} 
          />
          <View style={styles.sheetContent}>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Order Cart</Text>
                {customerName ? <Text style={styles.subHeader}>Cust: {customerName} ({guestsCount} pax)</Text> : null}
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeBtn}>Close ▾</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.itemsList}>
              {items.map((item) => (
                <OrderItemRow
                  key={item.itemId}
                  item={item}
                  onRemove={() => removeItem(item.itemId)}
                  onUpdateQty={(qty) => updateQuantity(item.itemId, qty)}
                />
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>{formatCurrencyINR(totalAmount)}</Text>
              </View>

              <View style={styles.buttonRow}>
                <Button
                  label="Hold Order"
                  variant="outline"
                  onPress={() => {
                    onHold();
                    setIsOpen(false);
                  }}
                  disabled={isLoading}
                  style={styles.flexBtn}
                />
                <Button
                  label="Send KOT"
                  onPress={() => {
                    onSendKOT();
                    setIsOpen(false);
                  }}
                  isLoading={isLoading}
                  style={[styles.flexBtn, { marginLeft: 12 }]}
                />
              </View>
              
              <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Cancel & Clear Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  summaryBar: {
    padding: layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  summaryTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.foreground,
  },
  summaryTotal: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  expandLabel: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  sheetContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: layout.radius.lg,
    borderTopRightRadius: layout.radius.lg,
    maxHeight: '80%',
    padding: layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
  },
  subHeader: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
  },
  closeBtn: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    fontWeight: '700',
  },
  itemsList: {
    maxHeight: 280,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.foreground,
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: typography.fontFamilyDisplay,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  flexBtn: {
    flex: 1,
  },
  clearBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  clearBtnText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: typography.sizes.sm,
  },
});

export default CartSheet;
