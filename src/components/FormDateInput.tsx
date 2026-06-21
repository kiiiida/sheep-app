// ============================================
//  src/components/FormDateInput.tsx
//  حقل تاريخ: نص بصيغة YYYY-MM-DD + زر "اليوم"
//  (نتجنّب مكتبة DateTimePicker الإضافية للتبسيط، قابل للترقية لاحقاً)
// ============================================

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing, fontSize } from '@/theme/metrics';
import { todayISO } from '@/utils/format';

interface FormDateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const FormDateInput: React.FC<FormDateInputProps> = ({ label, value, onChange, required }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}{required ? <Text style={{ color: colors.red600 }}> *</Text> : null}
      </Text>
      <View style={[styles.row, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          keyboardType="numbers-and-punctuation"
          textAlign="right"
        />
        <TouchableOpacity onPress={() => onChange(todayISO())} style={styles.todayBtn}>
          <Text style={{ color: colors.green600, fontWeight: '700', fontSize: fontSize.xs }}>اليوم</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: 5, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 6,
  },
  input: { flex: 1, paddingHorizontal: 8, paddingVertical: 10, fontSize: fontSize.base },
  todayBtn: { paddingHorizontal: 10, paddingVertical: 6 },
});
