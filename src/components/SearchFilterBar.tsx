// ============================================
//  src/components/SearchFilterBar.tsx
// ============================================

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing, fontSize } from '@/theme/metrics';
import { t } from '@/locales/i18n';

interface SearchFilterBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode; // فلاتر إضافية (FormSelect, تاريخ، إلخ)
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ value, onChange, placeholder, children }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={[styles.searchWrap, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? t.common.search}
          placeholderTextColor={colors.textMuted}
          textAlign="right"
        />
        <View style={{ paddingLeft: 8 }}>
          <View style={{ opacity: 0.5 }} />
        </View>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.sm + 2,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, paddingVertical: 9, fontSize: fontSize.base },
});
