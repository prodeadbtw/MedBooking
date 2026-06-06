// src/app/(tabs)/_layout.tsx

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Colors from '../../constants/Color';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 80,
          paddingBottom: 6,
          paddingTop: 6,
        },
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: 'Эксперты',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-hard-hat"
              size={size + 2}
              color={color}
            />
          ),
        }}
      />

      {/* Центральная кнопка умного подбора */}
      <Tabs.Screen
        name="match"
        options={{
          title: '',
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="auto-fix"
              size={28}
              color={Colors.textOnPrimary}
            />
          ),
          // Берём только onPress — это убирает конфликт типов ref
          tabBarButton: (props) => (
            <Pressable
              onPress={props.onPress}
              style={styles.centerWrapper}
              android_ripple={{ color: 'transparent' }}
            >
              <View style={styles.centerButton}>
                <MaterialCommunityIcons
                  name="auto-fix"
                  size={28}
                  color={Colors.textOnPrimary}
                />
              </View>
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Мои записи',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size + 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
});