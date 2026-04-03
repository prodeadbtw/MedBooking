// src/app/_layout.tsx

// Это КОРНЕВОЙ layout — самый главный.
// Он определяет Stack Navigator — навигацию «стопкой».
// Когда пользователь переходит на новый экран,
// тот ложится поверх предыдущего (как карточки в стопке).

import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../constants';

export default function RootLayout() {
  return (
    // Stack — навигатор, который кладёт экраны друг на друга.
    // screenOptions — настройки по умолчанию для ВСЕХ экранов.
    <Stack
      screenOptions={{
        // Стиль заголовка
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        // Анимация перехода между экранами
        animation: 'slide_from_right',
      }}
    >
      {/* (tabs) — группа с вкладками. headerShown: false — скрываем 
          заголовок Stack для этой группы, потому что у вкладок 
          свой собственный заголовок */}
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      {/* Экран деталей врача */}
      <Stack.Screen
        name="doctor/[id]"
        options={{
          title: 'Информация о враче',
          // presentation: 'card' — стандартная анимация 
          // (экран въезжает справа)
          presentation: 'card',
        }}
      />

      {/* Экран создания записи */}
      <Stack.Screen
        name="appointment/new"
        options={{
          title: 'Запись на приём',
          // presentation: 'modal' — экран появляется снизу,
          // как модальное окно. Подходит для форм.
          presentation: 'modal',
        }}
      />

      {/* Экраны авторизации */}
      <Stack.Screen
        name="auth/login"
        options={{
          title: 'Вход',
          headerShown: false, // Без заголовка — сами нарисуем
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          title: 'Регистрация',
          headerShown: false,
        }}
      />
    </Stack>
  );
}