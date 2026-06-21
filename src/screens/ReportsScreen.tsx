// ============================================
//  src/screens/ReportsScreen.tsx
// ============================================

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/theme/ThemeContext';
import { useToast } from '@/hooks/useToast';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { StatsGrid } from '@/components/StatsGrid';
import { fmt, fmtCurrency } from '@/utils/format';
import { t } from '@/locales/i18n';
import { spacing, fontSize, radius } from '@/theme/metrics';
import { buildPeriodReport, buildCsvReport, PeriodReport } from '@/services/reportsService';
import { calcFlockBreakdown } from '@/services/analyticsService';
import type { ReportPeriod, FlockBreakdown } from '@/types';

const PERIODS: { key: ReportPeriod; label: string }[] = [
  { key: 'weekly', label: t.reports.periods.weekly },
  { key: 'monthly', label: t.reports.periods.monthly },
  { key: 'yearly', label: t.reports.periods.yearly },
  { key: 'all', label: t.reports.periods.all },
];

const CATEGORY_ICONS: Record<string, string> = {
  'علف': '🌾', 'شعير': '🌾', 'تبن': '🌿', 'دواء': '💊', 'طبيب بيطري': '🩺',
  'نقل': '🚛', 'أجور': '👷', 'ماء': '💧', 'كهرباء': '⚡', 'وقود': '⛽', 'مصاريف أخرى': '📋',
};

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [report, setReport] = useState<PeriodReport | null>(null);
  const [flock, setFlock] = useState<FlockBreakdown | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (p: ReportPeriod) => {
    const [rep, fl] = await Promise.all([buildPeriodReport(p), calcFlockBreakdown()]);
    setReport(rep);
    setFlock(fl);
  }, []);

  useFocusEffect(useCallback(() => { loadData(period); }, [period, loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(period);
    setRefreshing(false);
  };

  const handleExportCsv = async () => {
    if (!report) return;
    try {
      const csv = buildCsvReport(report);
      const fileName = `تقرير-قطيع-${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'تصدير التقرير' });
      }
      showToast('تم تصدير التقرير بنجاح 📊');
    } catch {
      showToast(t.common.error, 'error');
    }
  };

  const handlePrint = async () => {
    if (!report) return;
    try {
      const html = buildReportHtml(report, flock, period);
      await Print.printAsync({ html });
    } catch {
      showToast(t.common.error, 'error');
    }
  };

  if (!report) return <ScreenContainer><View /></ScreenContainer>;

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <ScreenHeader
        title={`📈 ${t.reports.title}`}
        subtitle={t.reports.subtitle}
        actions={
          <>
            <AppButton label={t.reports.print} icon="🖨️" variant="secondary" onPress={handlePrint} />
            <AppButton label={t.reports.exportExcel} icon="📊" onPress={handleExportCsv} />
          </>
        }
      />

      {/* تبويبات الفترة */}
      <View style={[styles.tabs, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[styles.tab, period === p.key && { backgroundColor: colors.bgCard }]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.tabText, { color: period === p.key ? colors.green700 : colors.textMuted }, period === p.key && { fontWeight: '700' }]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* الملخص المالي */}
      <Card title={`📊 ${t.reports.financialSummary}`} style={styles.section}>
        <StatsGrid>
          <StatCard icon="💰" label="المبيعات" value={fmtCurrency(report.periodSales)} color="green" />
          <StatCard icon="💸" label="المصاريف" value={fmtCurrency(report.periodExpenses)} color="red" />
          <StatCard
            icon={report.periodProfit >= 0 ? '📈' : '📉'}
            label={report.periodProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
            value={fmtCurrency(Math.abs(report.periodProfit))}
            color={report.periodProfit >= 0 ? 'green' : 'red'}
          />
          <StatCard icon="🛒" label="مشتريات" value={fmtCurrency(report.periodPurchases)} color="amber" />
        </StatsGrid>
      </Card>

      {/* إحصاءات القطيع */}
      <Card title={`🐑 ${t.reports.flockStats}`} style={styles.section}>
        <StatsGrid>
          <StatCard icon="🐑" label="القطيع الكلي" value={fmt(flock?.total)} sub={t.common.head} color="green" />
          <StatCard icon="🐣" label="المواليد" value={fmt(report.periodBirths)} sub="خلال الفترة" color="blue" />
          <StatCard icon="💔" label="النافقة" value={fmt(report.periodMortality)} sub="خلال الفترة" color="red" />
        </StatsGrid>
      </Card>

      {/* المصاريف حسب التصنيف */}
      {report.categoryBreakdown.length > 0 ? (
        <Card title={`📋 ${t.reports.expensesByCategory}`} style={styles.section}>
          {report.categoryBreakdown.map(c => (
            <View key={c.category} style={[styles.catRow, { borderBottomColor: colors.border }]}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {CATEGORY_ICONS[c.category] ?? '📋'} {c.category}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.red600, fontWeight: '700' }}>{fmtCurrency(c.amount)}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{c.percent.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      {/* توزيع الأرباح على الشركاء */}
      {report.partners.length > 0 ? (
        <Card title={`🤝 ${t.reports.profitDistribution}`} style={styles.section}>
          {report.partners.map(p => (
            <View key={p.id} style={[styles.partnerRow, { borderBottomColor: colors.border }]}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', flex: 1 }} numberOfLines={1}>{p.name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginHorizontal: 8 }}>{p.sharePercent.toFixed(1)}%</Text>
              <Text style={{ color: p.profitDue >= 0 ? colors.green600 : colors.red600, fontWeight: '700' }}>
                {fmtCurrency(p.profitDue)}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

function buildReportHtml(report: PeriodReport, flock: FlockBreakdown | null, period: ReportPeriod): string {
  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? '';
  return `
    <html dir="rtl">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
        h1 { color: #1e4d2f; font-size: 20px; }
        h2 { color: #2d6a4f; font-size: 16px; margin-top: 20px; border-bottom: 2px solid #d8f3dc; padding-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #d4e6da; padding: 6px 10px; text-align: right; font-size: 13px; }
        th { background: #f0faf4; color: #2d6a4f; }
      </style>
    </head>
    <body>
      <h1>🐑 تقرير مشروع تربية الأغنام — ${periodLabel}</h1>
      <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-DZ')}</p>

      <h2>الملخص المالي</h2>
      <table>
        <tr><th>البند</th><th>القيمة</th></tr>
        <tr><td>إجمالي المبيعات</td><td>${report.periodSales} دج</td></tr>
        <tr><td>إجمالي المصاريف</td><td>${report.periodExpenses} دج</td></tr>
        <tr><td>صافي الربح</td><td>${report.periodProfit} دج</td></tr>
      </table>

      <h2>إحصاءات القطيع</h2>
      <table>
        <tr><th>النعاج</th><th>الكباش</th><th>الحملان</th><th>الإجمالي</th></tr>
        <tr><td>${flock?.ewes ?? 0}</td><td>${flock?.rams ?? 0}</td><td>${flock?.lambs ?? 0}</td><td>${flock?.total ?? 0}</td></tr>
      </table>

      <h2>توزيع الأرباح على الشركاء</h2>
      <table>
        <tr><th>الشريك</th><th>رأس المال</th><th>النسبة</th><th>الأرباح المستحقة</th></tr>
        ${report.partners.map(p => `<tr><td>${p.name}</td><td>${p.capital} دج</td><td>${p.sharePercent.toFixed(1)}%</td><td>${p.profitDue.toFixed(0)} دج</td></tr>`).join('')}
      </table>
    </body>
    </html>
  `;
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row-reverse', borderRadius: radius.lg, borderWidth: 1, padding: 4, marginBottom: spacing.lg },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.md, alignItems: 'center' },
  tabText: { fontSize: fontSize.sm },
  section: { marginBottom: spacing.lg },
  catRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  partnerRow: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
});
