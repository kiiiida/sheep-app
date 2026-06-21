// ============================================
//  src/services/analyticsService.ts
//  حسابات مجمّعة: المالية، تكوين القطيع، الرسوم البيانية
// ============================================

import { getDb } from './database';
import { getTotalPurchasesAmount, getTotalPurchasesCount, getPurchasesCountByType } from './purchasesService';
import { getTotalSalesAmount, getTotalSalesCount, getMonthlySales } from './salesService';
import { getTotalExpenses, getMonthlyExpenses } from './expensesService';
import { getTotalCapital } from './partnersService';
import { getTotalBirths } from './birthsService';
import { getTotalMortality } from './mortalityService';
import type { Financials, FlockBreakdown } from '@/types';

/** إجمالي عدد رؤوس القطيع الحالي = مشتريات + مواليد - مبيعات - نفوق */
export async function calcFlockCount(): Promise<number> {
  const purchasesCount = await getTotalPurchasesCount();
  const { males, females } = await getTotalBirths();
  const salesCount = await getTotalSalesCount();
  const mortalityCount = await getTotalMortality();
  const total = purchasesCount + males + females - salesCount - mortalityCount;
  return Math.max(0, total);
}

/** تكوين القطيع: نعاج / كباش / حملان بناءً على نوع الشراء + المواليد */
export async function calcFlockBreakdown(): Promise<FlockBreakdown> {
  const byType = await getPurchasesCountByType();
  const { males, females } = await getTotalBirths();

  let ewes = byType['نعجة'] ?? 0;
  let rams = byType['كبش'] ?? 0;
  let lambs = (byType['حمل'] ?? 0) + (byType['خروف'] ?? 0);

  const mixed = byType['مختلط'] ?? 0;
  ewes += Math.floor(mixed / 2);
  rams += Math.floor(mixed / 2);

  lambs += males + females;

  const total = await calcFlockCount();

  return { ewes, rams, lambs, total };
}

/** الملخص المالي الكامل للمشروع */
export async function calcFinancials(): Promise<Financials> {
  const [totalSales, totalExpenses, totalPurchases, totalCapital, { males, females }, totalMortality] =
    await Promise.all([
      getTotalSalesAmount(),
      getTotalExpenses(),
      getTotalPurchasesAmount(),
      getTotalCapital(),
      getTotalBirths(),
      getTotalMortality(),
    ]);

  return {
    totalSales,
    totalExpenses,
    totalPurchases,
    totalCapital,
    netProfit: totalSales - totalExpenses,
    totalBirths: males + females,
    totalMortality,
  };
}

export interface MonthlyChartPoint {
  key: string;   // "2026-06"
  label: string; // "يونيو"
  income: number;
  expense: number;
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/** بيانات آخر 6 أشهر للرسم البياني في لوحة التحكم */
export async function getLastMonthsChartData(monthsBack = 6): Promise<MonthlyChartPoint[]> {
  const now = new Date();
  const keys: string[] = [];
  const labels: string[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    keys.push(key);
    labels.push(ARABIC_MONTHS[d.getMonth()]);
  }

  const [incomeMap, expenseMap] = await Promise.all([
    getMonthlySales(keys),
    getMonthlyExpenses(keys),
  ]);

  return keys.map((key, i) => ({
    key,
    label: labels[i],
    income: incomeMap[key] ?? 0,
    expense: expenseMap[key] ?? 0,
  }));
}

/** آخر العمليات من كل الجداول مجمّعة، لعرضها في لوحة التحكم */
export interface RecentTransaction {
  type: 'شراء' | 'بيع' | 'مصروف' | 'ولادة' | 'نفوق';
  icon: string;
  detail: string;
  amount: number;
  date: string;
}

export async function getRecentTransactions(limit = 10): Promise<RecentTransaction[]> {
  const db = await getDb();

  const rows = await db.getAllAsync<any>(`
    SELECT 'شراء' as txType, date, count as txCount, price as amount, type as itemType, seller as extra FROM purchases
    UNION ALL
    SELECT 'بيع' as txType, date, count as txCount, price as amount, type as itemType, buyer as extra FROM sales
    UNION ALL
    SELECT 'مصروف' as txType, date, NULL as txCount, amount, category as itemType, note as extra FROM expenses
    UNION ALL
    SELECT 'ولادة' as txType, date, (males + females) as txCount, 0 as amount, NULL as itemType, NULL as extra FROM births
    UNION ALL
    SELECT 'نفوق' as txType, date, count as txCount, 0 as amount, cause as itemType, NULL as extra FROM mortality
    ORDER BY date DESC
    LIMIT ?
  `, [limit]);

  const iconMap: Record<string, string> = {
    'شراء': '🛒', 'بيع': '💰', 'مصروف': '📋', 'ولادة': '🐣', 'نفوق': '💔',
  };

  const signMap: Record<string, number> = {
    'شراء': -1, 'بيع': 1, 'مصروف': -1, 'ولادة': 0, 'نفوق': 0,
  };

  return rows.map(r => {
    let detail = '';
    if (r.txType === 'شراء' || r.txType === 'بيع') {
      detail = `${r.txCount} رأس ${r.itemType ?? ''}`;
    } else if (r.txType === 'مصروف') {
      detail = r.itemType ?? '';
    } else if (r.txType === 'ولادة') {
      detail = `${r.txCount} مولود`;
    } else if (r.txType === 'نفوق') {
      detail = `${r.txCount} رأس - ${r.itemType ?? ''}`;
    }
    return {
      type: r.txType,
      icon: iconMap[r.txType] ?? '📋',
      detail,
      amount: (r.amount ?? 0) * (signMap[r.txType] ?? 0),
      date: r.date,
    };
  });
}
