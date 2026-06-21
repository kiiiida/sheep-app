// ============================================
//  src/utils/format.ts
// ============================================

export function fmt(n: number | null | undefined, decimals = 0): string {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Number(n).toLocaleString('ar-DZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtCurrency(n: number | null | undefined): string {
  return `${fmt(n)} دج`;
}

export function fmtDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function uidLocal(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
