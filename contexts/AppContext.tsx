// src/contexts/AppContext.tsx

// APP CONTEXT — глобальное состояние приложения.
// Хранит: записи, избранных врачей, настройки.
// Объединяет логику из useAppointments и useFavorites
// в одном месте, доступном из любого экрана.

import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { Appointment } from '../data/appointments';
import { appointmentsApi } from '../services/api';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';

// === ТИПЫ ===
interface AppContextType {
  // Записи
  appointments: Appointment[];
  appointmentsLoading: boolean;
  addAppointment: (
    data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
  ) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  refetchAppointments: () => Promise<void>;

  // Избранное
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // === ЗАПИСИ ===
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  // === ИЗБРАННОЕ ===
  const [favorites, setFavorites] = useState<string[]>([]);

  // === ЗАГРУЗКА ДАННЫХ ПРИ СТАРТЕ ===
  useEffect(() => {
    (async () => {
      try {
        // Загружаем записи
        try {
          const serverAppointments = await appointmentsApi.getAll();
          setAppointments(serverAppointments);
          await setItem(STORAGE_KEYS.APPOINTMENTS, serverAppointments);
        } catch {
          const localAppointments = await getItem<Appointment[]>(
            STORAGE_KEYS.APPOINTMENTS
          );
          if (localAppointments) setAppointments(localAppointments);
        }

        // Загружаем избранное
        const savedFavorites = await getItem<string[]>(
          STORAGE_KEYS.FAVORITE_DOCTORS
        );
        if (savedFavorites) setFavorites(savedFavorites);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setAppointmentsLoading(false);
      }
    })();
  }, []);

  // === МЕТОДЫ ЗАПИСЕЙ ===
  const addAppointment = useCallback(
    async (
      data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
    ): Promise<Appointment> => {
      const appointmentData: Omit<Appointment, 'id'> = {
        ...data,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      let newAppointment: Appointment;

      try {
        newAppointment = await appointmentsApi.create(appointmentData);
      } catch {
        newAppointment = {
          ...appointmentData,
          id: generateId(),
        };
      }

      setAppointments((prev) => {
        const updated = [newAppointment, ...prev];
        setItem(STORAGE_KEYS.APPOINTMENTS, updated);
        return updated;
      });

      return newAppointment;
    },
    []
  );

  const cancelAppointment = useCallback(async (id: string) => {
    try {
      await appointmentsApi.update(id, { status: 'cancelled' });
    } catch {
      console.warn('Сервер недоступен, отменяем локально');
    }

    setAppointments((prev) => {
      const updated = prev.map((apt) =>
        apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
      );
      setItem(STORAGE_KEYS.APPOINTMENTS, updated);
      return updated;
    });
  }, []);

  const refetchAppointments = useCallback(async () => {
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
      await setItem(STORAGE_KEYS.APPOINTMENTS, data);
    } catch {
      console.warn('Не удалось обновить записи с сервера');
    }
  }, []);

  // === МЕТОДЫ ИЗБРАННОГО ===
  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((fId) => fId !== id)
        : [...prev, id];
      setItem(STORAGE_KEYS.FAVORITE_DOCTORS, updated);
      return updated;
    });
  }, []);

  const value: AppContextType = {
    appointments,
    appointmentsLoading,
    addAppointment,
    cancelAppointment,
    refetchAppointments,
    favorites,
    isFavorite,
    toggleFavorite,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}