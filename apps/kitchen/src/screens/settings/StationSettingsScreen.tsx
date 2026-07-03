import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useKdsStore from '../../store/kds.store';
import useAuthStore from '../../store/auth.store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Mock list of stations. Station mappings check categories internally.
const STATIONS = [
  { id: 'ALL', name: '🍳 Unified Station (All KOTs)' },
  { id: 'MAIN_KITCHEN', name: '🥘 Main Kitchen (Curry & Rice)' },
  { id: 'CHINESE', name: '🍜 Chinese Kitchen Station' },
  { id: 'TANDOOR', name: '🍢 Tandoor Clay-Oven Station' },
  { id: 'BAKERY', name: '🍞 Bread & Bakery Counter' },
  { id: 'DESSERT', name: '🍧 Ice Cream & Dessert Station' },
  { id: 'BAR', name: '🍷 Wine & Cocktail Bar Counter' },
  { id: 'JUICE', name: '🍹 Fresh Juice & Coffee Counter' },
];

export const StationSettingsScreen: React.FC = () => {
  const { selectedStation, setStation, soundEnabled, toggleSound } = useKdsStore();
  const { user, logout } = useAuthStore();
  const [activeId, setActiveId] = useState(selectedStation);

  useEffect(() => {
    setActiveId(selectedStation);
  }, [selectedStation]);

  const handleSave = async () => {
    await setStation(activeId);
    Alert.alert('Settings Saved', 'Kitchen station configuration updated successfully.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Detail */}
        <Card style={styles.profileCard}>
          <Text style={styles.sectionTitle}>Terminal Context</Text>
          <Text style={styles.profileText}>Operator: {user?.username || 'KDS Operator'}</Text>
          <Text style={styles.profileText}>Role Permission: KITCHEN_STAFF</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Lock Terminal / Sign Out</Text>
          </TouchableOpacity>
        </Card>

        {/* Station Select */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Select Kitchen Station filter</Text>
          <Text style={styles.subtitle}>
            This terminal will only display order items matching the category assignments of this station.
          </Text>

          <View style={styles.stationList}>
            {STATIONS.map((station) => (
              <TouchableOpacity
                key={station.id}
                onPress={() => setActiveId(station.id)}
                activeOpacity={0.8}
                style={[
                  styles.stationItem,
                  activeId === station.id ? styles.activeStationItem : null,
                ]}
              >
                <Text style={[
                  styles.stationName,
                  activeId === station.id ? styles.activeStationName : null,
                ]}>
                  {station.name}
                </Text>
                <View style={[
                  styles.radio,
                  activeId === station.id ? styles.activeRadio : null,
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Sound Alerts settings */}
          <TouchableOpacity 
            onPress={toggleSound} 
            activeOpacity={0.8} 
            style={styles.toggleRow}
          >
            <View style={styles.toggleLabelBlock}>
              <Text style={styles.toggleLabel}>🔊 Sound Notification Alerts</Text>
              <Text style={styles.toggleSub}>Trigger chime notification for incoming KOT dispatches</Text>
            </View>
            <View style={[styles.switch, soundEnabled ? styles.switchOn : null]}>
              <View style={[styles.switchKnob, soundEnabled ? styles.switchKnobOn : null]} />
            </View>
          </TouchableOpacity>

          <Button
            label="Save Configurations"
            onPress={handleSave}
            style={styles.saveBtn}
          />
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
  profileCard: {
    width: '100%',
    maxWidth: 640,
    marginBottom: layout.spacing.md,
  },
  settingsCard: {
    width: '100%',
    maxWidth: 640,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
    marginBottom: 8,
  },
  profileText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: 4,
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: 'rgba(220,38,38,0.1)',
    borderRadius: layout.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  logoutBtnText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: typography.sizes.sm,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginBottom: 16,
  },
  stationList: {
    marginBottom: 20,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  activeStationItem: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(2,132,199,0.05)',
  },
  stationName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.foreground,
  },
  activeStationName: {
    color: colors.primary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  activeRadio: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginBottom: 24,
  },
  toggleLabelBlock: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.foreground,
  },
  toggleSub: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 2,
  },
  switch: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: colors.primary,
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    transform: [{ translateX: 0 }],
  },
  switchKnobOn: {
    transform: [{ translateX: 22 }],
  },
  saveBtn: {
    width: '100%',
  },
});

export default StationSettingsScreen;
