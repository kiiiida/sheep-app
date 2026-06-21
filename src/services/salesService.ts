// ============================================
//  src/services/salesService.ts
// ============================================

import { getDb, nowISO } from './database';
import type { Sale, AnimalType } from '@/types';

export async function getAllSales(): Promise<Sale[]> {
  const db = await getDb();
  return db.getAllAsync<Sale>('SELECT * FROM sales ORDER BY date DESC, id DESC');
}

export interface SaleInput {
  date: string;
  type: AnimalType;
  count: number;
  price: number;
  buyer?: string;
  notes?: string;
}

export async function createSale(input: SaleInput): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO sales (date, type, count, price, buyer, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [input.date, input.type, input.count, input.price, input.buyer ?? null, input.notes ?? null, nowISO()]
  );
  return result.lastInsertRowId;
}

export async function updateSale(id: number, input: SaleInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE sales SET date = ?, type = ?, count = ?, price = ?, buyer = ?, notes = ? WHERE id = ?',
    [input.date, input.type, input.count, input.price, input.buyer ?? null, input.notes ?? null, id]
  );
}

export async function deleteSale(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM sales WHERE id = ?', [id]);
}

export async function getTotalSalesAmount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(price), 0) as total FROM sales'
  );
  return row?.total ?? 0;
}

export async function getTotalSalesCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(count), 0) as total FROM sales'
  );
  return row?.total ?? 0;
}

/** الإيرادات الشهرية لآخر N شهر — لاستخدامها في رسم لوحة التحكم */
export async function getMonthlySales(monthKeys: string[]): Promise<Record<string, number>> {
  const db = await getDb();
  const map: Record<string, number> = {};
  for (const key of monthKeys) {
    const row = await db.getFirstAsync<{ total: number }>(
      "SELECT COALESCE(SUM(price), 0) as total FROM sales WHERE date LIKE ? || '%'",
      [key]
    );
    map[key] = row?.total ?? 0;
  }
  return map;
}
