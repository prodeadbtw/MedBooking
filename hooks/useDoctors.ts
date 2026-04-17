// src/hooks/useDoctors.ts

// CUSTOM HOOK — useDoctors
// Загружает список врачей с сервера.
// Управляет состояниями: загрузка, ошибка, данные.
// Если сервер недоступен — использует локальные данные (fallback).

import { useCallback, useEffect, useState } from 'react';
import { Doctor, DOCTORS } from '../data/doctors';
import { doctorsApi } from '../services/api';

interface UseDoctorsReturn {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // refetch — функция для повторной загрузки данных.
  // Пользователь может «потянуть вниз» для обновления.
}

export function useDoctors(): UseDoctorsReturn {
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS);
  // Начальное значение — локальные данные.
  // Если сервер ответит — заменим. Если нет — останутся локальные.
  // Это паттерн "optimistic data" — показываем что-то сразу,
  // не заставляя пользователя ждать.

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функция загрузки данных
  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Обнуляем ошибку перед новым запросом

      const data = await doctorsApi.getAll();
      // Запрос к серверу: GET /doctors

      setDoctors(data);
      // Заменяем данные на полученные с сервера
    } catch (err) {
      // Если сервер недоступен — оставляем локальные данные
      const message =
        err instanceof Error
          ? err.message
          : 'Неизвестная ошибка';

      setError(message);
      console.warn(
        'Не удалось загрузить врачей с сервера, используем локальные данные:',
        message
      );
      // console.warn — предупреждение (жёлтое) в консоли.
      // Не ошибка, просто информация для разработчика.

      // НЕ вызываем setDoctors — оставляем локальные данные (DOCTORS)
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Загружаем при первом рендере
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    isLoading,
    error,
    refetch: fetchDoctors,
  };
}