// ============================================
//  src/types/index.ts
//  تعريفات الأنواع لكل كيانات التطبيق
// ============================================

export type AnimalType = 'نعجة' | 'كبش' | 'حمل' | 'خروف' | 'مختلط';

export type ExpenseCategory =
  | 'علف'
  | 'شعير'
  | 'تبن'
  | 'دواء'
  | 'طبيب بيطري'
  | 'نقل'
  | 'أجور'
  | 'ماء'
  | 'كهرباء'
  | 'وقود'
  | 'مصاريف أخرى';

export type MortalityCause =
  | 'مرض'
  | 'حادث'
  | 'برد شديد'
  | 'حرارة شديدة'
  | 'ولادة'
  | 'افتراس'
  | 'سبب مجهول'
  | 'أخرى';

export type FeedType = 'شعير' | 'تبن' | 'علف مركب' | 'ذرة' | 'نخالة' | 'أخرى';
export type FeedUnit = 'كغ' | 'طن' | 'قنطار' | 'كيس' | 'بالة';

export interface Partner {
  id: number;
  name: string;
  capital: number;
  date: string; // ISO date
  notes?: string;
  createdAt: string;
}

export interface Purchase {
  id: number;
  date: string;
  type: AnimalType;
  count: number;
  price: number;
  seller?: string;
  notes?: string;
  createdAt: string;
}

export interface Sale {
  id: number;
  date: string;
  type: AnimalType;
  count: number;
  price: number;
  buyer?: string;
  notes?: string;
  createdAt: string;
}

export interface Birth {
  id: number;
  date: string;
  males: number;
  females: number;
  mother?: string;
  notes?: string;
  createdAt: string;
}

export interface Mortality {
  id: number;
  date: string;
  count: number;
  cause: MortalityCause;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: number;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface Medicine {
  id: number;
  name: string;
  qty: number;
  price: number;
  buyDate?: string;
  expDate?: string;
  notes?: string;
  createdAt: string;
}

export interface FeedStock {
  id: number;
  type: FeedType;
  unit: FeedUnit;
  qty: number;
  price: number;
  alertQty: number;
  notes?: string;
  updatedAt: string;
}

export interface FlockBreakdown {
  ewes: number;
  rams: number;
  lambs: number;
  total: number;
}

export interface Financials {
  totalSales: number;
  totalExpenses: number;
  totalPurchases: number;
  totalCapital: number;
  netProfit: number;
  totalBirths: number;
  totalMortality: number;
}

export interface PartnerWithShare extends Partner {
  sharePercent: number;
  profitDue: number;
}

export type ReportPeriod = 'weekly' | 'monthly' | 'yearly' | 'all';

export interface BackupData {
  partners: Partner[];
  purchases: Purchase[];
  sales: Sale[];
  births: Birth[];
  mortality: Mortality[];
  expenses: Expense[];
  medicines: Medicine[];
  feed: FeedStock[];
  exportDate: string;
  version: string;
}

export type RootStackParamList = {
  Drawer: undefined;
  Dashboard: undefined;
  Partners: undefined;
  Purchases: undefined;
  Sales: undefined;
  Births: undefined;
  Mortality: undefined;
  Expenses: undefined;
  Medicines: undefined;
  Feed: undefined;
  Reports: undefined;
  Backup: undefined;
};
