// ============================================
//  src/services/purchasesService.ts
// ============================================

import { getDb, nowISO } from './database';
import type { Purchase, AnimalType } from '@/types';

export async function getAllPurchases(): Promise<Purchase[]> {
  const db = await getDb();
  return db.getAllAsync<Purchase>('SELECT * FROM purchases ORDER BY date DESC, id DESC');
}

export interface PurchaseInput {
  date: string;
  type: AnimalType;
  count: number;
  price: number;
  seller?: string;
  notes?: string;
}

export async function createPurchase(input: PurchaseInput): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO purchases (date, type, count, price, seller, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [input.date, input.type, input.count, input.price, input.seller ?? null, input.notes ?? null, nowISO()]
  );
  return result.lastInsertRowId;
}

export async function updatePurchase(id: number, input: PurchaseInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE purchases SET date = ?, type = ?, count = ?, price = ?, seller = ?, notes = ? WHERE id = ?',
    [input.date, input.type, input.count, input.price, input.seller ?? null, input.notes ?? null, id]
  );
}

export async function deletePurchase(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM purchases WHERE id = ?', [id]);
}

export async function getTotalPurchasesAmount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(price), 0) as total FROM purchases'
  );
  return row?.total ?? 0;
}

export async function getTotalPurchasesCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(count), 0) as total FROM purchases'
  );
  return row?.total ?? 0;
}

/** عدد رؤوس الشراء مجمعة حسب النوع، لحساب تكوين القطيع */
export async function getPurchasesCountByType(): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ type: string; total: number }>(
    'SELECT type, COALESCE(SUM(count),0) as total FROM purchases GROUP BY type'
  );
  const map: Record<string, number> = {};
  rows.forEach(r => { map[r.type] = r.total; });
  return map;
}
