// ============================================
//  src/services/database.ts
//  تهيئة قاعدة بيانات SQLite المحلية + المخطط (Schema)
// ============================================

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'sheep_manager.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * يفتح (أو يُنشئ) قاعدة البيانات ويُرجع نسخة واحدة منها (Singleton).
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  await dbInstance.execAsync('PRAGMA journal_mode = WAL;');
  await dbInstance.execAsync('PRAGMA foreign_keys = ON;');
  return dbInstance;
}

/**
 * ينشئ كل جداول التطبيق إن لم تكن موجودة بعد.
 * يُستدعى مرة واحدة عند بدء تشغيل التطبيق (App.tsx).
 */
export async function initDatabase(): Promise<void> {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capital REAL NOT NULL DEFAULT 0,
      date TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      count INTEGER NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      seller TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      count INTEGER NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      buyer TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS births (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      males INTEGER NOT NULL DEFAULT 0,
      females INTEGER NOT NULL DEFAULT 0,
      mother TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mortality (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      count INTEGER NOT NULL,
      cause TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      note TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      qty REAL NOT NULL DEFAULT 0,
      price REAL NOT NULL DEFAULT 0,
      buyDate TEXT,
      expDate TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feed_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      unit TEXT NOT NULL,
      qty REAL NOT NULL DEFAULT 0,
      price REAL NOT NULL DEFAULT 0,
      alertQty REAL NOT NULL DEFAULT 0,
      notes TEXT,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date);
    CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
    CREATE INDEX IF NOT EXISTS idx_births_date ON births(date);
    CREATE INDEX IF NOT EXISTS idx_mortality_date ON mortality(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  `);
}

/**
 * يحذف كل البيانات من كل الجداول (للاستخدام في "مسح جميع البيانات").
 * لا يحذف بنية الجداول، فقط محتواها.
 */
export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM partners;
    DELETE FROM purchases;
    DELETE FROM sales;
    DELETE FROM births;
    DELETE FROM mortality;
    DELETE FROM expenses;
    DELETE FROM medicines;
    DELETE FROM feed_stock;
  `);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
