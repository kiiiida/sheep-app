// ============================================
//  src/components/EmptyState.tsx
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, spacing } from '@/theme/metrics';
import { t } from '@/locales/i18n';

interface EmptyStateProps {
  icon?: string;
  text?: string;
  subText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📋', text, subText }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.text, { color: colors.textMuted }]}>{text ?? t.common.noData}</Text>
      <Text style={[styles.subText, { color: colors.textMuted }]}>{subText ?? t.common.noDataSub}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxl * 1.5, gap: 6 },
  icon: { fontSize: 40, marginBottom: 4 },
  text: { fontSize: fontSize.md, fontWeight: '600' },
  subText: { fontSize: fontSize.sm },
});
