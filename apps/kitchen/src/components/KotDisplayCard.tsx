import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface KotItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  status?: string;
}

interface KotDisplayCardProps {
  kot: {
    id: string;
    kotNumber: string;
    orderId: string;
    status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'REJECTED';
    priority: string;
    createdAt: string;
    tableName?: string;
    waiterName?: string;
    guestsCount?: number;
    items: KotItem[];
  };
  onUpdateStatus: (kotId: string, status: string) => void;
}

export const KotDisplayCard: React.FC<KotDisplayCardProps> = ({ kot, onUpdateStatus }) => {
  const [elapsed, setElapsed] = useState('');
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const created = new Date(kot.createdAt).getTime();
      const now = Date.now();
      const diffSec = Math.floor((now - created) / 1000);
      
      const mm = String(Math.floor(diffSec / 60)).padStart(2, '0');
      const ss = String(diffSec % 60).padStart(2, '0');
      setElapsed(`${mm}:${ss}`);
      
      // Mark as delayed if elapsed time exceeds 15 minutes
      setIsDelayed(diffSec > 900);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [kot.createdAt]);

  const getPriorityColor = () => {
    switch (kot.priority) {
      case 'URGENT':
      case 'VIP':
        return colors.error;
      case 'HIGH':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getStatusBadge = () => {
    switch (kot.status) {
      case 'NEW':
        return <Badge label="New" variant="info" />;
      case 'ACCEPTED':
        return <Badge label="Accepted" variant="default" />;
      case 'PREPARING':
        return <Badge label="Preparing" variant="warning" />;
      case 'READY':
        return <Badge label="Ready" variant="success" />;
      default:
        return <Badge label={kot.status} variant="default" />;
    }
  };

  return (
    <Card style={[styles.card, isDelayed ? styles.delayedCard : null]}>
      {/* Header Info */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.kotNumber, { color: getPriorityColor() }]}>
            KOT #{kot.kotNumber}
          </Text>
          <Text style={styles.tableText}>
            Table: {kot.tableName || 'Walk-in'} {kot.guestsCount ? `(${kot.guestsCount} pax)` : ''}
          </Text>
        </View>
        <View style={styles.rightHeader}>
          <Text style={[styles.timer, isDelayed ? styles.delayedTimer : null]}>
            ⏱️ {elapsed}
          </Text>
          {getStatusBadge()}
        </View>
      </View>

      {/* Meta */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Waiter: {kot.waiterName || 'POS'}</Text>
        <Text style={styles.metaText}>Priority: {kot.priority}</Text>
      </View>

      {/* Items list */}
      <View style={styles.itemsBlock}>
        {kot.items.map((item, index) => (
          <View key={item.id || index} style={styles.itemRow}>
            <View style={styles.itemMain}>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            {item.notes ? (
              <Text style={styles.itemNotes}>⚠️ {item.notes}</Text>
            ) : null}
          </View>
        ))}
      </View>

      {/* Bottom Action buttons */}
      <View style={styles.actions}>
        {kot.status === 'NEW' ? (
          <Button
            label="Accept Order"
            onPress={() => onUpdateStatus(kot.id, 'ACCEPTED')}
            style={styles.actionBtn}
          />
        ) : kot.status === 'ACCEPTED' ? (
          <Button
            label="Start Preparing"
            variant="secondary"
            onPress={() => onUpdateStatus(kot.id, 'PREPARING')}
            style={styles.actionBtn}
          />
        ) : kot.status === 'PREPARING' ? (
          <Button
            label="Mark Ready"
            variant="secondary"
            onPress={() => onUpdateStatus(kot.id, 'READY')}
            style={styles.actionBtn}
          />
        ) : kot.status === 'READY' ? (
          <Button
            label="Serve / Complete"
            onPress={() => onUpdateStatus(kot.id, 'SERVED')}
            style={styles.actionBtn}
          />
        ) : (
          <Text style={styles.doneText}>COMPLETED</Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    width: '47%',
    minWidth: 320,
    minHeight: 280,
    justifyContent: 'space-between',
    borderColor: colors.border,
  },
  delayedCard: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
    marginBottom: 8,
  },
  rightHeader: {
    alignItems: 'flex-end',
  },
  kotNumber: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
  },
  tableText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontWeight: '600',
    marginTop: 2,
  },
  timer: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 4,
  },
  delayedTimer: {
    color: colors.error,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    fontWeight: '600',
  },
  itemsBlock: {
    flex: 1,
    marginBottom: 16,
  },
  itemRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.6)',
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQty: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 8,
  },
  itemName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.foreground,
  },
  itemNotes: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    fontWeight: '600',
    marginTop: 3,
    paddingLeft: 24,
  },
  actions: {
    marginTop: 8,
  },
  actionBtn: {
    width: '100%',
  },
  doneText: {
    textAlign: 'center',
    color: colors.success,
    fontWeight: '700',
    fontSize: typography.sizes.sm,
  },
});

export default KotDisplayCard;
