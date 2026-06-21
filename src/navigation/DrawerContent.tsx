// ============================================
//  src/navigation/DrawerContent.tsx
//  محتوى الشريط الجانبي: شعار التطبيق + قائمة الأقسام + تبديل الثيم
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useTheme } from '@/theme/ThemeContext';
import { t } from '@/locales/i18n';
import { fontSize, spacing, radius } from '@/theme/metrics';

interface NavItem {
  route: string;
  icon: string;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  { title: t.nav.sectionMain, items: [{ route: 'Dashboard', icon: '📊', label: t.nav.dashboard }] },
  {
    title: t.nav.sectionFlock,
    items: [
      { route: 'Purchases', icon: '🛒', label: t.nav.purchases },
      { route: 'Sales', icon: '💰', label: t.nav.sales },
      { route: 'Births', icon: '🐣', label: t.nav.births },
      { route: 'Mortality', icon: '💔', label: t.nav.mortality },
    ],
  },
  {
    title: t.nav.sectionFinance,
    items: [
      { route: 'Expenses', icon: '📋', label: t.nav.expenses },
      { route: 'Partners', icon: '🤝', label: t.nav.partners },
    ],
  },
  {
    title: t.nav.sectionStock,
    items: [
      { route: 'Medicines', icon: '💊', label: t.nav.medicines },
      { route: 'Feed', icon: '🌾', label: t.nav.feed },
    ],
  },
  {
    title: t.nav.sectionAnalysis,
    items: [
      { route: 'Reports', icon: '📈', label: t.nav.reports },
      { route: 'Backup', icon: '💾', label: t.nav.backup },
    ],
  },
];

export const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { state, navigation } = props;
  const { colors, mode, toggleTheme } = useTheme();
  const activeRouteName = state.routes[state.index]?.name;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSidebar }]}>
      <View style={styles.logoRow}>
        <Text style={styles.logoIcon}>🐑</Text>
        <View>
          <Text style={styles.logoTitle}>{t.app.name}</Text>
          <Text style={styles.logoSubtitle}>إدارة الأغنام والشراكة</Text>
        </View>
      </View>

      <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
        {SECTIONS.map(section => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map(item => {
              const active = activeRouteName === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => navigation.navigate(item.route)}
                  activeOpacity={0.7}
                >
                  {active ? <View style={styles.activeIndicator} /> : null}
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme} activeOpacity={0.7}>
          <Text style={{ fontSize: 16 }}>{mode === 'dark' ? '☀️' : '🌙'}</Text>
          <Text style={styles.themeLabel}>{mode === 'dark' ? t.theme.light : t.theme.dark}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logoIcon: { fontSize: 30 },
  logoTitle: { color: '#fff', fontSize: fontSize.md, fontWeight: '800', textAlign: 'right' },
  logoSubtitle: { color: '#95d5b2', fontSize: fontSize.xs, textAlign: 'right', marginTop: 2 },
  menu: { flex: 1, paddingTop: 8 },
  sectionTitle: {
    color: '#74c69d',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    textAlign: 'right',
  },
  navItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 1,
    borderRadius: radius.md,
    position: 'relative',
  },
  navItemActive: { backgroundColor: 'rgba(82,183,136,0.18)' },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '25%',
    bottom: '25%',
    width: 3,
    backgroundColor: '#74c69d',
    borderRadius: 3,
  },
  navIcon: { fontSize: 17, width: 22, textAlign: 'center' },
  navLabel: { color: '#d8f3dc', fontSize: fontSize.sm, fontWeight: '500', textAlign: 'right', flex: 1 },
  navLabelActive: { color: '#fff', fontWeight: '700' },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  themeBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  themeLabel: { color: '#d8f3dc', fontSize: fontSize.sm },
});
