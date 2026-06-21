// ============================================
//  src/components/DataTable.tsx
//  جدول عام: رأس ثابت + صفوف قابلة للتمرير + تمرير أفقي عند الحاجة
// ============================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, spacing } from '@/theme/metrics';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width: number; // عرض ثابت بالبكسل لكل عمود لضمان التمرير الأفقي الصحيح
  render: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
}

export function DataTable<T>({ columns, data, keyExtractor }: DataTableProps<T>) {
  const { colors } = useTheme();
  const totalWidth = columns.reduce((s, c) => s + c.width, 0);

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <View style={{ width: totalWidth }}>
        {/* رأس الجدول */}
        <View style={[styles.headerRow, { backgroundColor: colors.green50, borderBottomColor: colors.border }]}>
          {columns.map(col => (
            <Text
              key={col.key}
              style={[styles.headerCell, { width: col.width, color: colors.green700 }]}
              numberOfLines={1}
            >
              {col.header}
            </Text>
          ))}
        </View>

        {/* صفوف البيانات */}
        {data.map((item, index) => (
          <View
            key={keyExtractor(item)}
            style={[
              styles.row,
              { borderBottomColor: colors.border },
              index === data.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            {columns.map(col => (
              <View key={col.key} style={{ width: col.width, paddingHorizontal: spacing.sm }}>
                {col.render(item, index)}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row-reverse',
    paddingVertical: 11,
    borderBottomWidth: 2,
  },
  headerCell: {
    fontSize: fontSize.xs + 1,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row-reverse',
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
});
