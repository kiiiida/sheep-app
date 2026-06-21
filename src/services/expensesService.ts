// ============================================
//  src/services/expensesService.ts
// ============================================

import { getDb, nowISO } from './database';
import type { Expense, ExpenseCategory } from '@/types';

export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDb();
  return db.getAllAsync<Expense>('SELECT * FROM expenses ORDER BY date DESC, id DESC');
}

export interface ExpenseInput {
  date: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
}

export async function createExpense(input: ExpenseInput): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO expenses (date, category, amount, note, createdAt) VALUES (?, ?, ?, ?, ?)',
    [input.date, input.category, input.amount, input.note ?? null, nowISO()]
  );
  return result.lastInsertRowId;
}

export async function updateExpense(id: number, input: ExpenseInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE expenses SET date = ?, category = ?, amount = ?, note = ? WHERE id = ?',
    [input.date, input.category, input.amount, input.note ?? null, id]
  );
}

export async function deleteExpense(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}

export async function getTotalExpenses(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount),0) as total FROM expenses'
  );
  return row?.total ?? 0;
}

/** المصاريف مجمّعة حسب التصنيف، مرتبة تنازلياً */
export async function getExpensesByCategory(): Promise<{ category: string; total: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ category: string; total: number }>(
    'SELECT category, COALESCE(SUM(amount),0) as total FROM expenses GROUP BY category ORDER BY total DESC'
  );
}

export async function getMonthlyExpenses(monthKeys: string[]): Promise<Record<string, number>> {
  const db = await getDb();
  const map: Record<string, number> = {};
  for (const key of monthKeys) {
    const row = await db.getFirstAsync<{ total: number }>(
      "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE ? || '%'",
      [key]
    );
    map[key] = row?.total ?? 0;
  }
  return map;
}
