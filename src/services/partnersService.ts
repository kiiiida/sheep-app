// ============================================
//  src/services/partnersService.ts
// ============================================

import { getDb, nowISO } from './database';
import type { Partner } from '@/types';

export async function getAllPartners(): Promise<Partner[]> {
  const db = await getDb();
  return db.getAllAsync<Partner>('SELECT * FROM partners ORDER BY date DESC');
}

export async function getPartnerById(id: number): Promise<Partner | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Partner>('SELECT * FROM partners WHERE id = ?', [id]);
  return row ?? null;
}

export interface PartnerInput {
  name: string;
  capital: number;
  date: string;
  notes?: string;
}

export async function createPartner(input: PartnerInput): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO partners (name, capital, date, notes, createdAt) VALUES (?, ?, ?, ?, ?)',
    [input.name, input.capital, input.date, input.notes ?? null, nowISO()]
  );
  return result.lastInsertRowId;
}

export async function updatePartner(id: number, input: PartnerInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE partners SET name = ?, capital = ?, date = ?, notes = ? WHERE id = ?',
    [input.name, input.capital, input.date, input.notes ?? null, id]
  );
}

export async function deletePartner(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM partners WHERE id = ?', [id]);
}

export async function getTotalCapital(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(capital), 0) as total FROM partners'
  );
  return row?.total ?? 0;
}
