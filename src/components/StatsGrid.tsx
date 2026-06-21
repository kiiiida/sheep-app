// ============================================
//  src/components/StatsGrid.tsx
//  شبكة متجاوبة تُحاكي repeat(auto-fit, minmax(140px,1fr)) من نسخة الويب
// ============================================

import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

interface StatsGridProps {
  children: React.ReactNode;
  minItemWidth?: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ children, minItemWidth = 140 }) => {
  const { width } = useWindowDimensions();
  const gap = 10;
  const horizontalPadding = 24; // padding الصفحة من الجانبين تقريباً
  const usableWidth = width - horizontalPadding;
  const columns = Math.max(2, Math.floor(usableWidth / (minItemWidth + gap)));

  const childrenArray = React.Children.toArray(children);

  return (
    <View style={styles.grid}>
      {childrenArray.map((child, index) => (
        <View
          key={index}
          style={{
            width: `${100 / columns}%`,
            paddingHorizontal: gap / 2,
            marginBottom: gap,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
});
