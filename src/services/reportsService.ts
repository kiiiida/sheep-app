// ============================================
//  src/services/reportsService.ts
// ============================================

import { getAllPurchases } from './purchasesService';
import { getAllSales } from './salesService';
import { getAllBirths } from './birthsService';
import { getAllMortality } from './mortalityService';
import { getAllExpenses } from './expensesService';
import { getAllPartners } from './partnersService';
import type { ReportPeriod, Purchase, Sale, Birth, Mortality, Expense, PartnerWithShare } from '@/types';

function filterByPeriod<T extends { date: string }>(items: T[], period: ReportPeriod): T[] {
  const now = new Date();
  return items.filter(item => {
    if (!item.date) return false;
    const d = new Date(item.date);
    switch (period) {
      case 'weekly':
        return now.getTime() - d.getTime() <= 7 * 86400000;
      case 'monthly':
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      case 'yearly':
        return d.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });
}

export interface PeriodReport {
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  births: Birth[];
  mortality: Mortality[];
  periodSales: number;
  periodExpenses: number;
  periodProfit: number;
  periodPurchases: number;
  periodBirths: number;
  periodMortality: number;
  categoryBreakdown: { category: string; amount: number; percent: number }[];
  partners: PartnerWithShare[];
}

export async function buildPeriodReport(period: ReportPeriod): Promise<PeriodReport> {
  const [allSales, allPurchases, allExpenses, allBirths, allMortality, allPartners] = await Promise.all([
    getAllSales(),
    getAllPurchases(),
    getAllExpenses(),
    getAllBirths(),
    getAllMortality(),
    getAllPartners(),
  ]);

  const sales = filterByPeriod(allSales, period);
  const purchases = filterByPeriod(allPurchases, period);
  const expenses = filterByPeriod(allExpenses, period);
  const births = filterByPeriod(allBirths, period);
  const mortality = filterByPeriod(allMortality, period);

  const periodSales = sales.reduce((s, x) => s + x.price, 0);
  const periodExpenses = expenses.reduce((s, x) => s + x.amount, 0);
  const periodPurchases = purchases.reduce((s, x) => s + x.price, 0);
  const periodBirths = births.reduce((s, b) => s + b.males + b.females, 0);
  const periodMortality = mortality.reduce((s, m) => s + m.count, 0);
  const periodProfit = periodSales - periodExpenses;

  const catMap: Record<string, number> = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] ?? 0) + e.amount; });
  const categoryBreakdown = Object.entries(catMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: periodExpenses > 0 ? (amount / periodExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // أرباح الشركاء تُحسب على إجمالي الأرباح (لا فترة)، كما في تطبيق الويب
  const totalCapital = allPartners.reduce((s, p) => s + p.capital, 0);
  const totalSalesAll = allSales.reduce((s, x) => s + x.price, 0);
  const totalExpensesAll = allExpenses.reduce((s, x) => s + x.amount, 0);
  const netProfitAll = totalSalesAll - totalExpensesAll;

  const partners: PartnerWithShare[] = allPartners.map(p => {
    const sharePercent = totalCapital > 0 ? (p.capital / totalCapital) * 100 : 0;
    const profitDue = netProfitAll > 0 ? (netProfitAll * sharePercent) / 100 : 0;
    return { ...p, sharePercent, profitDue };
  });

  return {
    sales, purchases, expenses, births, mortality,
    periodSales, periodExpenses, periodProfit, periodPurchases, periodBirths, periodMortality,
    categoryBreakdown, partners,
  };
}

/** يبني نص CSV (مع BOM لدعم العربية في Excel) من تقرير فترة معينة */
export function buildCsvReport(report: PeriodReport): string {
  const BOM = '\uFEFF';
  let csv = BOM;
  csv += 'تقرير مشروع تربية الأغنام\n';
  csv += `التاريخ,${new Date().toLocaleDateString('ar-DZ')}\n\n`;

  csv += 'الملخص المالي\n';
  csv += 'البند,المبلغ (دج)\n';
  csv += `إجمالي المبيعات,${report.periodSales}\n`;
  csv += `إجمالي المصاريف,${report.periodExpenses}\n`;
  csv += `صافي الربح,${report.periodProfit}\n\n`;

  csv += 'المبيعات\n';
  csv += 'التاريخ,النوع,العدد,السعر,المشتري\n';
  report.sales.forEach(s => { csv += `${s.date},${s.type},${s.count},${s.price},${s.buyer ?? ''}\n`; });

  csv += '\nالمصاريف\n';
  csv += 'التاريخ,التصنيف,المبلغ,الملاحظة\n';
  report.expenses.forEach(e => { csv += `${e.date},${e.category},${e.amount},${e.note ?? ''}\n`; });

  csv += '\nتوزيع الأرباح على الشركاء\n';
  csv += 'الشريك,رأس المال,النسبة,الأرباح المستحقة\n';
  report.partners.forEach(p => {
    csv += `${p.name},${p.capital},${p.sharePercent.toFixed(1)}%,${p.profitDue.toFixed(0)}\n`;
  });

  return csv;
}
