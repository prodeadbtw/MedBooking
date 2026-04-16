// src/hooks/useAppointments.ts

// CUSTOM HOOK — useAppointments
// Управляет списком записей к врачу:
// - Загружает записи из хранилища при запуске
// - Добавляет новые записи
// - Отменяет записи
// - Автоматически сохраняет изменения в AsyncStorage

import { useCallback, useEffect, useState } from 'react';
import { Appointment } from '../data/appointments';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';

// === ТИП ВОЗВРАЩАЕМОГО ЗНАЧЕНИЯ ===
// Описывает, что хук возвращает наружу.
interface UseAppointmentsReturn {
  appointments: Appointment[];           // Список записей
  isLoading: boolean;                    // Идёт ли загрузка?
  addAppointment: (                      // Функция добавления записи
    data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
    // Omit<Appointment, 'id' | 'createdAt' | 'status'> —
    // тип Appointment, но БЕЗ полей id, createdAt и status.
    // Эти поля мы генерируем автоматически.
  ) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  // Функция отмены записи по id
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  // Получить записи к конкретному врачу
}

export function useAppointments(): UseAppointmentsReturn {
  // Список записей
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // Флаг загрузки
  const [isLoading, setIsLoading] = useState(true);

  // === ЗАГРУЗКА ЗАПИСЕЙ ПРИ ЗАПУСКЕ ===
  // useEffect — хук для «побочных эффектов».
  // «Побочный эффект» — действие, которое выходит за рамки рендера:
  // чтение из хранилища, запросы к серверу, подписки.
  //
  // useEffect(функция, зависимости):
  // - функция выполняется ПОСЛЕ рендера
  // - [] (пустой массив) = выполняется ОДИН раз при первом рендере
  useEffect(() => {
    loadAppointments();
  }, []);
  // [] — пустой массив зависимостей.
  // Это значит: «выполни эффект только ОДИН раз — при монтировании компонента».
  // Монтирование — когда компонент впервые появляется на экране.

  // === ФУНКЦИЯ ЗАГРУЗКИ ===
  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      
      // Читаем данные из AsyncStorage
      const saved = await getItem<Appointment[]>(
        STORAGE_KEYS.APPOINTMENTS
      );
      
      if (saved) {
        setAppointments(saved);
        // Если данные есть — загружаем в state
      }
    } catch (error) {
      console.error('Ошибка загрузки записей:', error);
    } finally {
      setIsLoading(false);
      // finally — выполняется всегда, даже если была ошибка.
      // Мы точно хотим убрать индикатор загрузки.
    }
  };

  // === СОХРАНЕНИЕ В ХРАНИЛИЩЕ ===
  // Вспомогательная функция — сохраняет массив записей.
  const saveAppointments = async (newAppointments: Appointment[]) => {
    await setItem(STORAGE_KEYS.APPOINTMENTS, newAppointments);
  };

  // === ДОБАВЛЕНИЕ ЗАПИСИ ===
  const addAppointment = useCallback(
    async (
      data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
    ): Promise<Appointment> => {
      // Создаём новую запись с автогенерируемыми полями
      const newAppointment: Appointment = {
        ...data,
        // Копируем все переданные поля (patientName, phone и т.д.)
        id: generateId(),
        // Генерируем уникальный ID
        createdAt: new Date().toISOString(),
        // Текущая дата/время в формате ISO: "2025-01-25T10:30:00.000Z"
        status: 'pending',
        // Новая запись — в статусе "Ожидает"
      };

      // Обновляем state — добавляем новую запись в начало массива
      const updated = [newAppointment, ...appointments];
      // [newAppointment, ...appointments] — новая запись ПЕРВАЯ в списке.
      // ...appointments — spread-оператор, «разворачивает» массив:
      // [new, old1, old2, old3]
      
      setAppointments(updated);

      // Сохраняем обновлённый массив в хранилище
      await saveAppointments(updated);

      return newAppointment;
      // Возвращаем созданную запись (может пригодиться для показа подтверждения)
    },
    [appointments]
    // Зависимость: appointments
    // useCallback пересоздаёт функцию, когда appointments меняется.
    // Это нужно, потому что функция использует appointments внутри.
  );

  // === ОТМЕНА ЗАПИСИ ===
  const cancelAppointment = useCallback(
    async (id: string): Promise<void> => {
      // .map() — создаём НОВЫЙ массив, где у нужной записи меняем статус
      const updated = appointments.map((apt) =>
        apt.id === id
          ? { ...apt, status: 'cancelled' as const }
          // Если это нужная запись — создаём копию с новым статусом.
          // as const — говорит TypeScript, что 'cancelled' — это литерал,
          // а не просто строка (для совместимости с типом AppointmentStatus).
          : apt
          // Все остальные записи — без изменений
      );

      setAppointments(updated);
      await saveAppointments(updated);
    },
    [appointments]
  );

  // === ЗАПИСИ К КОНКРЕТНОМУ ВРАЧУ ===
  const getAppointmentsByDoctor = useCallback(
    (doctorId: string): Appointment[] => {
      return appointments.filter((apt) => apt.doctorId === doctorId);
    },
    [appointments]
  );

  // Возвращаем объект со всеми данными и функциями
  return {
    appointments,
    isLoading,
    addAppointment,
    cancelAppointment,
    getAppointmentsByDoctor,
  };
}

// === ГЕНЕРАТОР ID ===
// Создаёт уникальный идентификатор.
// В реальном проекте ID генерирует сервер (UUID).
// Для локального хранения такой подход достаточен.
function generateId(): string {
  // Date.now() — текущее время в миллисекундах (13 цифр).
  // Math.random() — случайное число от 0 до 1.
  // .toString(36) — переводит в 36-ричную систему (цифры + буквы).
  // .substring(2, 9) — берёт 7 символов.
  // Результат: "lx2f7g4a3" — уникальный и компактный.
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}