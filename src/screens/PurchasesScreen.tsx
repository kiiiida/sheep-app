// ============================================
//  src/screens/PurchasesScreen.tsx
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
import { fmt, fmtCurrency, fmtDate, todayISO } from '@/utils/format';
import { t } from '@/locales/i18n';
import { spacing, fontSize } from '@/theme/metrics';
import {
  getAllPurchases, createPurchase, updatePurchase, deletePurchase,
} from '@/services/purchasesService';
import type { Purchase, AnimalType } from '@/types';

const ANIMAL_TYPES: AnimalType[] = ['نعجة', 'كبش', 'حمل', 'خروف', 'مختلط'];

export default function PurchasesScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<AnimalType>('نعجة');
  const [count, setCount] = useState('');
  const [price, setPrice] = useState('');
  const [seller, setSeller] = useState('');
  const [notes, setNotes] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setPurchases(await getAllPurchases());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    let data = [...purchases];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.seller?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q) ||
        p.type.includes(q)
      );
    }
    if (typeFilter) data = data.filter(p => p.type === typeFilter);
    return data;
  }, [purchases, search, typeFilter]);

  const openAddModal = () => {
    setEditId(null);
    setDate(todayISO());
    setType('نعجة');
    setCount('');
    setPrice('');
    setSeller('');
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (p: Purchase) => {
    setEditId(p.id);
    setDate(p.date);
    setType(p.type);
    setCount(String(p.count));
    setPrice(String(p.price));
    setSeller(p.seller ?? '');
    setNotes(p.notes ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const countNum = Number(count);
    const priceNum = Number(price);
    if (!date || !countNum || countNum <= 0) {
      showToast(t.common.requiredField, 'error');
      return;
    }
    if (priceNum < 0) {
      showToast('السعر لا يمكن أن يكون سالباً', 'error');
      return;
    }

    try {
      if (editId) {
        await updatePurchase(editId, { date, type, count: countNum, price: priceNum, seller: seller.trim(), notes: notes.trim() });
        showToast(t.common.updateSuccess);
      } else {
        await createPurchase({ date, type, count: countNum, price: priceNum, seller: seller.trim(), notes: notes.trim() });
        showToast(`تم تسجيل شراء ${countNum} رأس ${type} ✅`);
      }
      setModalVisible(false);
      await loadData();
    } catch {
      showToast(t.common.error, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId == null) return;
    await deletePurchase(confirmDeleteId);
    showToast(t.common.deleteSuccess);
    setConfirmDeleteId(null);
    await loadData();
  };

  const columns: ColumnDef<Purchase>[] = [
    { key: 'date', header: t.common.date, width: 90, render: (p) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{fmtDate(p.date)}</Text> },
    { key: 'type', header: t.common.type, width: 80, render: (p) => <Badge text={p.type} color="green" /> },
    { key: 'count', header: t.common.count, width: 60, render: (p) => <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{p.count}</Text> },
    { key: 'price', header: 'السعر الإجمالي', width: 110, render: (p) => <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{fmtCurrency(p.price)}</Text> },
    { key: 'perHead', header: t.purchases.pricePerHead, width: 100, render: (p) => <Text style={{ color: colors.textMuted }}>{p.count > 0 ? fmtCurrency(Math.round(p.price / p.count)) : '-'}</Text> },
    { key: 'seller', header: t.purchases.seller, width: 110, render: (p) => <Text style={{ color: colors.textPrimary }} numberOfLines={1}>{p.seller || '-'}</Text> },
    { key: 'notes', header: t.common.notes, width: 130, render: (p) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }} numberOfLines={1}>{p.notes || '-'}</Text> },
    {
      key: 'actions', header: '', width: 90,
      render: (p) => (
        <View style={{ flexDirection: 'row-reverse', gap: 6 }}>
          <AppButton icon="✏️" variant="icon" size="sm" onPress={() => openEditModal(p)} />
          <AppButton icon="🗑️" variant="icon" size="sm" onPress={() => setConfirmDeleteId(p.id)} />
        </View>
      ),
    },
  ];

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <ScreenHeader
        title={`🛒 ${t.purchases.title}`}
        subtitle={t.purchases.subtitle}
        actions={<AppButton label={t.purchases.add} icon="➕" onPress={openAddModal} />}
      />

      <SearchFilterBar value={search} onChange={setSearch}>
        <FormSelect label="" value={typeFilter || t.common.all} options={[t.common.all, ...ANIMAL_TYPES]}
          onChange={(v) => setTypeFilter(v === t.common.all ? '' : v)} />
      </SearchFilterBar>

      <Card noPadding>
        <DataTable columns={columns} data={filtered} keyExtractor={(p) => p.id} />
      </Card>

      <AppModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editId ? t.purchases.edit : t.purchases.add}
        icon="🛒"
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
        <FormInput label={t.purchases.totalPrice} value={price} onChangeText={setPrice} keyboardType="numeric" required />
        <FormInput label={t.purchases.seller} placeholder={t.purchases.sellerPlaceholder} value={seller} onChangeText={setSeller} />
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
