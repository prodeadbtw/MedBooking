// src/app/(tabs)/appointments.tsx

import React, { useCallback } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';
import { useApp } from '../../contexts/AppContext';
import {
  Appointment,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../../data/appointments';

export default function AppointmentsScreen() {
  const {
  appointments,
  appointmentsLoading: isLoading,
  cancelAppointment,
} = useApp();

  // Обработчик отмены записи
  const handleCancel = useCallback(
    (appointment: Appointment) => {
      // Показываем диалог подтверждения
      Alert.alert(
        'Отменить запись?',
        `Запись к ${appointment.doctorName} на ${new Date(
          appointment.date
        ).toLocaleDateString('ru-RU')}`,
        [
          {
            text: 'Нет',
            style: 'cancel',
            // style: 'cancel' — на iOS эта кнопка будет жирной
          },
          {
            text: 'Да, отменить',
            style: 'destructive',
            // style: 'destructive' — красный текст (деструктивное действие)
            onPress: () => cancelAppointment(appointment.id),
          },
        ]
      );
    },
    [cancelAppointment]
  );

  // Рендер одной карточки записи
  const renderAppointment = useCallback(
    ({ item }: { item: Appointment }) => {
      const appointmentDate = new Date(item.date);
      const statusColor = STATUS_COLORS[item.status];
      const statusLabel = STATUS_LABELS[item.status];
      // Можно ли отменить: только если статус "pending" или "confirmed"
      const canCancel =
        item.status === 'pending' || item.status === 'confirmed';
        
      return (
        <View style={styles.card}>
          {/* Заголовок карточки: врач + статус */}
          <View style={styles.cardHeader}>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{item.doctorName}</Text>
              <Text style={styles.patientName}>
                Пациент: {item.patientName}
              </Text>
            </View>
            {/* Бейдж статуса */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + '20' },
                // +20 = 12% прозрачности — светлый фон
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Детали записи */}
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>
                {appointmentDate.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📞</Text>
              <Text style={styles.detailText}>{item.phone}</Text>
            </View>
            {item.complaints ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>💬</Text>
                <Text style={styles.detailText} numberOfLines={2}>
                  {item.complaints}
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
            Создано:{' '}
            {new Date(item.createdAt).toLocaleDateString('ru-RU')}
          </Text>
        </View>
      );
    },
    [handleCancel]
  );

  // Заглушка для пустого списка
  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyTitle}>Записей пока нет</Text>
        <Text style={styles.emptySubtitle}>
          Запишитесь к врачу — и запись появится здесь
        </Text>
      </View>
    ),
    []
  );

  // Индикатор загрузки
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },

  // Карточка записи
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
  doctorInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  doctorName: {
    ...Typography.h3,
    fontSize: 16,
    marginBottom: 8,
  },
  patientName: {
    ...Typography.caption,
  },

  // Статус
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Детали
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
  detailIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
    width: 24,
    // width: 24 — фиксированная ширина, чтобы текст 
    // выравнивался по левому краю
  },
  detailText: {
    ...Typography.body,
    fontSize: 14,
    flex: 1,
  },

  // Кнопка отмены
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

  // Дата создания
  createdAt: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: Spacing.sm,
    textAlign: 'right',
  },

  // Пустой список
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.lg },
  emptyTitle: { ...Typography.h2, textAlign: 'center', marginBottom: Spacing.sm },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Загрузка
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});