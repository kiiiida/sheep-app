// ============================================
//  src/services/medicinesService.ts
// ============================================

import { getDb, nowISO } from './database';
import type { Medicine } from '@/types';

export async function getAllMedicines(): Promise<Medicine[]> {
  const db = await getDb();
  return db.getAllAsync<Medicine>('SELECT * FROM medicines ORDER BY buyDate DESC, id DESC');
}

export interface MedicineInput {
  name: string;
  qty: number;
  price: number;
  buyDate?: string;
  expDate?: string;
  notes?: string;
}

export async function createMedicine(input: MedicineInput): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO medicines (name, qty, price, buyDate, expDate, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [input.name, input.qty, input.price, input.buyDate ?? null, input.expDate ?? null, input.notes ?? null, nowISO()]
  );
  return result.lastInsertRowId;
}

export async function updateMedicine(id: number, input: MedicineInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE medicines SET name = ?, qty = ?, price = ?, buyDate = ?, expDate = ?, notes = ? WHERE id = ?',
    [input.name, input.qty, input.price, input.buyDate ?? null, input.expDate ?? null, input.notes ?? null, id]
  );
}

export async function deleteMedicine(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM medicines WHERE id = ?', [id]);
}

/** الأدوية التي تنتهي صلاحيتها خلال N يوم (للتنبيهات) */
export async function getExpiringMedicines(daysThreshold = 14): Promise<Medicine[]> {
  const all = await getAllMedicines();
  const today = new Date();
  return all.filter(m => {
    if (!m.expDate) return false;
    const diff = Math.ceil((new Date(m.expDate).getTime() - today.getTime()) / 86400000);
    return diff >= 0 && diff <= daysThreshold;
  });
}
