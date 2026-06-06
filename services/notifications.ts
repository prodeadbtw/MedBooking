// src/services/notifications.ts

// СЕРВИС УВЕДОМЛЕНИЙ
// Управляет локальными уведомлениями:
// - Запрос разрешения
// - Планирование напоминаний
// - Отмена напоминаний

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// === НАСТРОЙКА ===
// Это нужно вызвать один раз при запуске приложения.
// Определяет, КАК показывать уведомления, пока приложение ОТКРЫТО.
// По умолчанию, если приложение на переднем плане — уведомления не показываются.
// Мы меняем это поведение.
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
       shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // На Android нужно создать «канал» уведомлений
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('appointments', {
      name: 'Записи к врачу',
      // name — отображается в настройках Android
      importance: Notifications.AndroidImportance.HIGH,
      // HIGH — уведомление со звуком и баннером
      // DEFAULT — со звуком, без баннера
      // LOW — без звука
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      // Паттерн вибрации: пауза 0мс, вибрация 250мс, пауза 250мс, вибрация 250мс
    });
  }
}

// === ЗАПРОС РАЗРЕШЕНИЯ ===
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  // Сначала проверяем текущий статус — может, разрешение уже есть

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    // Если разрешения нет — запрашиваем
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// === ПЛАНИРОВАНИЕ НАПОМИНАНИЯ О ПРИЁМЕ ===
export async function scheduleAppointmentReminder(
  appointmentId: string,
  doctorName: string,
  appointmentDate: Date
): Promise<string[]> {
  // Возвращает массив ID запланированных уведомлений
  // (чтобы можно было отменить)

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Нет разрешения на уведомления');
    return [];
  }

  const notificationIds: string[] = [];
  const now = new Date();

  // --- Уведомление за 1 день до приёма ---
  const oneDayBefore = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
  // 24 часа * 60 минут * 60 секунд * 1000 миллисекунд = 1 день в миллисекундах

  if (oneDayBefore > now) {
    // Планируем только если время ещё не прошло
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Напоминание о приёме 🏥',
        body: `Завтра у вас приём у врача: ${doctorName}`,
        // body — основной текст уведомления
        data: { appointmentId, type: 'reminder_1day' },
        // data — произвольные данные, которые можно прочитать
        // при нажатии на уведомление
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: oneDayBefore,
        // Тип DATE — уведомление сработает в точную дату/время.
        // Другие типы:
        // TIME_INTERVAL — через N секунд
        // DAILY — каждый день в определённое время
        // WEEKLY — каждую неделю
        channelId: 'appointments',
        // channelId — канал для Android (создали выше)
      },
    });

    notificationIds.push(id);
  }

  // --- Уведомление за 1 час до приёма ---
  const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);

  if (oneHourBefore > now) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Скоро приём! ⏰',
        body: `Через 1 час у вас приём у врача: ${doctorName}`,
        data: { appointmentId, type: 'reminder_1hour' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: oneHourBefore,
        channelId: 'appointments',
      },
    });

    notificationIds.push(id);
  }

  // --- Мгновенное подтверждение записи ---
  // Отправляем уведомление через 2 секунды — как подтверждение
  const confirmId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Запись подтверждена ✅',
      body: `Вы записаны к врачу: ${doctorName} на ${appointmentDate.toLocaleDateString(
        'ru-RU'
      )}`,
      data: { appointmentId, type: 'confirmation' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      // Через 2 секунды после вызова функции
      channelId: 'appointments',
    },
  });

  notificationIds.push(confirmId);

  return notificationIds;
}

// === ОТМЕНА УВЕДОМЛЕНИЙ ===
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

// Отменить ВСЕ запланированные уведомления
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}