// ============================================
//  src/services/birthsService.ts
// ============================================

import { getDb, nowISO } from './database';
import type { Birth } from '@/types';

export async function getAllBirths(): Promise<Birth[]> {
  const db = await getDb();
  return db.getAllAsync<Birth>('SELECT * FROM births ORDER BY date DESC, id DESC');
}

export interface BirthInput {
  date: string;
  males: number;
  females: number;
  mother?: string;
  notes?: string;
}

export async function createBirth(input: BirthInput): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO births (date, males, females, mother, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [input.date, input.males, input.females, input.mother ?? null, input.notes ?? null, nowISO()]
  );
  return result.lastInsertRowId;
}

export async function updateBirth(id: number, input: BirthInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE births SET date = ?, males = ?, females = ?, mother = ?, notes = ? WHERE id = ?',
    [input.date, input.males, input.females, input.mother ?? null, input.notes ?? null, id]
  );
}

export async function deleteBirth(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM births WHERE id = ?', [id]);
}

export async function getTotalBirths(): Promise<{ males: number; females: number }> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ males: number; females: number }>(
    'SELECT COALESCE(SUM(males),0) as males, COALESCE(SUM(females),0) as females FROM births'
  );
  return { males: row?.males ?? 0, females: row?.females ?? 0 };
}
