// ============================================
//  src/navigation/CustomHeader.tsx
//  رأس موحّد لكل الشاشات: زر القائمة (☰) + العنوان
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, spacing } from '@/theme/metrics';

interface CustomHeaderProps {
  title: string;
  onMenuPress: () => void;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({ title, onMenuPress }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgHeader,
          borderBottomColor: colors.border,
          paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 6),
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
      <TouchableOpacity
        onPress={onMenuPress}
        style={[styles.menuBtn, { borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 18, color: colors.textPrimary }}>☰</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: fontSize.lg, fontWeight: '700', flex: 1, textAlign: 'right', marginRight: 10 },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
