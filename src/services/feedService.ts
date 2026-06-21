// ============================================
//  src/services/feedService.ts
// ============================================

import { getDb, nowISO } from './database';
import type { FeedStock, FeedType, FeedUnit } from '@/types';

export async function getAllFeedStock(): Promise<FeedStock[]> {
  const db = await getDb();
  return db.getAllAsync<FeedStock>('SELECT * FROM feed_stock ORDER BY type ASC');
}

export interface FeedInput {
  type: FeedType;
  unit: FeedUnit;
  qty: number;
  price: number;
  alertQty: number;
  notes?: string;
}

export async function createFeedStock(input: FeedInput): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO feed_stock (type, unit, qty, price, alertQty, notes, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [input.type, input.unit, input.qty, input.price, input.alertQty, input.notes ?? null, nowISO()]
  );
  return result.lastInsertRowId;
}

export async function updateFeedStock(id: number, input: FeedInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE feed_stock SET type = ?, unit = ?, qty = ?, price = ?, alertQty = ?, notes = ?, updatedAt = ? WHERE id = ?',
    [input.type, input.unit, input.qty, input.price, input.alertQty, input.notes ?? null, nowISO(), id]
  );
}

export async function deleteFeedStock(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM feed_stock WHERE id = ?', [id]);
}

/** عناصر المخزون التي وصلت إلى حد التنبيه أو أقل */
export async function getLowStockItems(): Promise<FeedStock[]> {
  const all = await getAllFeedStock();
  return all.filter(f => f.alertQty > 0 && f.qty <= f.alertQty);
}
