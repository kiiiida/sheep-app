// ============================================
//  src/screens/MedicinesScreen.tsx
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
import { FormDateInput } from '@/components/FormDateInput';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { DataTable, ColumnDef } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { fmtCurrency, fmtDate, todayISO } from '@/utils/format';
import { t } from '@/locales/i18n';
import { fontSize } from '@/theme/metrics';
import { getAllMedicines, createMedicine, updateMedicine, deleteMedicine } from '@/services/medicinesService';
import type { Medicine } from '@/types';

export default function MedicinesScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [buyDate, setBuyDate] = useState(todayISO());
  const [expDate, setExpDate] = useState('');
  const [notes, setNotes] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setMedicines(await getAllMedicines());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return medicines;
    const q = search.toLowerCase();
    return medicines.filter(m => m.name.toLowerCase().includes(q));
  }, [medicines, search]);

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setQty('');
    setPrice('');
    setBuyDate(todayISO());
    setExpDate('');
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (m: Medicine) => {
    setEditId(m.id);
    setName(m.name);
    setQty(String(m.qty));
    setPrice(String(m.price));
    setBuyDate(m.buyDate ?? '');
    setExpDate(m.expDate ?? '');
    setNotes(m.notes ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('يرجى إدخال اسم الدواء', 'error');
      return;
    }

    try {
      const input = {
        name: name.trim(),
        qty: Number(qty) || 0,
        price: Number(price) || 0,
        buyDate: buyDate || undefined,
        expDate: expDate || undefined,
        notes: notes.trim(),
      };
      if (editId) {
        await updateMedicine(editId, input);
        showToast(t.common.updateSuccess);
      } else {
        await createMedicine(input);
        showToast(`تم إضافة ${name.trim()} للمخزون 💊`);
      }
      setModalVisible(false);
      await loadData();
    } catch {
      showToast(t.common.error, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId == null) return;
    await deleteMedicine(confirmDeleteId);
    showToast(t.common.deleteSuccess);
    setConfirmDeleteId(null);
    await loadData();
  };

  const getStatus = (m: Medicine): { text: string; color: 'green' | 'amber' | 'red' } => {
    if (!m.expDate) return { text: t.medicines.statusGood, color: 'green' };
    const daysLeft = Math.ceil((new Date(m.expDate).getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return { text: `${t.medicines.statusExpired} ⚠️`, color: 'red' };
    if (daysLeft <= 30) return { text: `${t.medicines.statusExpiringSoon} ${daysLeft}${t.medicines.days[0]}`, color: 'amber' };
    return { text: t.medicines.statusGood, color: 'green' };
  };

  const columns: ColumnDef<Medicine>[] = [
    { key: 'name', header: t.medicines.name, width: 130, render: (m) => <Text style={{ color: colors.textPrimary, fontWeight: '700' }} numberOfLines={1}>{m.name}</Text> },
    { key: 'qty', header: t.medicines.quantity, width: 70, render: (m) => <Text style={{ color: colors.textPrimary }}>{m.qty || '-'}</Text> },
    { key: 'price', header: t.medicines.price, width: 100, render: (m) => <Text style={{ color: colors.textPrimary }}>{m.price ? fmtCurrency(m.price) : '-'}</Text> },
    { key: 'buyDate', header: t.medicines.buyDate, width: 90, render: (m) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{fmtDate(m.buyDate)}</Text> },
    { key: 'expDate', header: t.medicines.expDate, width: 90, render: (m) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{fmtDate(m.expDate)}</Text> },
    {
      key: 'status', header: 'الحالة', width: 110,
      render: (m) => { const s = getStatus(m); return <Badge text={s.text} color={s.color} />; },
    },
    { key: 'notes', header: t.common.notes, width: 130, render: (m) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }} numberOfLines={1}>{m.notes || '-'}</Text> },
    {
      key: 'actions', header: '', width: 90,
      render: (m) => (
        <View style={{ flexDirection: 'row-reverse', gap: 6 }}>
          <AppButton icon="✏️" variant="icon" size="sm" onPress={() => openEditModal(m)} />
          <AppButton icon="🗑️" variant="icon" size="sm" onPress={() => setConfirmDeleteId(m.id)} />
        </View>
      ),
    },
  ];

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <ScreenHeader
        title={`💊 ${t.medicines.title}`}
        subtitle={t.medicines.subtitle}
        actions={<AppButton label={t.medicines.add} icon="➕" onPress={openAddModal} />}
      />

      <SearchFilterBar value={search} onChange={setSearch} placeholder="بحث بالاسم..." />

      <Card noPadding>
        <DataTable columns={columns} data={filtered} keyExtractor={(m) => m.id} />
      </Card>

      <AppModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editId ? t.medicines.edit : t.medicines.add}
        icon="💊"
        footer={
          <>
            <AppButton label={t.common.save} icon="💾" onPress={handleSave} fullWidth />
            <AppButton label={t.common.cancel} variant="secondary" onPress={() => setModalVisible(false)} fullWidth />
          </>
        }
      >
        <FormInput label={t.medicines.name} placeholder={t.medicines.namePlaceholder} value={name} onChangeText={setName} required />
        <FormInput label={t.medicines.quantity} value={qty} onChangeText={setQty} keyboardType="numeric" required />
        <FormInput label={t.medicines.price} value={price} onChangeText={setPrice} keyboardType="numeric" required />
        <FormDateInput label={t.medicines.buyDate} value={buyDate} onChange={setBuyDate} />
        <FormDateInput label={t.medicines.expDate} value={expDate} onChange={setExpDate} />
        <FormInput label={t.common.notes} placeholder={t.medicines.notesPlaceholder} value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
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
