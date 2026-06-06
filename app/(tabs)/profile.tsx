// src/app/(tabs)/profile.tsx

import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useAvatar } from '../../hooks/useAvatar';
import { useLocation } from '../../hooks/useLocation';

export default function ProfileScreen() {
  const { state, logout } = useAuth();
  const { appointments } = useApp();
  const { avatarUri, pickAvatar, removeAvatar, uploading } = useAvatar();
  const {
    nearestClinic,
    isLoading: locationLoading,
    requestLocation,
  } = useLocation();


  // Записи из AppContext уже принадлежат текущему пользователю
  // (Supabase RLS отдаёт только свои записи), поэтому фильтровать по email не нужно.
  const userAppointments = state.isAuthenticated ? appointments : [];

  const activeAppointments = userAppointments.filter(
    (apt) => apt.status === 'pending' || apt.status === 'confirmed'
  ).length;

  const completedAppointments = userAppointments.filter(
    (apt) => apt.status === 'done'
  ).length;

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)'); // возвращаемся на главный как гость
        },
      },
    ]);
  };

  // Обработчик нажатия на аватарку
  const handleAvatarPress = () => {
    if (!state.isAuthenticated) return;

    if (avatarUri) {
      Alert.alert('Аватар', 'Что вы хотите сделать?', [
        { text: 'Заменить фото', onPress: pickAvatar },
        { text: 'Удалить фото', style: 'destructive', onPress: removeAvatar },
        { text: 'Отмена', style: 'cancel' },
      ]);
    } else {
      pickAvatar();
    }
  };

  // === ГОСТЕВОЙ ЭКРАН ===
  if (!state.isAuthenticated) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestEmoji}>👤</Text>
        <Text style={styles.guestTitle}>Вы не авторизованы</Text>
        <Text style={styles.guestSubtitle}>
          Войдите или зарегистрируйтесь, чтобы управлять записями и видеть
          историю посещений
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

  // === АВТОРИЗОВАННЫЙ ЭКРАН ===
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Шапка профиля */}
      <View style={styles.profileHeader}>
        {/* АВАТАРКА — кликабельная */}
        <Pressable onPress={handleAvatarPress}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {state.user?.name?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
          )}

          {/* Индикатор загрузки поверх аватара */}
          {uploading && (
            <View style={styles.avatarLoading}>
              <ActivityIndicator color={Colors.textOnPrimary} />
            </View>
          )}

          <View style={styles.cameraIcon}>
            <Text style={styles.cameraEmoji}>📷</Text>
          </View>
        </Pressable>
        <Text style={styles.userName}>{state.user?.name}</Text>
        <Text style={styles.userEmail}>{state.user?.email}</Text>
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

      {/* Личная информация */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Личная информация</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👤</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>ФИО</Text>
            <Text style={styles.infoValue}>{state.user?.name}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📧</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{state.user?.email}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📱</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Телефон</Text>
            <Text style={styles.infoValue}>
              {state.user?.phone || 'Не указан'}
            </Text>
          </View>
        </View>
      </View>

      <Button
        title="Редактировать профиль"
        onPress={() => router.push('/profile/edit')}
        variant="outline"
        style={{ marginHorizontal: Spacing.lg, marginTop: Spacing.md }}
      />

      {/* Ближайшая клиника */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ближайшая клиника</Text>

        {nearestClinic ? (
          <View style={styles.clinicCard}>
            <Text style={styles.clinicIcon}>🏥</Text>
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName}>{nearestClinic.name}</Text>
              <Text style={styles.clinicAddress}>
                📍 {nearestClinic.address}
              </Text>
              <Text style={styles.clinicPhone}>📞 {nearestClinic.phone}</Text>
            </View>
          </View>
        ) : (
          <Pressable
            style={styles.locationButton}
            onPress={requestLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>
                  Определить ближайшую клинику
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>

      {/* Быстрые действия */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Действия</Text>
        <Pressable
          style={styles.actionRow}
          onPress={() => router.push('/appointment/new')}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionText}>Записаться к специалисту</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
        <Pressable
          style={styles.actionRow}
          onPress={() => router.push('/(tabs)/appointments')}
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

  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
  },
  guestEmoji: { fontSize: 80, marginBottom: Spacing.lg },
  guestTitle: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  guestSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    lineHeight: 22,
  },

  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },

  cameraIcon: {
    position: 'absolute',
    bottom: Spacing.md,
    right: -4,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraEmoji: { fontSize: 16 },

  userName: { ...Typography.h2, marginBottom: 4 },
  userEmail: { ...Typography.caption },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: { ...Typography.caption },
  statDivider: { width: 1, backgroundColor: Colors.border },

  section: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
    padding: Spacing.lg,
  },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.md },

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

  clinicCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
  },
  clinicIcon: { fontSize: 32, marginRight: Spacing.md },
  clinicInfo: { flex: 1 },
  clinicName: { ...Typography.h3, fontSize: 15, marginBottom: 4 },
  clinicAddress: { ...Typography.caption, marginBottom: 2 },
  clinicPhone: { ...Typography.caption, color: Colors.primary },

  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: Spacing.borderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  locationIcon: { fontSize: 20, marginRight: Spacing.sm },
  locationText: { ...Typography.body, fontSize: 14, color: Colors.primary },

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
  
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});