// ============================================
//  src/components/ScreenHeader.tsx
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, spacing } from '@/theme/metrics';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, actions }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg, gap: spacing.sm },
  titleBlock: { gap: 2 },
  title: { fontSize: fontSize.xl, fontWeight: '800', textAlign: 'right' },
  subtitle: { fontSize: fontSize.sm, textAlign: 'right' },
  actions: { flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' },
});
