// src/app/doctor/[id].tsx

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';
import {
  getSpecialistById,
  Specialist,
} from '../../services/specialists';

export default function SpecialistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getSpecialistById(id);
      setSpecialist(data);
      setLoading(false);
    };
    load();
  }, [id]);

  // === ЗАГРУЗКА ===
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // === НЕ НАЙДЕН ===
  if (!specialist) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>Специалист не найден</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  // Если у специалиста есть компания — показываем её, иначе "Частный специалист"
  const companyName = specialist.companies?.name ?? 'Частный специалист';
  const companyAddress = specialist.companies?.address ?? 'Адрес уточняется';

  // Первая буква имени вместо фото-эмодзи
  const initial = specialist.full_name.charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* === ШАПКА === */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{specialist.full_name}</Text>
        <Text style={styles.specialty}>
          {specialist.profession}
          {specialist.specialization ? ` • ${specialist.specialization}` : ''}
        </Text>

        {/* Статистика */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {specialist.rating}</Text>
            <Text style={styles.statLabel}>Рейтинг</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {specialist.experience_years} лет
            </Text>
            <Text style={styles.statLabel}>Опыт работы</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {specialist.price ? `${specialist.price} ₽` : '—'}
            </Text>
            <Text style={styles.statLabel}>Приём</Text>
          </View>
        </View>
      </View>

      {/* === О СПЕЦИАЛИСТЕ === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О специалисте</Text>
        <Text style={styles.description}>
          {specialist.description ?? 'Описание не указано'}
        </Text>
      </View>

      {/* === КОМПАНИЯ === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Место работы</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🏢</Text>
          <Text style={styles.infoText}>{companyName}</Text>
        </View>
        <View style={[styles.infoRow, { marginTop: Spacing.sm }]}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.infoText}>{companyAddress}</Text>
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
              specialistId: specialist.id,
              specialistName: specialist.full_name,
            },
          });
        }}
      >
        <Text style={styles.appointmentButtonText}>
          Записаться
          {specialist.price ? ` • ${specialist.price} ₽` : ''}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { paddingBottom: 40 },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

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
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  name: { ...Typography.h2, textAlign: 'center', marginBottom: 4 },
  specialty: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Spacing.borderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },

  section: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
  },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.sm },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { fontSize: 20, marginRight: Spacing.sm },
  infoText: { ...Typography.body, flex: 1 },

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

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  errorEmoji: { fontSize: 64, marginBottom: Spacing.lg },
  errorText: { ...Typography.h2, marginBottom: Spacing.lg },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Spacing.borderRadius.sm,
  },
  backButtonText: { ...Typography.button, color: Colors.textOnPrimary },
});