// ============================================
//  src/screens/SalesScreen.tsx
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
import { fmtCurrency, fmtDate, todayISO } from '@/utils/format';
import { t } from '@/locales/i18n';
import { fontSize } from '@/theme/metrics';
import { getAllSales, createSale, updateSale, deleteSale } from '@/services/salesService';
import { calcFlockCount } from '@/services/analyticsService';
import type { Sale, AnimalType } from '@/types';

const ANIMAL_TYPES: AnimalType[] = ['نعجة', 'كبش', 'حمل', 'خروف', 'مختلط'];

export default function SalesScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [sales, setSales] = useState<Sale[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<AnimalType>('نعجة');
  const [count, setCount] = useState('');
  const [price, setPrice] = useState('');
  const [buyer, setBuyer] = useState('');
  const [notes, setNotes] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setSales(await getAllSales());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    let data = [...sales];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(s =>
        s.buyer?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q) ||
        s.type.includes(q)
      );
    }
    if (typeFilter) data = data.filter(s => s.type === typeFilter);
    return data;
  }, [sales, search, typeFilter]);

  const openAddModal = () => {
    setEditId(null);
    setDate(todayISO());
    setType('نعجة');
    setCount('');
    setPrice('');
    setBuyer('');
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (s: Sale) => {
    setEditId(s.id);
    setDate(s.date);
    setType(s.type);
    setCount(String(s.count));
    setPrice(String(s.price));
    setBuyer(s.buyer ?? '');
    setNotes(s.notes ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const countNum = Number(count);
    const priceNum = Number(price);
    if (!date || !countNum || countNum <= 0) {
      showToast(t.common.requiredField, 'error');
      return;
    }

    if (!editId) {
      const flockNow = await calcFlockCount();
      if (countNum > flockNow) {
        showToast(`لا يمكن بيع ${countNum} رأس، القطيع الحالي: ${flockNow} رأس`, 'error');
        return;
      }
    }

    try {
      if (editId) {
        await updateSale(editId, { date, type, count: countNum, price: priceNum, buyer: buyer.trim(), notes: notes.trim() });
        showToast(t.common.updateSuccess);
      } else {
        await createSale({ date, type, count: countNum, price: priceNum, buyer: buyer.trim(), notes: notes.trim() });
        showToast(`تم تسجيل بيع ${countNum} رأس بـ ${fmtCurrency(priceNum)} ✅`);
      }
      setModalVisible(false);
      await loadData();
    } catch {
      showToast(t.common.error, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId == null) return;
    await deleteSale(confirmDeleteId);
    showToast(t.common.deleteSuccess);
    setConfirmDeleteId(null);
    await loadData();
  };

  const columns: ColumnDef<Sale>[] = [
    { key: 'date', header: t.common.date, width: 90, render: (s) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{fmtDate(s.date)}</Text> },
    { key: 'type', header: t.common.type, width: 80, render: (s) => <Badge text={s.type} color="gold" /> },
    { key: 'count', header: t.common.count, width: 60, render: (s) => <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{s.count}</Text> },
    { key: 'price', header: 'سعر البيع', width: 110, render: (s) => <Text style={{ color: colors.green600, fontWeight: '700' }}>{fmtCurrency(s.price)}</Text> },
    { key: 'perHead', header: t.sales.pricePerHead, width: 100, render: (s) => <Text style={{ color: colors.textMuted }}>{s.count > 0 ? fmtCurrency(Math.round(s.price / s.count)) : '-'}</Text> },
    { key: 'buyer', header: t.sales.buyer, width: 110, render: (s) => <Text style={{ color: colors.textPrimary }} numberOfLines={1}>{s.buyer || '-'}</Text> },
    { key: 'notes', header: t.common.notes, width: 130, render: (s) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }} numberOfLines={1}>{s.notes || '-'}</Text> },
    {
      key: 'actions', header: '', width: 90,
      render: (s) => (
        <View style={{ flexDirection: 'row-reverse', gap: 6 }}>
          <AppButton icon="✏️" variant="icon" size="sm" onPress={() => openEditModal(s)} />
          <AppButton icon="🗑️" variant="icon" size="sm" onPress={() => setConfirmDeleteId(s.id)} />
        </View>
      ),
    },
  ];

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <ScreenHeader
        title={`💰 ${t.sales.title}`}
        subtitle={t.sales.subtitle}
        actions={<AppButton label={t.sales.add} icon="➕" onPress={openAddModal} />}
      />

      <SearchFilterBar value={search} onChange={setSearch}>
        <FormSelect label="" value={typeFilter || t.common.all} options={[t.common.all, ...ANIMAL_TYPES]}
          onChange={(v) => setTypeFilter(v === t.common.all ? '' : v)} />
      </SearchFilterBar>

      <Card noPadding>
        <DataTable columns={columns} data={filtered} keyExtractor={(s) => s.id} />
      </Card>

      <AppModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editId ? t.sales.edit : t.sales.add}
        icon="💰"
        footer={
          <>
            <AppButton label={t.common.save} icon="💾" onPress={handleSave} fullWidth />
            <AppButton label={t.common.cancel} variant="secondary" onPress={() => setModalVisible(false)} fullWidth />
          </>
        }
      >
        <FormDateInput label={t.common.date} value={date} onChange={setDate} required />
        <FormSelect label={t.common.type} value={type} options={ANIMAL_TYPES} onChange={(v) => setType(v as AnimalType)} required />
        <FormInput label={t.common.count} value={count} onChangeText={setCount} keyboardType="numeric" required />
        <FormInput label={t.sales.totalPrice} value={price} onChangeText={setPrice} keyboardType="numeric" required />
        <FormInput label={t.sales.buyer} placeholder={t.sales.buyerPlaceholder} value={buyer} onChangeText={setBuyer} />
        <FormInput label={t.common.notes} placeholder={t.common.notesOptional} value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
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
