// ============================================
//  src/services/backupService.ts
//  تصدير/استيراد JSON + مسح كامل البيانات
// ============================================

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getDb, nowISO, clearAllData } from './database';
import { getAllPartners } from './partnersService';
import { getAllPurchases } from './purchasesService';
import { getAllSales } from './salesService';
import { getAllBirths } from './birthsService';
import { getAllMortality } from './mortalityService';
import { getAllExpenses } from './expensesService';
import { getAllMedicines } from './medicinesService';
import { getAllFeedStock } from './feedService';
import type { BackupData } from '@/types';

const APP_VERSION = '1.0.0';

/** يبني كامل بيانات التطبيق كموضوع JS واحد جاهز للتصدير */
export async function buildBackupPayload(): Promise<BackupData> {
  const [partners, purchases, sales, births, mortality, expenses, medicines, feed] = await Promise.all([
    getAllPartners(),
    getAllPurchases(),
    getAllSales(),
    getAllBirths(),
    getAllMortality(),
    getAllExpenses(),
    getAllMedicines(),
    getAllFeedStock(),
  ]);

  return {
    partners, purchases, sales, births, mortality, expenses, medicines, feed,
    exportDate: nowISO(),
    version: APP_VERSION,
  };
}

/** يكتب النسخة الاحتياطية كملف JSON في مجلد المستندات ثم يفتح نافذة المشاركة */
export async function exportBackupToFile(): Promise<string> {
  const data = await buildBackupPayload();
  const json = JSON.stringify(data, null, 2);
  const fileName = `sheep-backup-${data.exportDate.split('T')[0]}.json`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'حفظ النسخة الاحتياطية',
    });
  }

  return fileUri;
}

/** يفتح منتقي الملفات، يقرأ JSON، ويُرجع البيانات المُحلّلة (بدون استيراد فعلي بعد) */
export async function pickBackupFile(): Promise<BackupData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) return null;

  const fileUri = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });

  const parsed = JSON.parse(content);
  if (!parsed.partners || !parsed.purchases) {
    throw new Error('الملف غير صحيح أو لا يحتوي على بنية بيانات متوافقة');
  }
  return parsed as BackupData;
}

/**
 * يستبدل كل بيانات قاعدة البيانات الحالية ببيانات النسخة الاحتياطية المُستوردة.
 * يُنفَّذ ضمن معاملة (transaction) واحدة لضمان تماسك البيانات.
 */
export async function restoreFromBackup(data: BackupData): Promise<void> {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    await clearAllData();

    for (const p of data.partners) {
      await db.runAsync(
        'INSERT INTO partners (name, capital, date, notes, createdAt) VALUES (?, ?, ?, ?, ?)',
        [p.name, p.capital, p.date, p.notes ?? null, p.createdAt ?? nowISO()]
      );
    }
    for (const p of data.purchases) {
      await db.runAsync(
        'INSERT INTO purchases (date, type, count, price, seller, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.date, p.type, p.count, p.price, p.seller ?? null, p.notes ?? null, p.createdAt ?? nowISO()]
      );
    }
    for (const s of data.sales) {
      await db.runAsync(
        'INSERT INTO sales (date, type, count, price, buyer, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [s.date, s.type, s.count, s.price, s.buyer ?? null, s.notes ?? null, s.createdAt ?? nowISO()]
      );
    }
    for (const b of data.births) {
      await db.runAsync(
        'INSERT INTO births (date, males, females, mother, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [b.date, b.males, b.females, b.mother ?? null, b.notes ?? null, b.createdAt ?? nowISO()]
      );
    }
    for (const m of data.mortality) {
      await db.runAsync(
        'INSERT INTO mortality (date, count, cause, notes, createdAt) VALUES (?, ?, ?, ?, ?)',
        [m.date, m.count, m.cause, m.notes ?? null, m.createdAt ?? nowISO()]
      );
    }
    for (const e of data.expenses) {
      await db.runAsync(
        'INSERT INTO expenses (date, category, amount, note, createdAt) VALUES (?, ?, ?, ?, ?)',
        [e.date, e.category, e.amount, e.note ?? null, e.createdAt ?? nowISO()]
      );
    }
    for (const med of data.medicines) {
      await db.runAsync(
        'INSERT INTO medicines (name, qty, price, buyDate, expDate, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [med.name, med.qty, med.price, med.buyDate ?? null, med.expDate ?? null, med.notes ?? null, med.createdAt ?? nowISO()]
      );
    }
    for (const f of data.feed) {
      await db.runAsync(
        'INSERT INTO feed_stock (type, unit, qty, price, alertQty, notes, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [f.type, f.unit, f.qty, f.price, f.alertQty, f.notes ?? null, f.updatedAt ?? nowISO()]
      );
    }
  });
}

/** حجم قاعدة البيانات التقريبي (بالكيلوبايت) لعرضه في شاشة النسخ الاحتياطي */
export async function estimateDatabaseSizeKB(): Promise<number> {
  try {
    const dbPath = `${FileSystem.documentDirectory}../SQLite/sheep_manager.db`;
    const info = await FileSystem.getInfoAsync(dbPath);
    if (info.exists && 'size' in info) {
      return Math.round((info.size / 1024) * 100) / 100;
    }
  } catch {
    // تجاهل: بعض المنصات لا تسمح بالوصول المباشر لمسار الملف
  }
  return 0;
}
