// ============================================
//  src/components/FormSelect.tsx
//  منتقي اختيار بسيط (Bottom Sheet خفيف) بدلاً من <select> الويب
// ============================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing, fontSize } from '@/theme/metrics';

interface FormSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, value, options, onChange, required }) => {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}{required ? <Text style={{ color: colors.red600 }}> *</Text> : null}
      </Text>
      <TouchableOpacity
        style={[styles.selectBox, { backgroundColor: colors.bgInput, borderColor: colors.border }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.base }}>{value || '—'}</Text>
        <Text style={{ color: colors.textMuted }}>▾</Text>
      </TouchableOpacity>

      <Modal
        isVisible={open}
        onBackdropPress={() => setOpen(false)}
        onBackButtonPress={() => setOpen(false)}
        style={styles.modal}
        backdropOpacity={0.5}
      >
        <View style={[styles.sheet, { backgroundColor: colors.bgCard }]}>
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>{label}</Text>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  { borderBottomColor: colors.border },
                  item === value && { backgroundColor: colors.green50 },
                ]}
                onPress={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                <Text style={{
                  color: item === value ? colors.green700 : colors.textPrimary,
                  fontWeight: item === value ? '700' : '400',
                  fontSize: fontSize.base,
                }}>
                  {item}
                </Text>
                {item === value ? <Text style={{ color: colors.green600 }}>✓</Text> : null}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: 5, textAlign: 'right' },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  modal: { justifyContent: 'flex-end', margin: 0 },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  sheetHeader: { padding: spacing.lg, borderBottomWidth: 1 },
  sheetTitle: { fontSize: fontSize.lg, fontWeight: '800', textAlign: 'right' },
  option: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});
