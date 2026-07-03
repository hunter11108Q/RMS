import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import { reservationApi } from '../../api/reservation.api';
import { tableApi } from '../../api/table.api';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export const ReservationListScreen: React.FC = () => {
  const { selectedBranch } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [btnLoading, setBtnLoading] = useState<string | null>(null);

  const fetchReservations = async () => {
    if (!selectedBranch) return;
    try {
      const res = await reservationApi.listReservations(selectedBranch.id);
      if (res.success && res.data) {
        setReservations(res.data);
      }
    } catch (err) {
      console.warn('Error loading reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [selectedBranch]);

  const handleSeatCustomer = async (resId: string, tableId?: string) => {
    if (!tableId) {
      Alert.alert('No Table Assigned', 'Please assign a table in the desktop POS before check-in.');
      return;
    }
    setBtnLoading(resId);
    try {
      // Mark table as occupied
      const tableRes = await tableApi.updateStatus(tableId, 'OCCUPIED');
      if (tableRes.success) {
        Alert.alert('Success', 'Customer checked-in and table marked as Occupied.');
        fetchReservations();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to check-in customer');
    } finally {
      setBtnLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : reservations.length === 0 ? (
        <EmptyState title="No Reservations Today" description="All table bookings will show up here." />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.resRow}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.custName}>{item.customerName}</Text>
                  <Text style={styles.custPhone}>{item.customerPhone}</Text>
                </View>
                <Badge 
                  label={item.status} 
                  variant={
                    item.status === 'CONFIRMED' ? 'success' :
                    item.status === 'PENDING' ? 'warning' : 'default'
                  } 
                />
              </View>
              
              <View style={styles.metaBlock}>
                <Text style={styles.metaText}>📅 Date: {item.reservationDate}</Text>
                <Text style={styles.metaText}>⏰ Time: {item.startTime}</Text>
                <Text style={styles.metaText}>👥 Guests: {item.guestsCount} pax</Text>
                {item.table ? (
                  <Text style={styles.metaText}>🪑 Table: {item.table.name}</Text>
                ) : (
                  <Text style={[styles.metaText, { color: colors.error }]}>🪑 Table: Unassigned</Text>
                )}
              </View>

              {item.status === 'CONFIRMED' ? (
                <Button
                  label="Seat Customer"
                  onPress={() => handleSeatCustomer(item.id, item.tableId)}
                  isLoading={btnLoading === item.id}
                  style={styles.seatBtn}
                />
              ) : null}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: layout.spacing.md,
  },
  resRow: {
    backgroundColor: colors.card,
    borderRadius: layout.radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  custName: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
  },
  custPhone: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  metaBlock: {
    marginTop: 4,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    marginTop: 4,
    fontWeight: '500',
  },
  seatBtn: {
    marginTop: 12,
    width: '100%',
  },
});

export default ReservationListScreen;
