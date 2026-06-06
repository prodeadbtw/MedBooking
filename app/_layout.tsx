// src/app/_layout.tsx

import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Colors } from '../constants';
import { AppProvider } from '../contexts/AppContext';
import { AuthProvider } from '../contexts/AuthContext';
import { configureNotifications } from '../services/notifications';

function AppStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: { fontWeight: '600' },
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="doctor/[id]"
        options={{ title: 'Информация о специалисте', presentation: 'card' }}
      />
      <Stack.Screen
        name="appointment/new"
        options={{ title: 'Запись', presentation: 'modal' }}
      />
      <Stack.Screen
        name="auth/login"
        options={{ title: 'Вход', headerShown: false }}
      />
      <Stack.Screen
        name="auth/register"
        options={{ title: 'Регистрация', headerShown: false }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{ title: 'Редактирование профиля' }}
      />
    </Stack>
    
  );
}

export default function RootLayout() {
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <AppStack />
      </AppProvider>
    </AuthProvider>
  );
}