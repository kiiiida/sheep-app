// ============================================
//  src/screens/DashboardScreen.tsx
// ============================================

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatCard } from '@/components/StatCard';
import { StatsGrid } from '@/components/StatsGrid';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { fmt, fmtCurrency, fmtDate } from '@/utils/format';
import { t } from '@/locales/i18n';
import { spacing, fontSize, radius } from '@/theme/metrics';
import {
  calcFinancials, calcFlockBreakdown, getLastMonthsChartData,
  getRecentTransactions, MonthlyChartPoint, RecentTransaction,
} from '@/services/analyticsService';
import type { Financials, FlockBreakdown } from '@/types';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [financials, setFinancials] = useState<Financials | null>(null);
  const [flock, setFlock] = useState<FlockBreakdown | null>(null);
  const [chartData, setChartData] = useState<MonthlyChartPoint[]>([]);
  const [recent, setRecent] = useState<RecentTransaction[]>([]);

  const loadData = useCallback(async () => {
    const [fin, fl, chart, tx] = await Promise.all([
      calcFinancials(),
      calcFlockBreakdown(),
      getLastMonthsChartData(6),
      getRecentTransactions(10),
    ]);
    setFinancials(fin);
    setFlock(fl);
    setChartData(chart);
    setRecent(tx);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const isProfit = (financials?.netProfit ?? 0) >= 0;
  const maxChartVal = Math.max(1, ...chartData.map(m => Math.max(m.income, m.expense)));
  const barAreaHeight = 140;
  const barWidth = Math.max(10, Math.min(16, (width - 80) / (chartData.length * 3)));

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <ScreenHeader title={`📊 ${t.dashboard.title}`} subtitle={t.dashboard.subtitle} />

      <StatsGrid>
        <StatCard icon="🐑" label={t.dashboard.totalFlock} value={fmt(flock?.total)} sub={t.common.head} color="green" />
        <StatCard icon="🐐" label={t.dashboard.ewes} value={fmt(flock?.ewes)} sub={t.common.head} color="green" />
        <StatCard icon="🐏" label={t.dashboard.rams} value={fmt(flock?.rams)} sub={t.common.head} color="amber" />
        <StatCard icon="🐑" label={t.dashboard.lambs} value={fmt(flock?.lambs)} sub={t.common.head} color="green" />
        <StatCard icon="🐣" label={t.dashboard.totalBirths} value={fmt(financials?.totalBirths)} color="blue" />
        <StatCard icon="💔" label={t.dashboard.totalMortality} value={fmt(financials?.totalMortality)} sub={t.common.head} color="red" />
        <StatCard icon="💸" label={t.dashboard.totalExpenses} value={fmtCurrency(financials?.totalExpenses)} color="red" />
        <StatCard icon="💰" label={t.dashboard.totalSales} value={fmtCurrency(financials?.totalSales)} color="gold" />
        <StatCard icon="🐑" label={t.dashboard.flockValue} value={fmtCurrency((flock?.total ?? 0) * 25000)} sub={t.dashboard.approx} color="blue" />
        <StatCard
          icon={isProfit ? '📈' : '📉'}
          label={isProfit ? t.dashboard.profit : t.dashboard.loss}
          value={fmtCurrency(Math.abs(financials?.netProfit ?? 0))}
          color={isProfit ? 'green' : 'red'}
        />
      </StatsGrid>

      {/* الرسم البياني للإيرادات والمصاريف */}
      <Card
        title={`📊 ${t.dashboard.chartTitle}`}
        headerRight={<Badge text={t.dashboard.last6Months} color="green" />}
        style={styles.cardSpacing}
      >
        <View style={[styles.chartArea, { height: barAreaHeight + 30 }]}>
          {chartData.map(point => {
            const incomeH = Math.round((point.income / maxChartVal) * barAreaHeight);
            const expenseH = Math.round((point.expense / maxChartVal) * barAreaHeight);
            return (
              <View key={point.key} style={styles.barGroup}>
                <View style={[styles.barPair, { height: barAreaHeight }]}>
                  <View style={[styles.bar, { width: barWidth, height: Math.max(2, incomeH), backgroundColor: colors.green500 }]} />
                  <View style={[styles.bar, { width: barWidth, height: Math.max(2, expenseH), backgroundColor: colors.red600 }]} />
                </View>
                <Text style={[styles.barLabel, { color: colors.textMuted }]}>{point.label}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.green500 }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>المبيعات</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.red600 }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>المصاريف</Text>
          </View>
        </View>
      </Card>

      {/* تكوين القطيع */}
      <Card title={`🐑 ${t.dashboard.flockComposition}`} style={styles.cardSpacing}>
        <FlockCompositionBars flock={flock} />
      </Card>

      {/* آخر العمليات */}
      <Card title={`⏰ ${t.dashboard.recentTransactions}`} style={styles.cardSpacing} noPadding>
        {recent.length === 0 ? (
          <View style={{ padding: spacing.lg }}>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{t.common.noData}</Text>
          </View>
        ) : (
          <View>
            {recent.map((op, idx) => (
              <View
                key={idx}
                style={[
                  styles.txRow,
                  { borderBottomColor: colors.border },
                  idx === recent.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.txLeft}>
                  <Text style={{ fontSize: 18 }}>{op.icon}</Text>
                  <View>
                    <Text style={[styles.txType, { color: colors.textPrimary }]}>{op.type}</Text>
                    <Text style={[styles.txDetail, { color: colors.textMuted }]} numberOfLines={1}>{op.detail}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {op.amount !== 0 ? (
                    <Text style={{
                      fontWeight: '700',
                      color: op.amount > 0 ? colors.green600 : colors.red600,
                    }}>
                      {op.amount > 0 ? '+' : ''}{fmtCurrency(op.amount)}
                    </Text>
                  ) : (
                    <Text style={{ color: colors.textMuted }}>-</Text>
                  )}
                  <Text style={[styles.txDate, { color: colors.textMuted }]}>{fmtDate(op.date)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    </ScreenContainer>
  );
}

const FlockCompositionBars: React.FC<{ flock: FlockBreakdown | null }> = ({ flock }) => {
  const { colors } = useTheme();
  const total = flock?.total || 1;
  const items = [
    { label: t.dashboard.ewes, count: flock?.ewes ?? 0, color: colors.green500 },
    { label: t.dashboard.rams, count: flock?.rams ?? 0, color: colors.gold },
    { label: t.dashboard.lambs, count: flock?.lambs ?? 0, color: colors.blue600 },
  ];

  return (
    <View style={{ gap: 12 }}>
      {items.map(item => {
        const pct = Math.round((item.count / total) * 100);
        return (
          <View key={item.label}>
            <View style={styles.compositionRow}>
              <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: fontSize.sm }}>{item.label}</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                {item.count} <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '400' }}>({pct}%)</Text>
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: item.color }]} />
            </View>
          </View>
        );
      })}
      <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
        <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{t.dashboard.totalLabel}</Text>
        <Text style={{ color: colors.green700, fontWeight: '800', fontSize: fontSize.md }}>
          {flock?.total ?? 0} {t.common.head}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardSpacing: { marginBottom: spacing.lg },
  chartArea: { flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 4 },
  barGroup: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, justifyContent: 'center' },
  bar: { borderRadius: 3 },
  barLabel: { fontSize: 10, marginTop: 4 },
  legendRow: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: fontSize.sm },
  compositionRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 4 },
  progressTrack: { height: 7, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.full },
  totalRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-between',
    borderTopWidth: 1, paddingTop: 12, marginTop: 4,
  },
  txRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: 12, borderBottomWidth: 1,
  },
  txLeft: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flex: 1 },
  txType: { fontWeight: '700', fontSize: fontSize.sm },
  txDetail: { fontSize: fontSize.xs, maxWidth: 160 },
  txDate: { fontSize: 11, marginTop: 2 },
});
