// ============================================
//  src/navigation/RootNavigator.tsx
//  Drawer Navigator يربط الشريط الجانبي بكل الشاشات
// ============================================

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { I18nManager } from 'react-native';
import { DrawerContent } from './DrawerContent';
import { CustomHeader } from './CustomHeader';
import { useTheme } from '@/theme/ThemeContext';
import { t } from '@/locales/i18n';

import DashboardScreen from '@/screens/DashboardScreen';
import PartnersScreen from '@/screens/PartnersScreen';
import PurchasesScreen from '@/screens/PurchasesScreen';
import SalesScreen from '@/screens/SalesScreen';
import BirthsScreen from '@/screens/BirthsScreen';
import MortalityScreen from '@/screens/MortalityScreen';
import ExpensesScreen from '@/screens/ExpensesScreen';
import MedicinesScreen from '@/screens/MedicinesScreen';
import FeedScreen from '@/screens/FeedScreen';
import ReportsScreen from '@/screens/ReportsScreen';
import BackupScreen from '@/screens/BackupScreen';

const Drawer = createDrawerNavigator();

const SCREENS: { name: string; component: React.ComponentType<any>; title: string }[] = [
  { name: 'Dashboard', component: DashboardScreen, title: t.nav.dashboard },
  { name: 'Purchases', component: PurchasesScreen, title: t.nav.purchases },
  { name: 'Sales', component: SalesScreen, title: t.nav.sales },
  { name: 'Births', component: BirthsScreen, title: t.nav.births },
  { name: 'Mortality', component: MortalityScreen, title: t.nav.mortality },
  { name: 'Expenses', component: ExpensesScreen, title: t.nav.expenses },
  { name: 'Partners', component: PartnersScreen, title: t.nav.partners },
  { name: 'Medicines', component: MedicinesScreen, title: t.nav.medicines },
  { name: 'Feed', component: FeedScreen, title: t.nav.feed },
  { name: 'Reports', component: ReportsScreen, title: t.nav.reports },
  { name: 'Backup', component: BackupScreen, title: t.nav.backup },
];

export const RootNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Dashboard"
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={({ navigation, route }) => ({
          // الشريط الجانبي يظهر من اليمين لأن التطبيق RTL
          drawerPosition: I18nManager.isRTL ? 'right' : 'left',
          drawerStyle: { width: 270 },
          header: () => {
            const screenDef = SCREENS.find(s => s.name === route.name);
            return (
              <CustomHeader
                title={screenDef?.title ?? route.name}
                onMenuPress={() => navigation.toggleDrawer()}
              />
            );
          },
          sceneContainerStyle: { backgroundColor: colors.bgBody },
          swipeEdgeWidth: 40,
        })}
      >
        {SCREENS.map(screen => (
          <Drawer.Screen key={screen.name} name={screen.name} component={screen.component} />
        ))}
      </Drawer.Navigator>
    </NavigationContainer>
  );
};
