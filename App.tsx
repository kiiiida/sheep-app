// ============================================
//  App.tsx
//  نقطة دخول التطبيق: تهيئة قاعدة البيانات، فرض RTL،
//  وتغليف التطبيق بكل المزودين (Theme, Toast, Navigation)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { initDatabase } from '@/services/database';
import { enforceRTL } from '@/locales/i18n';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { ToastProvider } from '@/hooks/useToast';
import { RootNavigator } from '@/navigation/RootNavigator';

// فرض اتجاه RTL مرة واحدة عند إقلاع التطبيق
enforceRTL();

function AppContent() {
  const { colors, isLoaded } = useTheme();
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (e: any) {
        setDbError(e?.message ?? 'فشل تهيئة قاعدة البيانات');
      }
    })();
  }, []);

  if (dbError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bgBody }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: colors.red600, fontWeight: '700', textAlign: 'center', paddingHorizontal: 24 }}>
          حدث خطأ أثناء تهيئة قاعدة البيانات{'\n'}{dbError}
        </Text>
      </View>
    );
  }

  if (!dbReady || !isLoaded) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bgBody }]}>
        <Text style={{ fontSize: 44, marginBottom: 16 }}>🐑</Text>
        <ActivityIndicator size="large" color={colors.green600} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={colors.bgBody === '#f4f7f5' ? 'dark' : 'light'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
