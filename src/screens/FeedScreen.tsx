// ============================================
//  src/screens/FeedScreen.tsx
// ============================================

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { fmt, fmtCurrency } from '@/utils/format';
import { t } from '@/locales/i18n';
import { spacing, fontSize, radius } from '@/theme/metrics';
import { getAllFeedStock, createFeedStock, updateFeedStock, deleteFeedStock } from '@/services/feedService';
import type { FeedStock, FeedType, FeedUnit } from '@/types';

const FEED_TYPES: FeedType[] = ['شعير', 'تبن', 'علف مركب', 'ذرة', 'نخالة', 'أخرى'];
const FEED_UNITS: FeedUnit[] = ['كغ', 'طن', 'قنطار', 'كيس', 'بالة'];
const FEED_ICONS: Record<string, string> = { 'شعير': '🌾', 'تبن': '🌿', 'علف مركب': '🥦', 'ذرة': '🌽', 'نخالة': '🌾', 'أخرى': '🌱' };

export default function FeedScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [stock, setStock] = useState<FeedStock[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [type, setType] = useState<FeedType>('شعير');
  const [unit, setUnit] = useState<FeedUnit>('كغ');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [alertQty, setAlertQty] = useState('');
  const [notes, setNotes] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setStock(await getAllFeedStock());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditId(null);
    setType('شعير');
    setUnit('كغ');
    setQty('');
    setPrice('');
    setAlertQty('');
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (f: FeedStock) => {
    setEditId(f.id);
    setType(f.type);
    setUnit(f.unit);
    setQty(String(f.qty));
    setPrice(String(f.price));
    setAlertQty(String(f.alertQty));
    setNotes(f.notes ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const qtyNum = Number(qty) || 0;
    if (qtyNum < 0) {
      showToast('الكمية لا يمكن أن تكون سالبة', 'error');
      return;
    }

    const input = {
      type, unit,
      qty: qtyNum,
      price: Number(price) || 0,
      alertQty: Number(alertQty) || 0,
      notes: notes.trim(),
    };

    try {
      if (editId) {
        await updateFeedStock(editId, input);
        showToast(t.common.updateSuccess);
      } else {
        await createFeedStock(input);
        showToast(`تم إضافة ${type} للمخزون 🌾`);
      }
      if (input.alertQty && qtyNum <= input.alertQty) {
        showToast(`⚠️ تنبيه: مخزون ${type} منخفض جداً!`, 'warning');
      }
      setModalVisible(false);
      await loadData();
    } catch {
      showToast(t.common.error, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId == null) return;
    await deleteFeedStock(confirmDeleteId);
    showToast(t.common.deleteSuccess);
    setConfirmDeleteId(null);
    await loadData();
  };

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <ScreenHeader
        title={`🌾 ${t.feed.title}`}
        subtitle={t.feed.subtitle}
        actions={<AppButton label={t.feed.add} icon="➕" onPress={openAddModal} />}
      />

      {stock.length === 0 ? (
        <Card><EmptyState icon="🌾" text={t.feed.noStockYet} subText="" /></Card>
      ) : (
        <View style={styles.cardsWrap}>
          {stock.map(f => {
            const isLow = f.alertQty > 0 && f.qty <= f.alertQty;
            const pct = f.alertQty > 0 ? Math.min(100, Math.round((f.qty / f.alertQty) * 50)) : 70;
            const fillColor = f.qty === 0 ? colors.red600 : isLow ? colors.amber600 : colors.green500;

            return (
              <View key={f.id} style={[styles.feedCard, { backgroundColor: colors.bgCard, borderColor: colors.border, borderTopColor: isLow ? colors.amber600 : colors.green600 }]}>
                <Text style={{ fontSize: 26, marginBottom: 6 }}>{FEED_ICONS[f.type] ?? '🌿'}</Text>
                <Text style={[styles.feedName, { color: colors.textPrimary }]}>{f.type}</Text>
                {f.notes ? <Text style={[styles.feedNotes, { color: colors.textMuted }]} numberOfLines={1}>{f.notes}</Text> : null}

                <View style={styles.qtyRow}>
                  <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>الكمية المتاحة</Text>
                  <Badge text={isLow ? `⚠️ ${t.feed.statusLow}` : `✓ ${t.feed.statusOk}`} color={isLow ? 'amber' : 'green'} />
                </View>
                <Text style={[styles.qtyValue, { color: colors.textPrimary }]}>
                  {fmt(f.qty)} <Text style={{ fontSize: fontSize.sm, fontWeight: '400' }}>{f.unit}</Text>
                </Text>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: fillColor }]} />
                </View>
                {f.alertQty > 0 ? (
                  <Text style={[styles.alertText, { color: colors.textMuted }]}>حد التنبيه: {f.alertQty} {f.unit}</Text>
                ) : null}
                {f.price > 0 ? (
                  <Text style={[styles.priceText, { color: colors.textMuted }]}>سعر الشراء: {fmtCurrency(f.price)}</Text>
                ) : null}

                <View style={styles.actionsRow}>
                  <AppButton label={t.common.edit} icon="✏️" variant="secondary" size="sm" onPress={() => openEditModal(f)} fullWidth />
                  <AppButton icon="🗑️" variant="danger" size="sm" onPress={() => setConfirmDeleteId(f.id)} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      <AppModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editId ? t.feed.edit : t.feed.add}
        icon="🌾"
        footer={
          <>
            <AppButton label={t.common.save} icon="💾" onPress={handleSave} fullWidth />
            <AppButton label={t.common.cancel} variant="secondary" onPress={() => setModalVisible(false)} fullWidth />
          </>
        }
      >
        <FormSelect label={t.feed.type} value={type} options={FEED_TYPES} onChange={(v) => setType(v as FeedType)} required />
        <FormSelect label={t.feed.unit} value={unit} options={FEED_UNITS} onChange={(v) => setUnit(v as FeedUnit)} required />
        <FormInput label={t.feed.quantity} value={qty} onChangeText={setQty} keyboardType="numeric" required />
        <FormInput label={t.feed.purchasePrice} value={price} onChangeText={setPrice} keyboardType="numeric" />
        <FormInput label={t.feed.alertThreshold} placeholder={t.feed.alertPlaceholder} value={alertQty} onChangeText={setAlertQty} keyboardType="numeric" />
        <FormInput label={t.common.notes} placeholder="ملاحظات إضافية..." value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
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

const styles = StyleSheet.create({
  cardsWrap: { gap: spacing.md },
  feedCard: { borderRadius: radius.lg, borderWidth: 1, borderTopWidth: 3, padding: spacing.lg },
  feedName: { fontSize: fontSize.md, fontWeight: '700', textAlign: 'right' },
  feedNotes: { fontSize: fontSize.xs, textAlign: 'right' },
  qtyRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  qtyLabel: { fontSize: fontSize.xs },
  qtyValue: { fontSize: fontSize.xl, fontWeight: '800', marginTop: 4, textAlign: 'right' },
  progressTrack: { height: 7, borderRadius: radius.full, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', borderRadius: radius.full },
  alertText: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  priceText: { fontSize: fontSize.xs, marginTop: 8, textAlign: 'right' },
  actionsRow: { flexDirection: 'row-reverse', gap: 6, marginTop: 12 },
});
