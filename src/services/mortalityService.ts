// ============================================
//  src/services/mortalityService.ts
// ============================================

import { getDb, nowISO } from './database';
import type { Mortality, MortalityCause } from '@/types';

export async function getAllMortality(): Promise<Mortality[]> {
  const db = await getDb();
  return db.getAllAsync<Mortality>('SELECT * FROM mortality ORDER BY date DESC, id DESC');
}

export interface MortalityInput {
  date: string;
  count: number;
  cause: MortalityCause;
  notes?: string;
}

export async function createMortality(input: MortalityInput): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO mortality (date, count, cause, notes, createdAt) VALUES (?, ?, ?, ?, ?)',
    [input.date, input.count, input.cause, input.notes ?? null, nowISO()]
  );
  return result.lastInsertRowId;
}

export async function updateMortality(id: number, input: MortalityInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE mortality SET date = ?, count = ?, cause = ?, notes = ? WHERE id = ?',
    [input.date, input.count, input.cause, input.notes ?? null, id]
  );
}

export async function deleteMortality(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM mortality WHERE id = ?', [id]);
}

export async function getTotalMortality(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(count),0) as total FROM mortality'
  );
  return row?.total ?? 0;
}
