// src/app/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../constants';
import { AppProvider } from '../contexts/AppContext';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    // Оборачиваем ВСЁ приложение в Provider'ы.
    // Порядок важен: AuthProvider снаружи, AppProvider внутри.
    // Это потому что AppProvider может в будущем зависеть от Auth
    // (показывать записи только текущего пользователя).
    <AuthProvider>
      <AppProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.textOnPrimary,
            headerTitleStyle: { fontWeight: '600' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="doctor/[id]"
            options={{ title: 'Информация о враче', presentation: 'card' }}
          />
          <Stack.Screen
            name="appointment/new"
            options={{ title: 'Запись на приём', presentation: 'modal' }}
          />
          <Stack.Screen
            name="auth/login"
            options={{ title: 'Вход', headerShown: false }}
          />
          <Stack.Screen
            name="auth/register"
            options={{ title: 'Регистрация', headerShown: false }}
          />
        </Stack>
      </AppProvider>
    </AuthProvider>
  );
}