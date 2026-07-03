import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useOwnerStore from '../store/owner.store';

export const AlertBanner: React.FC = () => {
  const { alerts, ackAlert } = useOwnerStore();

  const activeAlerts = alerts.filter((al) => !al.acknowledged);
  if (activeAlerts.length === 0) return null;

  const currentAlert = activeAlerts[0];

  const getSeverityStyles = () => {
    switch (currentAlert.severity) {
      case 'CRITICAL':
        return { bg: '#FEF2F2', border: 'rgba(220,38,38,0.3)', text: colors.error };
      case 'WARNING':
        return { bg: '#FFF7ED', border: 'rgba(217,119,6,0.3)', text: colors.warning };
      default:
        return { bg: '#EFF6FF', border: 'rgba(2,132,199,0.3)', text: colors.primary };
    }
  };

  const styleSet = getSeverityStyles();

  return (
    <View style={[styles.banner, { backgroundColor: styleSet.bg, borderColor: styleSet.border }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: styleSet.text }]}>
          ⚠️ {currentAlert.title}
        </Text>
        <Text style={styles.desc}>{currentAlert.description}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => ackAlert(currentAlert.id)}
        style={styles.ackBtn}
      >
        <Text style={[styles.ackText, { color: styleSet.text }]}>ACK</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    margin: layout.spacing.md,
    borderWidth: 1,
    borderRadius: layout.radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  desc: {
    fontSize: typography.sizes.xs,
    color: colors.foreground,
    marginTop: 4,
    fontWeight: '500',
  },
  ackBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: layout.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  ackText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default AlertBanner;
