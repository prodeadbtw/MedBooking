// src/app/doctor/[id].tsx

// [id] в имени файла — это ДИНАМИЧЕСКИЙ ПАРАМЕТР.
// Когда пользователь переходит на маршрут /doctor/5,
// параметр id будет равен "5".
// Это как шаблон: /doctor/ЛЮБОЕ_ЗНАЧЕНИЕ

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
// useLocalSearchParams — хук (hook), который достаёт параметры из URL.
// router — объект для программной навигации (переход на другой экран из кода).

import { Colors, Typography, Spacing } from '../../constants';

// Моковые данные врачей (позже заменим на данные из API)
// «Моковые» = фейковые, тестовые данные для разработки
const MOCK_DOCTORS: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Иванова Мария Петровна',
    specialty: 'Терапевт',
    experience: 15,
    rating: 4.8,
    photo: '👩‍⚕️',
    description: 'Врач высшей категории. Специализируется на диагностике и лечении заболеваний внутренних органов.',
    schedule: 'Пн-Пт: 9:00 - 17:00',
    price: 2500,
  },
  '2': {
    id: '2',
    name: 'Петров Алексей Сергеевич',
    specialty: 'Кардиолог',
    experience: 20,
    rating: 4.9,
    photo: '👨‍⚕️',
    description: 'Доктор медицинских наук. Эксперт в области кардиологии и функциональной диагностики.',
    schedule: 'Пн, Ср, Пт: 10:00 - 18:00',
    price: 3500,
  },
  '3': {
    id: '3',
    name: 'Сидорова Елена Владимировна',
    specialty: 'Невролог',
    experience: 12,
    rating: 4.7,
    photo: '👩‍⚕️',
    description: 'Специалист по заболеваниям нервной системы. Владеет современными методами диагностики.',
    schedule: 'Вт, Чт: 9:00 - 16:00',
    price: 3000,
  },
};

export default function DoctorDetailScreen() {
  // Достаём параметр id из URL
  // Если перешли по /doctor/2, то id будет "2"
  const { id } = useLocalSearchParams<{ id: string }>();

  // Ищем врача по id в наших моковых данных
  const doctor = MOCK_DOCTORS[id as string];

  // Если врач не найден — показываем сообщение об ошибке
  if (!doctor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>Врач не найден</Text>
        {/* Pressable — это кнопка. При нажатии выполняется onPress */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          // router.back() — вернуться на предыдущий экран
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
      {/* Шапка с фото и именем */}
      <View style={styles.header}>
        <Text style={styles.photo}>{doctor.photo}</Text>
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.specialty}>{doctor.specialty}</Text>

        {/* Рейтинг и опыт */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {doctor.rating}</Text>
            <Text style={styles.statLabel}>Рейтинг</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.experience} лет</Text>
            <Text style={styles.statLabel}>Опыт</Text>
          </View>
        </View>
      </View>

      {/* Секция: О враче */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О специалисте</Text>
        <Text style={styles.description}>{doctor.description}</Text>
      </View>

      {/* Секция: Расписание */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Расписание</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🕐</Text>
          <Text style={styles.infoText}>{doctor.schedule}</Text>
        </View>
      </View>

      {/* Секция: Стоимость */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Стоимость приёма</Text>
        <Text style={styles.price}>{doctor.price} ₽</Text>
      </View>

      {/* Кнопка записи */}
      <Pressable
        style={styles.appointmentButton}
        onPress={() => {
          // Переходим на экран создания записи,
          // передавая id врача как параметр
          router.push({
            pathname: '/appointment/new',
            params: { doctorId: doctor.id, doctorName: doctor.name },
          });
        }}
      >
        <Text style={styles.appointmentButtonText}>
          Записаться на приём
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
  photo: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  name: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 4,
  },
  specialty: {
    ...Typography.body,
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },

  // Статистика
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Spacing.borderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...Typography.h3,
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
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
    lineHeight: 22,
  },

  // Информационная строка
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
  },

  // Цена
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Кнопка записи
  appointmentButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: Spacing.borderRadius.sm,
    alignItems: 'center',
    // Тени
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentButtonText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
  },

  // Ошибка
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
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