// src/app/auth/login.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔐</Text>
      <Text style={styles.title}>Вход в аккаунт</Text>
      <Text style={styles.subtitle}>
        Форма входа будет реализована позже
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Назад</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  emoji: { fontSize: 64, marginBottom: Spacing.lg },
  title: { ...Typography.h2, marginBottom: Spacing.sm },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Spacing.borderRadius.sm,
  },
  buttonText: { ...Typography.button, color: Colors.textOnPrimary },
});