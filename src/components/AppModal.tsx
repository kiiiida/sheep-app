// ============================================
//  src/components/AppModal.tsx
//  نافذة منبثقة موحّدة تُستخدم في كل شاشات النماذج
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing, fontSize } from '@/theme/metrics';

interface AppModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AppModal: React.FC<AppModalProps> = ({ isVisible, onClose, title, icon, children, footer }) => {
  const { colors } = useTheme();

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard
      propagateSwipe
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { backgroundColor: colors.bgCard }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {icon ? `${icon} ` : ''}{title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ fontSize: 18, color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ padding: spacing.lg }}>
            {children}
          </ScrollView>

          {footer ? (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>{footer}</View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  title: { fontSize: fontSize.lg, fontWeight: '800', textAlign: 'right' },
  closeBtn: { padding: 4 },
  body: { maxHeight: 500 },
  footer: {
    flexDirection: 'row-reverse',
    gap: 8,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
});
