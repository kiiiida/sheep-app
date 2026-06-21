// ============================================
//  src/screens/PartnersScreen.tsx
// ============================================

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { fmt, fmtCurrency, fmtDate, todayISO } from '@/utils/format';
import { t } from '@/locales/i18n';
import { spacing, fontSize, radius } from '@/theme/metrics';
import { PARTNER_COLORS } from '@/theme/colors';
import {
  getAllPartners, createPartner, updatePartner, deletePartner, getTotalCapital,
} from '@/services/partnersService';
import { calcFinancials } from '@/services/analyticsService';
import type { Partner, Financials } from '@/types';

export default function PartnersScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [totalCapital, setTotalCapital] = useState(0);
  const [financials, setFinancials] = useState<Financials | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [capital, setCapital] = useState('');
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const [list, cap, fin] = await Promise.all([getAllPartners(), getTotalCapital(), calcFinancials()]);
    setPartners(list);
    setTotalCapital(cap);
    setFinancials(fin);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setCapital('');
    setDate(todayISO());
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (p: Partner) => {
    setEditId(p.id);
    setName(p.name);
    setCapital(String(p.capital));
    setDate(p.date);
    setNotes(p.notes ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const capitalNum = Number(capital);
    if (!name.trim() || !capitalNum || !date) {
      showToast(t.common.requiredField, 'error');
      return;
    }
    if (capitalNum < 0) {
      showToast('رأس المال يجب أن يكون موجباً', 'error');
      return;
    }

    try {
      if (editId) {
        await updatePartner(editId, { name: name.trim(), capital: capitalNum, date, notes: notes.trim() });
        showToast(t.common.updateSuccess);
      } else {
        await createPartner({ name: name.trim(), capital: capitalNum, date, notes: notes.trim() });
        showToast('تم إضافة الشريك بنجاح');
      }
      setModalVisible(false);
      await loadData();
    } catch (e) {
      showToast(t.common.error, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId == null) return;
    await deletePartner(confirmDeleteId);
    showToast(t.common.deleteSuccess);
    setConfirmDeleteId(null);
    await loadData();
  };

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <ScreenHeader
        title={`🤝 ${t.partners.title}`}
        subtitle={t.partners.subtitle}
        actions={<AppButton label={t.partners.addPartner} icon="➕" onPress={openAddModal} />}
      />

      {/* الملخص المالي */}
      <View style={[styles.summaryBox, { backgroundColor: colors.green800 }]}>
        <View style={styles.summaryHeaderRow}>
          <View>
            <Text style={styles.summaryLabel}>{t.partners.capitalSummary}</Text>
            <Text style={styles.summaryValue}>{fmtCurrency(totalCapital)}</Text>
          </View>
          <Text style={{ fontSize: 36 }}>🤝</Text>
        </View>
        <View style={styles.summaryGrid}>
          <SummaryItem label={t.partners.totalSalesLabel} value={fmtCurrency(financials?.totalSales)} />
          <SummaryItem label={t.partners.totalExpensesLabel} value={fmtCurrency(financials?.totalExpenses)} />
          <SummaryItem
            label={t.partners.netProfitLabel}
            value={fmtCurrency(financials?.netProfit)}
            color={(financials?.netProfit ?? 0) >= 0 ? '#a7f3d0' : '#fca5a5'}
          />
          <SummaryItem label={t.partners.partnersCountLabel} value={String(partners.length)} />
        </View>
      </View>

      {/* بطاقات الشركاء */}
      {partners.length === 0 ? (
        <Card><EmptyState icon="🤝" text={t.partners.noPartnersYet} subText="" /></Card>
      ) : (
        <View style={styles.cardsWrap}>
          {partners.map((p, i) => {
            const share = totalCapital > 0 ? (p.capital / totalCapital) * 100 : 0;
            const profit = (financials?.netProfit ?? 0) > 0 ? ((financials!.netProfit) * share) / 100 : 0;
            const color = PARTNER_COLORS[i % PARTNER_COLORS.length];
            return (
              <View key={p.id} style={[styles.partnerCard, { backgroundColor: colors.bgCard, borderColor: colors.border, borderTopColor: color }]}>
                <View style={[styles.avatar, { backgroundColor: color }]}>
                  <Text style={styles.avatarText}>{p.name.charAt(0)}</Text>
                </View>
                <Text style={[styles.partnerName, { color: colors.textPrimary }]}>{p.name}</Text>
                <Text style={[styles.partnerSince, { color: colors.textMuted }]}>{t.partners.memberSince} {fmtDate(p.date)}</Text>

                <View style={[styles.shareTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.shareFill, { width: `${share}%`, backgroundColor: color }]} />
                </View>
                <Text style={[styles.sharePercentText, { color: colors.textMuted }]}>{share.toFixed(1)}% من رأس المال</Text>

                <View style={styles.statsRow}>
                  <View style={[styles.statBox, { backgroundColor: colors.bgInput }]}>
                    <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>{t.partners.capital}</Text>
                    <Text style={[styles.statBoxValue, { color: colors.textPrimary }]}>{fmtCurrency(p.capital)}</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: colors.bgInput }]}>
                    <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>{t.partners.profitDue}</Text>
                    <Text style={[styles.statBoxValue, { color: profit >= 0 ? colors.green600 : colors.red600 }]}>{fmtCurrency(profit)}</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <AppButton label={t.common.edit} icon="✏️" variant="secondary" size="sm" onPress={() => openEditModal(p)} fullWidth />
                  <AppButton icon="🗑️" variant="danger" size="sm" onPress={() => setConfirmDeleteId(p.id)} />
                </View>

                {p.notes ? (
                  <Text style={[styles.partnerNotes, { color: colors.textMuted, borderTopColor: colors.border }]}>{p.notes}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {/* نموذج الإضافة/التعديل */}
      <AppModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editId ? t.partners.editPartner : t.partners.addPartner}
        icon="🤝"
        footer={
          <>
            <AppButton label={t.common.save} icon="💾" onPress={handleSave} fullWidth />
            <AppButton label={t.common.cancel} variant="secondary" onPress={() => setModalVisible(false)} fullWidth />
          </>
        }
      >
        <FormInput label={t.partners.name} placeholder={t.partners.namePlaceholder} value={name} onChangeText={setName} required />
        <FormInput label={t.partners.capital} value={capital} onChangeText={setCapital} keyboardType="numeric" required />
        <FormDateInput label={t.partners.addedDate} value={date} onChange={setDate} required />
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

const SummaryItem: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryItemLabel}>{label}</Text>
    <Text style={[styles.summaryItemValue, color ? { color } : null]} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  summaryBox: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  summaryHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.75)', fontSize: fontSize.sm, textAlign: 'right' },
  summaryValue: { color: '#fff', fontSize: fontSize.xl, fontWeight: '800', marginTop: 4, textAlign: 'right' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  summaryItem: { flexBasis: '47%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.md, padding: 11 },
  summaryItemLabel: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.xs, textAlign: 'right' },
  summaryItemValue: { color: '#fff', fontSize: fontSize.md, fontWeight: '800', marginTop: 3, textAlign: 'right' },
  cardsWrap: { gap: spacing.md },
  partnerCard: { borderRadius: radius.lg, borderWidth: 1, borderTopWidth: 3, padding: spacing.lg },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: fontSize.lg },
  partnerName: { fontSize: fontSize.md, fontWeight: '700', textAlign: 'right' },
  partnerSince: { fontSize: fontSize.xs, marginTop: 2, textAlign: 'right' },
  shareTrack: { height: 7, borderRadius: radius.full, overflow: 'hidden', marginTop: 10 },
  shareFill: { height: '100%', borderRadius: radius.full },
  sharePercentText: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  statBox: { flex: 1, borderRadius: radius.sm, padding: 9 },
  statBoxLabel: { fontSize: 10, textAlign: 'right' },
  statBoxValue: { fontSize: fontSize.sm, fontWeight: '700', marginTop: 2, textAlign: 'right' },
  actionsRow: { flexDirection: 'row-reverse', gap: 6, marginTop: 12 },
  partnerNotes: { fontSize: 12, marginTop: 10, paddingTop: 10, borderTopWidth: 1, textAlign: 'right' },
});
