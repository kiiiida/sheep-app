// ============================================
//  src/components/ConfirmDialog.tsx
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing, fontSize } from '@/theme/metrics';
import { AppButton } from './AppButton';
import { t } from '@/locales/i18n';

interface ConfirmDialogProps {
  isVisible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isVisible, message, onConfirm, onCancel, confirmLabel,
}) => {
  const { colors } = useTheme();

  return (
    <Modal isVisible={isVisible} onBackdropPress={onCancel} backdropOpacity={0.5}>
      <View style={[styles.box, { backgroundColor: colors.bgCard }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>⚠️ {t.common.confirmDeleteTitle}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
        <View style={styles.actions}>
          <AppButton
            label={confirmLabel ?? t.common.delete}
            icon="🗑️"
            variant="danger"
            onPress={onConfirm}
            fullWidth
          />
          <AppButton label={t.common.cancel} variant="secondary" onPress={onCancel} fullWidth />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: { fontSize: fontSize.lg, fontWeight: '800', textAlign: 'right' },
  message: { fontSize: fontSize.base, textAlign: 'right', marginBottom: spacing.md, lineHeight: 21 },
  actions: { flexDirection: 'row-reverse', gap: 8 },
});
