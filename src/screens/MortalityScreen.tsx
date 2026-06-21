// ============================================
//  src/screens/MortalityScreen.tsx
// ============================================

import React, { useState, useCallback } from 'react';
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
import { DataTable, ColumnDef } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { fmtDate, todayISO } from '@/utils/format';
import { t } from '@/locales/i18n';
import { fontSize } from '@/theme/metrics';
import { getAllMortality, createMortality, updateMortality, deleteMortality } from '@/services/mortalityService';
import { calcFlockCount } from '@/services/analyticsService';
import type { Mortality, MortalityCause } from '@/types';

const CAUSES: MortalityCause[] = ['مرض', 'حادث', 'برد شديد', 'حرارة شديدة', 'ولادة', 'افتراس', 'سبب مجهول', 'أخرى'];

export default function MortalityScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [items, setItems] = useState<Mortality[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [date, setDate] = useState(todayISO());
  const [count, setCount] = useState('');
  const [cause, setCause] = useState<MortalityCause>('مرض');
  const [notes, setNotes] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setItems(await getAllMortality());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditId(null);
    setDate(todayISO());
    setCount('');
    setCause('مرض');
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (m: Mortality) => {
    setEditId(m.id);
    setDate(m.date);
    setCount(String(m.count));
    setCause(m.cause);
    setNotes(m.notes ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const countNum = Number(count);
    if (!date || !countNum || countNum <= 0) {
      showToast(t.common.requiredField, 'error');
      return;
    }

    if (!editId) {
      const flockNow = await calcFlockCount();
      if (countNum > flockNow) {
        showToast(`لا يمكن تسجيل نفوق ${countNum} رأس، القطيع الحالي: ${flockNow} رأس`, 'error');
        return;
      }
    }

    try {
      if (editId) {
        await updateMortality(editId, { date, count: countNum, cause, notes: notes.trim() });
        showToast(t.common.updateSuccess);
      } else {
        await createMortality({ date, count: countNum, cause, notes: notes.trim() });
        showToast(`تم تسجيل نفوق ${countNum} رأس`, 'warning');
      }
      setModalVisible(false);
      await loadData();
    } catch {
      showToast(t.common.error, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId == null) return;
    await deleteMortality(confirmDeleteId);
    showToast(t.common.deleteSuccess);
    setConfirmDeleteId(null);
    await loadData();
  };

  const columns: ColumnDef<Mortality>[] = [
    { key: 'date', header: t.common.date, width: 90, render: (m) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{fmtDate(m.date)}</Text> },
    { key: 'count', header: t.common.count, width: 70, render: (m) => <Text style={{ color: colors.red600, fontWeight: '700' }}>{m.count}</Text> },
    { key: 'cause', header: t.mortality.cause, width: 110, render: (m) => <Badge text={m.cause} color="red" /> },
    { key: 'notes', header: t.common.notes, width: 150, render: (m) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }} numberOfLines={1}>{m.notes || '-'}</Text> },
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
        title={`💔 ${t.mortality.title}`}
        subtitle={t.mortality.subtitle}
        actions={<AppButton label={t.mortality.add} icon="➕" onPress={openAddModal} />}
      />

      <Card noPadding>
        <DataTable columns={columns} data={items} keyExtractor={(m) => m.id} />
      </Card>

      <AppModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editId ? t.mortality.edit : t.mortality.add}
        icon="💔"
        footer={
          <>
            <AppButton label={t.common.save} icon="💾" onPress={handleSave} fullWidth />
            <AppButton label={t.common.cancel} variant="secondary" onPress={() => setModalVisible(false)} fullWidth />
          </>
        }
      >
        <FormDateInput label={t.common.date} value={date} onChange={setDate} required />
        <FormInput label={t.common.count} value={count} onChangeText={setCount} keyboardType="numeric" required />
        <FormSelect label={t.mortality.cause} value={cause} options={CAUSES} onChange={(v) => setCause(v as MortalityCause)} required />
        <FormInput label={t.common.notes} placeholder="تفاصيل إضافية..." value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
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
