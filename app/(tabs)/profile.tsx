// src/app/(tabs)/profile.tsx

import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../../components/Button';
import { Colors, Spacing, Typography } from '../../constants';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { state, logout } = useAuth();
  const { appointments } = useApp();

  // Считаем статистику записей текущего пользователя
  const userAppointments = state.user
    ? appointments.filter(
        (apt) =>
          apt.email === state.user!.email ||
          apt.patientName === state.user!.name
      )
    : [];

  const activeAppointments = userAppointments.filter(
    (apt) => apt.status === 'pending' || apt.status === 'confirmed'
  ).length;

  const completedAppointments = userAppointments.filter(
    (apt) => apt.status === 'completed'
  ).length;

  // Обработчик выхода
  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  // === ЭКРАН ДЛЯ НЕАВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ ===
  if (!state.isAuthenticated) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestEmoji}>👤</Text>
        <Text style={styles.guestTitle}>Вы не авторизованы</Text>
        <Text style={styles.guestSubtitle}>
          Войдите или зарегистрируйтесь, чтобы управлять записями
          и видеть историю посещений
        </Text>

        <Button
          title="Войти"
          onPress={() => router.push('/auth/login')}
          style={{ marginBottom: Spacing.md, width: '100%' }}
        />

        <Button
          title="Зарегистрироваться"
          onPress={() => router.push('/auth/register')}
          variant="outline"
          style={{ width: '100%' }}
        />
      </View>
    );
  }

  // === ЭКРАН ДЛЯ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ ===
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Шапка профиля */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {/* Берём первую букву имени */}
            {state.user!.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{state.user!.name}</Text>
        <Text style={styles.userEmail}>{state.user!.email}</Text>
      </View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userAppointments.length}</Text>
          <Text style={styles.statLabel}>Всего записей</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeAppointments}</Text>
          <Text style={styles.statLabel}>Активных</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedAppointments}</Text>
          <Text style={styles.statLabel}>Завершено</Text>
        </View>
      </View>

      {/* Информация */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Личная информация</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👤</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>ФИО</Text>
            <Text style={styles.infoValue}>{state.user!.name}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📧</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{state.user!.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📱</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Телефон</Text>
            <Text style={styles.infoValue}>{state.user!.phone}</Text>
          </View>
        </View>
      </View>

      {/* Быстрые действия */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Действия</Text>

        <Pressable
          style={styles.actionRow}
          onPress={() => router.push('/appointment/new')}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionText}>Записаться к врачу</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.actionRow}
          onPress={() => {
            // Переключаемся на вкладку "Мои записи"
            router.push('/(tabs)/appointments');
          }}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Мои записи</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
      </View>

      {/* Кнопка выхода */}
      <Button
        title="Выйти из аккаунта"
        onPress={handleLogout}
        variant="outline"
        style={{
          marginHorizontal: Spacing.lg,
          marginTop: Spacing.lg,
          borderColor: Colors.error,
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { paddingBottom: 40 },

  // Гостевой экран
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
  },
  guestEmoji: { fontSize: 80, marginBottom: Spacing.lg },
  guestTitle: { ...Typography.h2, marginBottom: Spacing.sm, textAlign: 'center' },
  guestSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    lineHeight: 22,
  },

  // Шапка профиля
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  userName: { ...Typography.h2, marginBottom: 4 },
  userEmail: { ...Typography.caption },

  // Статистика
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  statLabel: { ...Typography.caption },
  statDivider: { width: 1, backgroundColor: Colors.border },

  // Секции
  section: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
    padding: Spacing.lg,
  },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.md },

  // Информация
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoIcon: { fontSize: 20, marginRight: Spacing.md, width: 28 },
  infoContent: { flex: 1 },
  infoLabel: { ...Typography.caption, marginBottom: 2 },
  infoValue: { ...Typography.body, fontSize: 15 },

  // Действия
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  actionIcon: { fontSize: 20, marginRight: Spacing.md },
  actionText: { ...Typography.body, flex: 1 },
  actionArrow: { fontSize: 22, color: Colors.textSecondary },
});