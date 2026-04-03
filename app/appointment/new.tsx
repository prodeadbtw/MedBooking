// src/app/appointment/new.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants';

export default function NewAppointmentScreen() {
  // Получаем параметры, переданные при навигации
  const { doctorId, doctorName } = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
  }>();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📅</Text>
      <Text style={styles.title}>Запись на приём</Text>
      {doctorName && (
        <Text style={styles.subtitle}>Врач: {doctorName}</Text>
      )}
      <Text style={styles.placeholder}>
        Форма записи будет реализована позже
      </Text>
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
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  placeholder: {
    ...Typography.caption,
    textAlign: 'center',
  },
});