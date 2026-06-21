// ============================================
//  src/components/Card.tsx
// ============================================

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing, fontSize, shadow } from '@/theme/metrics';

interface CardProps {
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, headerRight, children, style, noPadding = false }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }, shadow.sm, style]}>
      {title ? (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {headerRight}
        </View>
      ) : null}
      <View style={noPadding ? undefined : styles.body}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: { fontSize: fontSize.md, fontWeight: '700', textAlign: 'right' },
  body: { padding: spacing.lg },
});
