// src/hooks/useAppointments.ts — ОБНОВЛЁННАЯ ВЕРСИЯ С API

import { useCallback, useEffect, useState } from 'react';
import { Appointment } from '../data/appointments';
import { appointmentsApi } from '../services/api';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';

interface UseAppointmentsReturn {
  appointments: Appointment[];
  isLoading: boolean;
  addAppointment: (
    data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
  ) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  refetch: () => Promise<void>;
}

export function useAppointments(): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // === ЗАГРУЗКА ===
  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);

      // Пытаемся загрузить с сервера
      try {
        const serverData = await appointmentsApi.getAll();
        setAppointments(serverData);
        // Обновляем локальное хранилище актуальными данными с сервера
        await setItem(STORAGE_KEYS.APPOINTMENTS, serverData);
        return;
      } catch {
        // Сервер недоступен — загружаем из локального хранилища
        console.warn(
          'Сервер недоступен, загружаем записи из локального хранилища'
        );
      }

      // Fallback — локальные данные
      const localData = await getItem<Appointment[]>(
        STORAGE_KEYS.APPOINTMENTS
      );
      if (localData) {
        setAppointments(localData);
      }
    } catch (error) {
      console.error('Ошибка загрузки записей:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // === ДОБАВЛЕНИЕ ===
  const addAppointment = useCallback(
    async (
      data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
    ): Promise<Appointment> => {
      // Формируем объект записи
      const appointmentData: Omit<Appointment, 'id'> = {
        ...data,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      let newAppointment: Appointment;

      try {
        // Пытаемся отправить на сервер
        newAppointment = await appointmentsApi.create(appointmentData);
        // json-server автоматически добавит id
      } catch {
        // Сервер недоступен — создаём локально
        console.warn('Сервер недоступен, сохраняем запись локально');
        newAppointment = {
          ...appointmentData,
          id: generateId(),
        };
      }

      // Обновляем state и локальное хранилище
      const updated = [newAppointment, ...appointments];
      setAppointments(updated);
      await setItem(STORAGE_KEYS.APPOINTMENTS, updated);

      return newAppointment;
    },
    [appointments]
  );

  // === ОТМЕНА ===
  const cancelAppointment = useCallback(
    async (id: string): Promise<void> => {
      try {
        // Пытаемся обновить на сервере
        await appointmentsApi.update(id, { status: 'cancelled' });
      } catch {
        console.warn('Сервер недоступен, отменяем локально');
      }

      // Обновляем локально в любом случае
      const updated = appointments.map((apt) =>
        apt.id === id
          ? { ...apt, status: 'cancelled' as const }
          : apt
      );
      setAppointments(updated);
      await setItem(STORAGE_KEYS.APPOINTMENTS, updated);
    },
    [appointments]
  );

  const getAppointmentsByDoctor = useCallback(
    (doctorId: string): Appointment[] => {
      return appointments.filter((apt) => apt.doctorId === doctorId);
    },
    [appointments]
  );

  return {
    appointments,
    isLoading,
    addAppointment,
    cancelAppointment,
    getAppointmentsByDoctor,
    refetch: loadAppointments,
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}