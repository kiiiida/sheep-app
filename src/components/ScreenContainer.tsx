// ============================================
//  src/components/ScreenContainer.tsx
//  حاوية موحّدة لكل الشاشات: تمنع أي overflow أفقي
//  وتدعم سحب-للتحديث (pull to refresh) اختيارياً
// ============================================

import React from 'react';
import { ScrollView, StyleSheet, RefreshControl, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/metrics';

interface ScreenContainerProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  scroll?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children, onRefresh, refreshing = false, scroll = true,
}) => {
  const { colors } = useTheme();

  if (!scroll) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgBody }]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bgBody }}
      contentContainerStyle={styles.content}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.green600]} tintColor={colors.green600} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', overflow: 'hidden' },
  content: { padding: spacing.lg, width: '100%' },
});
