// ============================================
//  src/components/AppButton.tsx
// ============================================

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing, fontSize } from '@/theme/metrics';

type Variant = 'primary' | 'secondary' | 'danger' | 'icon';
type Size = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  label?: string;
  icon?: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label, icon, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, fullWidth = false,
}) => {
  const { colors } = useTheme();

  const bgMap: Record<Variant, string> = {
    primary: colors.green600,
    secondary: colors.bgCard,
    danger: colors.red600,
    icon: colors.bgInput,
  };
  const textColorMap: Record<Variant, string> = {
    primary: '#fff',
    secondary: colors.textPrimary,
    danger: '#fff',
    icon: colors.textSecondary,
  };
  const borderMap: Record<Variant, string> = {
    primary: 'transparent',
    secondary: colors.border,
    danger: 'transparent',
    icon: colors.border,
  };

  const paddingMap: Record<Size, { v: number; h: number; font: number }> = {
    sm: { v: 7, h: 12, font: fontSize.xs + 1 },
    md: { v: 10, h: 16, font: fontSize.sm + 1 },
    lg: { v: 13, h: 22, font: fontSize.md },
  };
  const p = paddingMap[size];

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.iconBtn,
          { backgroundColor: bgMap.icon, borderColor: borderMap.icon, opacity: disabled ? 0.5 : 1 },
          style,
        ]}
        activeOpacity={0.7}
      >
        {loading ? <ActivityIndicator size="small" color={textColorMap.icon} /> : <Text style={{ fontSize: 16 }}>{icon}</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        {
          backgroundColor: bgMap[variant],
          borderColor: borderMap[variant],
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          paddingVertical: p.v,
          paddingHorizontal: p.h,
          opacity: disabled ? 0.5 : 1,
          flex: fullWidth ? 1 : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColorMap[variant]} />
      ) : (
        <>
          {icon ? <Text style={{ fontSize: p.font + 2 }}>{icon}</Text> : null}
          {label ? (
            <Text style={[styles.label, { color: textColorMap[variant], fontSize: p.font }]}>{label}</Text>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontWeight: '600', textAlign: 'center' },
});
