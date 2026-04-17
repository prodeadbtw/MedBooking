// src/app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { Colors } from '../../constants';

function TabBarIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
      name="(tabs)"
      options={{ headerShown: false }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: () => <TabBarIcon emoji="🏠" />,
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: 'Врачи',
          tabBarIcon: () => <TabBarIcon emoji="👨‍⚕️" />,
        }}
      />
      {/* НОВАЯ ВКЛАДКА */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Мои записи',
          tabBarIcon: () => <TabBarIcon emoji="📋" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: () => <TabBarIcon emoji="👤" />,
        }}
      />
    </Tabs>
  );
}