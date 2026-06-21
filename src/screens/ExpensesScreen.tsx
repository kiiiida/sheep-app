// ============================================
//  src/screens/ExpensesScreen.tsx
// ============================================

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { useToast } from '@/hooks/useToast';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppButton } from '@/components/AppButton';
import { AppModal } from '@/components/AppModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FormInput } from '@/components/FormInput';
import { FormSelect } from '@/components/FormSelect';
import { FormDateInput } from '@/components/FormDateInput';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { DataTable, ColumnDef } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { StatsGrid } from '@/components/StatsGrid';
import { fmtCurrency, fmtDate, todayISO } from '@/utils/format';
import { t } from '@/locales/i18n';
import { fontSize } from '@/theme/metrics';
import {
  getAllExpenses, createExpense, updateExpense, deleteExpense, getExpensesByCategory,
} from '@/services/expensesService';
import type { Expense, ExpenseCategory } from '@/types';

const CATEGORIES: ExpenseCategory[] = [
  'علف', 'شعير', 'تبن', 'دواء', 'طبيب بيطري', 'نقل', 'أجور', 'ماء', 'كهرباء', 'وقود', 'مصاريف أخرى',
];

const CATEGORY_ICONS: Record<string, string> = {
  'علف': '🌾', 'شعير': '🌾', 'تبن': '🌿', 'دواء': '💊', 'طبيب بيطري': '🩺',
  'نقل': '🚛', 'أجور': '👷', 'ماء': '💧', 'كهرباء': '⚡', 'وقود': '⛽', 'مصاريف أخرى': '📋',
};

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [topCategories, setTopCategories] = useState<{ category: string; total: number }[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState<ExpenseCategory>('علف');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const [list, cats] = await Promise.all([getAllExpenses(), getExpensesByCategory()]);
    setExpenses(list);
    setTopCategories(cats.slice(0, 5));
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    let data = [...expenses];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(e => e.note?.toLowerCase().includes(q) || e.category.includes(q));
    }
    if (catFilter) data = data.filter(e => e.category === catFilter);
    return data;
  }, [expenses, search, catFilter]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const openAddModal = () => {
    setEditId(null);
    setDate(todayISO());
    setCategory('علف');
    setAmount('');
    setNote('');
    setModalVisible(true);
  };

  const openEditModal = (e: Expense) => {
    setEditId(e.id);
    setDate(e.date);
    setCategory(e.category);
    setAmount(String(e.amount));
    setNote(e.note ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const amountNum = Number(amount);
    if (!date || !amountNum || amountNum <= 0) {
      showToast(t.common.requiredField, 'error');
      return;
    }

    try {
      if (editId) {
        await updateExpense(editId, { date, category, amount: amountNum, note: note.trim() });
        showToast(t.common.updateSuccess);
      } else {
        await createExpense({ date, category, amount: amountNum, note: note.trim() });
        showToast(`تم تسجيل مصروف ${fmtCurrency(amountNum)} - ${category}`);
      }
      setModalVisible(false);
      await loadData();
    } catch {
      showToast(t.common.error, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId == null) return;
    await deleteExpense(confirmDeleteId);
    showToast(t.common.deleteSuccess);
    setConfirmDeleteId(null);
    await loadData();
  };

  const columns: ColumnDef<Expense>[] = [
    { key: 'date', header: t.common.date, width: 90, render: (e) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{fmtDate(e.date)}</Text> },
    { key: 'category', header: t.expenses.category, width: 130, render: (e) => <Badge text={`${CATEGORY_ICONS[e.category] ?? '📋'} ${e.category}`} color="amber" /> },
    { key: 'amount', header: t.common.amount, width: 100, render: (e) => <Text style={{ color: colors.red600, fontWeight: '700' }}>{fmtCurrency(e.amount)}</Text> },
    { key: 'note', header: t.expenses.note, width: 150, render: (e) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }} numberOfLines={1}>{e.note || '-'}</Text> },
    {
      key: 'actions', header: '', width: 90,
      render: (e) => (
        <View style={{ flexDirection: 'row-reverse', gap: 6 }}>
          <AppButton icon="✏️" variant="icon" size="sm" onPress={() => openEditModal(e)} />
          <AppButton icon="🗑️" variant="icon" size="sm" onPress={() => setConfirmDeleteId(e.id)} />
        </View>
      ),
    },
  ];

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <ScreenHeader
        title={`📋 ${t.expenses.title}`}
        subtitle={t.expenses.subtitle}
        actions={<AppButton label={t.expenses.add} icon="➕" onPress={openAddModal} />}
      />

      <SearchFilterBar value={search} onChange={setSearch}>
        <FormSelect label="" value={catFilter || t.common.all} options={[t.common.all, ...CATEGORIES]}
          onChange={(v) => setCatFilter(v === t.common.all ? '' : v)} />
      </SearchFilterBar>

      <StatsGrid>
        <StatCard icon="💸" label={t.dashboard.totalExpenses} value={fmtCurrency(totalExpenses)} color="red" />
        {topCategories.map(c => (
          <StatCard key={c.category} icon={CATEGORY_ICONS[c.category] ?? '📋'} label={c.category} value={fmtCurrency(c.total)} color="amber" />
        ))}
      </StatsGrid>

      <Card noPadding style={{ marginTop: 4 }}>
        <DataTable columns={columns} data={filtered} keyExtractor={(e) => e.id} />
      </Card>

      <AppModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editId ? t.expenses.edit : t.expenses.add}
        icon="📋"
        footer={
          <>
            <AppButton label={t.common.save} icon="💾" onPress={handleSave} fullWidth />
            <AppButton label={t.common.cancel} variant="secondary" onPress={() => setModalVisible(false)} fullWidth />
          </>
        }
      >
        <FormDateInput label={t.common.date} value={date} onChange={setDate} required />
        <FormSelect label={t.expenses.category} value={category} options={CATEGORIES} onChange={(v) => setCategory(v as ExpenseCategory)} required />
        <FormInput label={t.common.amount} value={amount} onChangeText={setAmount} keyboardType="numeric" required />
        <FormInput label={t.expenses.note} placeholder={t.expenses.notePlaceholder} value={note} onChangeText={setNote} multiline numberOfLines={3} />
      </AppModal>

      <ConfirmDialog
        isVisible={confirmDeleteId != null}
        message={t.common.confirmDeleteMsg}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ScreenContainer>
  );
}
