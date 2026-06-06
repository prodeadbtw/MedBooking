// src/app/(tabs)/appointments.tsx

import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';
import { Appointment, useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

// Подписи и цвета статусов (раньше брались из data/appointments)
const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждена',
  done: 'Завершена',
  cancelled: 'Отменена',
};

const STATUS_COLORS: Record<string, string> = {
  pending: Colors.warning,
  confirmed: Colors.primary,
  done: Colors.success ?? '#22C55E',
  cancelled: Colors.error,
};

export default function AppointmentsScreen() {
  const {
    appointments,
    appointmentsLoading: isLoading,
    cancelAppointment,
    refetchAppointments,
  } = useApp();
  const { state } = useAuth();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchAppointments();
    setRefreshing(false);
  }, [refetchAppointments]);

  // Форматирование "2026-06-10" → "10 июня 2026 г."
  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Время "14:30:00" → "14:30"
  const formatTime = (timeStr: string): string => timeStr.slice(0, 5);

  // Имя специалиста для отображения и алертов
  const getSpecialistName = (item: Appointment): string =>
    item.specialists?.full_name ?? 'Специалист';

  const handleCancel = useCallback(
    (appointment: Appointment) => {
      Alert.alert(
        'Отменить запись?',
        `Запись к ${getSpecialistName(appointment)} на ${formatDate(
          appointment.appointment_date
        )}`,
        [
          { text: 'Нет', style: 'cancel' },
          {
            text: 'Да, отменить',
            style: 'destructive',
            onPress: () => cancelAppointment(appointment.id),
          },
        ]
      );
    },
    [cancelAppointment]
  );

  const renderAppointment = useCallback(
    ({ item }: { item: Appointment }) => {
      const statusColor = STATUS_COLORS[item.status] ?? Colors.textSecondary;
      const statusLabel = STATUS_LABELS[item.status] ?? item.status;
      const canCancel =
        item.status === 'pending' || item.status === 'confirmed';

      const profession = item.specialists
        ? `${item.specialists.profession}${
            item.specialists.specialization
              ? ` • ${item.specialists.specialization}`
              : ''
          }`
        : '';

      return (
        <View style={styles.card}>
          {/* Заголовок: специалист + статус */}
          <View style={styles.cardHeader}>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{getSpecialistName(item)}</Text>
              {profession ? (
                <Text style={styles.patientName}>{profession}</Text>
              ) : null}
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Детали */}
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>
                {formatDate(item.appointment_date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🕐</Text>
              <Text style={styles.detailText}>
                {formatTime(item.appointment_time)}
              </Text>
            </View>
            {item.comment ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>💬</Text>
                <Text style={styles.detailText} numberOfLines={2}>
                  {item.comment}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Кнопка отмены */}
          {canCancel && (
            <Pressable
              style={styles.cancelButton}
              onPress={() => handleCancel(item)}
            >
              <Text style={styles.cancelButtonText}>Отменить запись</Text>
            </Pressable>
          )}

          {/* Дата создания */}
          <Text style={styles.createdAt}>
            Создано: {new Date(item.created_at).toLocaleDateString('ru-RU')}
          </Text>
        </View>
      );
    },
    [handleCancel]
  );

  // === ГОСТЬ ===
  if (!state.isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔐</Text>
        <Text style={styles.emptyTitle}>Войдите в аккаунт</Text>
        <Text style={styles.emptySubtitle}>
          Записи доступны только авторизованным пользователям
        </Text>
      </View>
    );
  }

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyTitle}>Записей пока нет</Text>
        <Text style={styles.emptySubtitle}>
          Запишитесь к специалисту — и запись появится здесь
        </Text>
      </View>
    ),
    []
  );

  // === ЗАГРУЗКА ===
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Загрузка записей...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: Spacing.lg, flexGrow: 1 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  doctorInfo: { flex: 1, marginRight: Spacing.sm },
  doctorName: { ...Typography.h3, fontSize: 16, marginBottom: 8 },
  patientName: { ...Typography.caption },

  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: '600' },

  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  detailIcon: { fontSize: 16, marginRight: Spacing.sm, width: 24 },
  detailText: { ...Typography.body, fontSize: 14, flex: 1 },

  cancelButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.button,
    color: Colors.error,
    fontSize: 14,
  },

  createdAt: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: Spacing.sm,
    textAlign: 'right',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    backgroundColor: Colors.background,
  },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.lg },
  emptyTitle: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});