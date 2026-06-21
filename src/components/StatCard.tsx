// ============================================
//  src/components/StatCard.tsx
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing, fontSize, shadow } from '@/theme/metrics';

type StatColor = 'green' | 'gold' | 'red' | 'blue' | 'amber';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color?: StatColor;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub, color = 'green' }) => {
  const { colors } = useTheme();

  const stripeColor: Record<StatColor, string> = {
    green: colors.green600,
    gold: colors.gold,
    red: colors.red600,
    blue: colors.blue600,
    amber: colors.amber600,
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }, shadow.sm]}>
      <View style={[styles.stripe, { backgroundColor: stripeColor[color] }]} />
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>{label}</Text>
      <Text style={[styles.value, { color: colors.textPrimary }]} numberOfLines={1}>{value}</Text>
      {sub ? <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={1}>{sub}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  stripe: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
  },
  icon: { fontSize: 22, marginBottom: 2 },
  label: { fontSize: fontSize.xs, fontWeight: '500', textAlign: 'right' },
  value: { fontSize: fontSize.xl, fontWeight: '800', textAlign: 'right' },
  sub: { fontSize: fontSize.xs - 1, textAlign: 'right' },
});
