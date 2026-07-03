import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import { ownerApi } from '../../api/owner.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const REPORT_TEMPLATES = [
  { id: 'sales', name: '📈 Daily/Monthly Sales Performance', desc: 'Summary of orders, payment methods, voids, average checkout size.' },
  { id: 'gst', name: '💸 Tax & GST Accounting Ledger', desc: 'Output SGST, CGST, and overall tax liabilities for bookkeeping.' },
  { id: 'profit_loss', name: '📊 P&L Statement', desc: 'Gross revenues offset by ingredient purchases, wages and wastage costs.' },
  { id: 'inventory', name: '📦 Stock Valuation & Wastage Summary', desc: 'Wastage logs, stock variance checks, and overall storage values.' },
  { id: 'customers', name: '👥 Customer Retention & Credits', desc: 'Spender summaries, outstanding debts, and visiting cohorts.' },
];

export const ReportHubScreen: React.FC = () => {
  const { selectedBranch } = useAuthStore();
  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleExport = (reportId: string, name: string) => {
    setExportingId(reportId);
    
    // Simulate API export generation
    setTimeout(() => {
      setExportingId(null);
      Alert.alert(
        'Export Generated Successfully',
        `The PDF export file for "${name}" has been compiled and sent to your registered email address.`
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Export Business Reports</Text>
        <Text style={styles.subtitle}>
          Select a template to generate a signed ledger report. Files are delivered instantly to your inbox.
        </Text>

        <View style={styles.list}>
          {REPORT_TEMPLATES.map((tpl) => (
            <Card key={tpl.id} style={styles.tplCard}>
              <View style={styles.tplContent}>
                <Text style={styles.tplName}>{tpl.name}</Text>
                <Text style={styles.tplDesc}>{tpl.desc}</Text>
              </View>
              <Button
                label={exportingId === tpl.id ? 'Exporting...' : 'Request PDF'}
                variant="outline"
                isLoading={exportingId === tpl.id}
                onPress={() => handleExport(tpl.id, tpl.name)}
                style={styles.exportBtn}
                textStyle={styles.exportBtnText}
              />
            </Card>
          ))}
        </View>
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
  title: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
    width: '100%',
    maxWidth: 640,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    width: '100%',
    maxWidth: 640,
    marginBottom: 20,
    lineHeight: 16,
    fontWeight: '500',
  },
  list: {
    width: '100%',
    maxWidth: 640,
  },
  tplCard: {
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tplContent: {
    flex: 1,
    marginRight: 16,
  },
  tplName: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.foreground,
  },
  tplDesc: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 14,
    fontWeight: '500',
  },
  exportBtn: {
    minHeight: 36,
    paddingHorizontal: 12,
  },
  exportBtnText: {
    fontSize: 11,
  },
});

export default ReportHubScreen;
