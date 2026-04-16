// src/app/doctor/[id].tsx

// [id] в имени файла — это ДИНАМИЧЕСКИЙ ПАРАМЕТР.
// Когда пользователь переходит на маршрут /doctor/5,
// параметр id будет равен "5".
// Это как шаблон: /doctor/ЛЮБОЕ_ЗНАЧЕНИЕ

import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
// useLocalSearchParams — хук (hook), который достаёт параметры из URL.
// router — объект для программной навигации (переход на другой экран из кода).

import { Colors, Spacing, Typography } from '../../constants';
import { Doctor, DOCTORS } from '../../data/doctors';
export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const doctor: Doctor | undefined = DOCTORS.find((doc) => doc.id === id);
  if (!doctor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>Врач не найден</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Назад</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* === ШАПКА === */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{doctor.photo}</Text>
        </View>
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.specialty}>{doctor.specialty}</Text>

        {/* Статистика */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {doctor.rating}</Text>
            <Text style={styles.statLabel}>
              {doctor.reviewsCount} отзывов
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.experience} лет</Text>
            <Text style={styles.statLabel}>Опыт работы</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.price} ₽</Text>
            <Text style={styles.statLabel}>Приём</Text>
          </View>
        </View>
      </View>

      {/* === О СПЕЦИАЛИСТЕ === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О специалисте</Text>
        <Text style={styles.description}>{doctor.description}</Text>
      </View>

      {/* === РАСПИСАНИЕ === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Расписание</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🕐</Text>
          <Text style={styles.infoText}>{doctor.schedule}</Text>
        </View>
      </View>

      {/* === АДРЕС === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Адрес</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.infoText}>{doctor.address}</Text>
        </View>
      </View>

      {/* === КНОПКА ЗАПИСИ === */}
      <Pressable
        style={({ pressed }) => [
          styles.appointmentButton,
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => {
          router.push({
            pathname: '/appointment/new',
            params: {
              doctorId: doctor.id,
              doctorName: doctor.name,
            },
          });
        }}
      >
        <Text style={styles.appointmentButtonText}>
          Записаться на приём • {doctor.price} ₽
        </Text>
      </Pressable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },

  // Шапка
  header: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: Spacing.borderRadius.full,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 50,
  },
  name: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 4,
  },
  specialty: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: Spacing.lg,
  },

  // Статистика
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Spacing.borderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    width: '100%',
    // width: '100%' — растягиваем на всю ширину родителя
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },

  // Секции
  section: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  infoText: {
    ...Typography.body,
    flex: 1,
  },

  // Кнопка записи
  appointmentButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: Spacing.borderRadius.sm,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentButtonText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
    fontSize: 17,
  },

  // Ошибка
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  errorText: {
    ...Typography.h2,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Spacing.borderRadius.sm,
  },
  backButtonText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
  },
});