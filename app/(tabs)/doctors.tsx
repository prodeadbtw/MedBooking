// src/app/(tabs)/doctors.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants';

export default function DoctorsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👨‍⚕️</Text>
      <Text style={styles.title}>Список врачей</Text>
      <Text style={styles.subtitle}>
        Здесь будет каталог специалистов
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',   // Вертикально по центру
    alignItems: 'center',       // Горизонтально по центру
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});