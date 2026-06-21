// ============================================
//  src/components/Badge.tsx
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius } from '@/theme/metrics';

type BadgeColor = 'green' | 'red' | 'amber' | 'blue' | 'gold';

interface BadgeProps {
  text: string;
  color?: BadgeColor;
}

export const Badge: React.FC<BadgeProps> = ({ text, color = 'green' }) => {
  const { colors } = useTheme();

  const bgMap: Record<BadgeColor, string> = {
    green: colors.green100,
    red: colors.red100,
    amber: colors.amber100,
    blue: colors.blue100,
    gold: '#fef3c7',
  };
  const textMap: Record<BadgeColor, string> = {
    green: colors.green700,
    red: colors.red600,
    amber: colors.amber600,
    blue: colors.blue600,
    gold: '#92400e',
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[color] }]}>
      <Text style={[styles.text, { color: textMap[color] }]} numberOfLines={1}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '700' },
});
