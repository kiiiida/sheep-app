// ============================================
//  src/screens/BackupScreen.tsx
// ============================================

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { useToast } from '@/hooks/useToast';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppButton } from '@/components/AppButton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { StatsGrid } from '@/components/StatsGrid';
import { fmt } from '@/utils/format';
import { t } from '@/locales/i18n';
import { spacing, fontSize, radius } from '@/theme/metrics';
import { exportBackupToFile, pickBackupFile, restoreFromBackup, estimateDatabaseSizeKB } from '@/services/backupService';
import { clearAllData } from '@/services/database';
import { getAllPartners } from '@/services/partnersService';
import { getAllPurchases } from '@/services/purchasesService';
import { getAllSales } from '@/services/salesService';
import { getAllExpenses } from '@/services/expensesService';
import { getAllBirths } from '@/services/birthsService';

export default function BackupScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [sizeKB, setSizeKB] = useState(0);
  const [counts, setCounts] = useState({ partners: 0, purchases: 0, sales: 0, expenses: 0, births: 0 });
  const [confirmRestore, setConfirmRestore] = useState<(() => void) | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const loadStats = useCallback(async () => {
    const [size, partners, purchases, sales, expenses, births] = await Promise.all([
      estimateDatabaseSizeKB(),
      getAllPartners(),
      getAllPurchases(),
      getAllSales(),
      getAllExpenses(),
      getAllBirths(),
    ]);
    setSizeKB(size);
    setCounts({
      partners: partners.length,
      purchases: purchases.length,
      sales: sales.length,
      expenses: expenses.length,
      births: births.length,
    });
  }, []);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportBackupToFile();
      showToast('تم تنزيل النسخة الاحتياطية 💾');
    } catch {
      showToast(t.common.error, 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const data = await pickBackupFile();
      if (!data) { setImporting(false); return; }

      setConfirmRestore(() => async () => {
        await restoreFromBackup(data);
        showToast('تم استيراد النسخة الاحتياطية بنجاح ✅');
        await loadStats();
      });
    } catch (e: any) {
      showToast(e?.message ?? 'فشل قراءة الملف', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleClearData = async () => {
    await clearAllData();
    showToast('تم مسح جميع البيانات', 'warning');
    setConfirmClear(false);
    await loadStats();
  };

  return (
    <ScreenContainer>
      <ScreenHeader title={`💾 ${t.backup.title}`} subtitle={t.backup.subtitle} />

      <View style={styles.grid}>
        {/* تصدير */}
        <Card title={`📥 ${t.backup.exportTitle}`} style={styles.cardItem}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>💾</Text>
            <Text style={[styles.desc, { color: colors.textMuted }]}>{t.backup.exportDesc}</Text>
            <AppButton label={t.backup.exportBtn} icon="⬇️" size="lg" onPress={handleExport} loading={exporting} fullWidth style={{ marginTop: 16 }} />
          </View>
        </Card>

        {/* استرجاع */}
        <Card title={`📤 ${t.backup.importTitle}`} style={styles.cardItem}>
          <TouchableOpacity
            style={[styles.dropZone, { borderColor: colors.border }]}
            onPress={handleImport}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📂</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: fontSize.sm }}>{t.backup.importZoneLabel}</Text>
          </TouchableOpacity>
          <Text style={[styles.warningText, { color: colors.textMuted }]}>⚠️ {t.backup.importWarning}</Text>
        </Card>
      </View>

      {/* منطقة الخطر */}
      <Card title={`⚠️ ${t.backup.dangerZone}`} style={styles.section}>
        <View style={[styles.alertBox, { backgroundColor: colors.red100, borderColor: colors.red600 }]}>
          <Text style={{ color: colors.red600, fontSize: fontSize.sm }}>⚠️ {t.backup.dangerWarning}</Text>
        </View>
        <AppButton label={t.backup.clearDataBtn} icon="🗑️" variant="danger" onPress={() => setConfirmClear(true)} />
      </Card>

      {/* إحصائيات التخزين */}
      <Card title={`📊 ${t.backup.storageStats}`} style={styles.section}>
        <StatsGrid>
          <StatCard icon="📦" label={t.backup.dataSize} value={`${sizeKB} KB`} color="blue" />
          <StatCard icon="🤝" label="شركاء" value={fmt(counts.partners)} color="green" />
          <StatCard icon="🛒" label="مشتريات" value={fmt(counts.purchases)} sub="عملية" color="amber" />
          <StatCard icon="💰" label="مبيعات" value={fmt(counts.sales)} sub="عملية" color="gold" />
          <StatCard icon="💸" label="مصاريف" value={fmt(counts.expenses)} sub="قيد" color="red" />
          <StatCard icon="🐣" label="مواليد" value={fmt(counts.births)} sub="سجل" color="blue" />
        </StatsGrid>
      </Card>

      <ConfirmDialog
        isVisible={confirmRestore != null}
        message={t.backup.restoreConfirm}
        confirmLabel="استرجاع"
        onConfirm={() => { confirmRestore?.(); setConfirmRestore(null); }}
        onCancel={() => setConfirmRestore(null)}
      />

      <ConfirmDialog
        isVisible={confirmClear}
        message={t.backup.clearConfirm}
        onConfirm={handleClearData}
        onCancel={() => setConfirmClear(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.lg, marginBottom: spacing.lg },
  cardItem: {},
  desc: { fontSize: fontSize.sm, textAlign: 'center' },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    paddingVertical: 28,
    alignItems: 'center',
  },
  warningText: { fontSize: fontSize.xs, textAlign: 'center', marginTop: 10 },
  section: { marginBottom: spacing.lg },
  alertBox: { borderWidth: 1, borderRadius: radius.md, padding: 12, marginBottom: 12 },
});
