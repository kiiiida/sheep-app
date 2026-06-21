// ============================================
//  src/hooks/useToast.tsx
//  نظام إشعارات Toast بسيط بدون مكتبات خارجية إضافية
// ============================================

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type ToastType = 'success' | 'error' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { colors } = useTheme();

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const bgFor = (type: ToastType) => {
    if (type === 'error') return colors.red600;
    if (type === 'warning') return colors.amber600;
    return colors.green800;
  };

  const iconFor = (type: ToastType) => {
    if (type === 'error') return '❌';
    if (type === 'warning') return '⚠️';
    return '✅';
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map(toast => (
          <View key={toast.id} style={[styles.toast, { backgroundColor: bgFor(toast.type) }]}>
            <Text style={styles.icon}>{iconFor(toast.type)}</Text>
            <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    alignItems: 'center',
    gap: 8,
  },
  toast: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  icon: { fontSize: 16 },
  message: { color: '#fff', fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});
