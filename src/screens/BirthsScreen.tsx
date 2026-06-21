// ============================================
//  src/screens/BirthsScreen.tsx
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
import { FormDateInput } from '@/components/FormDateInput';
import { DataTable, ColumnDef } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { StatsGrid } from '@/components/StatsGrid';
import { fmt, fmtDate, todayISO } from '@/utils/format';
import { t } from '@/locales/i18n';
import { fontSize } from '@/theme/metrics';
import { getAllBirths, createBirth, updateBirth, deleteBirth } from '@/services/birthsService';
import type { Birth } from '@/types';

export default function BirthsScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [births, setBirths] = useState<Birth[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [date, setDate] = useState(todayISO());
  const [males, setMales] = useState('0');
  const [females, setFemales] = useState('0');
  const [mother, setMother] = useState('');
  const [notes, setNotes] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setBirths(await getAllBirths());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalMales = births.reduce((s, b) => s + b.males, 0);
  const totalFemales = births.reduce((s, b) => s + b.females, 0);

  const openAddModal = () => {
    setEditId(null);
    setDate(todayISO());
    setMales('0');
    setFemales('0');
    setMother('');
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (b: Birth) => {
    setEditId(b.id);
    setDate(b.date);
    setMales(String(b.males));
    setFemales(String(b.females));
    setMother(b.mother ?? '');
    setNotes(b.notes ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const m = Number(males) || 0;
    const f = Number(females) || 0;
    if (!date) {
      showToast('يرجى اختيار التاريخ', 'error');
      return;
    }
    if (m + f === 0) {
      showToast('يرجى إدخال عدد المواليد', 'error');
      return;
    }

    try {
      if (editId) {
        await updateBirth(editId, { date, males: m, females: f, mother: mother.trim(), notes: notes.trim() });
        showToast(t.common.updateSuccess);
      } else {
        await createBirth({ date, males: m, females: f, mother: mother.trim(), notes: notes.trim() });
        showToast(`تم تسجيل ${m + f} مولود جديد 🐣`);
      }
      setModalVisible(false);
      await loadData();
    } catch {
      showToast(t.common.error, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId == null) return;
    await deleteBirth(confirmDeleteId);
    showToast(t.common.deleteSuccess);
    setConfirmDeleteId(null);
    await loadData();
  };

  const columns: ColumnDef<Birth>[] = [
    { key: 'date', header: t.common.date, width: 90, render: (b) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{fmtDate(b.date)}</Text> },
    { key: 'males', header: t.births.males, width: 70, render: (b) => <Badge text={String(b.males)} color="amber" /> },
    { key: 'females', header: t.births.females, width: 70, render: (b) => <Badge text={String(b.females)} color="blue" /> },
    { key: 'total', header: 'المجموع', width: 80, render: (b) => <Badge text={String(b.males + b.females)} color="green" /> },
    { key: 'mother', header: t.births.mother, width: 110, render: (b) => <Text style={{ color: colors.textPrimary }} numberOfLines={1}>{b.mother || '-'}</Text> },
    { key: 'notes', header: t.common.notes, width: 130, render: (b) => <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }} numberOfLines={1}>{b.notes || '-'}</Text> },
    {
      key: 'actions', header: '', width: 90,
      render: (b) => (
        <View style={{ flexDirection: 'row-reverse', gap: 6 }}>
          <AppButton icon="✏️" variant="icon" size="sm" onPress={() => openEditModal(b)} />
          <AppButton icon="🗑️" variant="icon" size="sm" onPress={() => setConfirmDeleteId(b.id)} />
        </View>
      ),
    },
  ];

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <ScreenHeader
        title={`🐣 ${t.births.title}`}
        subtitle={t.births.subtitle}
        actions={<AppButton label={t.births.add} icon="➕" onPress={openAddModal} />}
      />

      <StatsGrid>
        <StatCard icon="🐣" label={t.births.totalBirths} value={fmt(totalMales + totalFemales)} sub={t.common.head} color="green" />
        <StatCard icon="🐏" label={t.births.males} value={fmt(totalMales)} sub={t.common.head} color="amber" />
        <StatCard icon="🐑" label={t.births.females} value={fmt(totalFemales)} sub={t.common.head} color="blue" />
      </StatsGrid>

      <Card noPadding style={{ marginTop: 4 }}>
        <DataTable columns={columns} data={births} keyExtractor={(b) => b.id} />
      </Card>

      <AppModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editId ? t.births.edit : t.births.add}
        icon="🐣"
        footer={
          <>
            <AppButton label={t.common.save} icon="💾" onPress={handleSave} fullWidth />
            <AppButton label={t.common.cancel} variant="secondary" onPress={() => setModalVisible(false)} fullWidth />
          </>
        }
      >
        <FormDateInput label={t.common.date} value={date} onChange={setDate} required />
        <FormInput label={t.births.malesCount} value={males} onChangeText={setMales} keyboardType="numeric" required />
        <FormInput label={t.births.femalesCount} value={females} onChangeText={setFemales} keyboardType="numeric" required />
        <FormInput label={t.births.mother} placeholder={t.births.motherPlaceholder} value={mother} onChangeText={setMother} />
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
