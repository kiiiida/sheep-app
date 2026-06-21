// ============================================
//  src/components/FormInput.tsx
// ============================================

import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing, fontSize } from '@/theme/metrics';

interface FormInputProps extends TextInputProps {
  label: string;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({ label, required, style, ...rest }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}{required ? <Text style={{ color: colors.red600 }}> *</Text> : null}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.bgInput,
            borderColor: colors.border,
            color: colors.textPrimary,
            textAlign: 'right',
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: 5, textAlign: 'right' },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fontSize.base,
  },
});
