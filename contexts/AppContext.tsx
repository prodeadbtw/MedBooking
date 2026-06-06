// src/contexts/AppContext.tsx

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';

// Запись на приём (как приходит из БД)
export interface Appointment {
  id: string;
  specialist_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  comment: string | null;
  created_at: string;
  // данные специалиста подтягиваем join-ом
  specialists?: {
    full_name: string;
    profession: string;
    specialization: string | null;
  } | null;
}

interface NewAppointmentData {
  specialist_id: string;
  appointment_date: string;
  appointment_time: string;
  comment?: string;
}

interface AppContextType {
  appointments: Appointment[];
  appointmentsLoading: boolean;
  addAppointment: (data: NewAppointmentData) => Promise<boolean>;
  cancelAppointment: (id: string) => Promise<void>;
  refetchAppointments: () => Promise<void>;

  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => Promise<void>;
}

const defaultValue: AppContextType = {
  appointments: [],
  appointmentsLoading: false,
  addAppointment: async () => false,
  cancelAppointment: async () => {},
  refetchAppointments: async () => {},
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: async () => {},
};

const AppContext = createContext<AppContextType>(defaultValue);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // === ЗАГРУЗКА ЗАПИСЕЙ ===
  const refetchAppointments = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setAppointments([]);
      return;
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*, specialists(full_name, profession, specialization)')
      .order('appointment_date', { ascending: true });

    if (error) {
      console.log('Ошибка загрузки записей:', error.message);
      return;
    }
    setAppointments(data ?? []);
  }, []);

  // === ЗАГРУЗКА ИЗБРАННОГО ===
  const refetchFavorites = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setFavorites([]);
      return;
    }

    const { data } = await supabase
      .from('favorites')
      .select('specialist_id');

    setFavorites((data ?? []).map((f) => f.specialist_id));
  }, []);

  // Загружаем при старте и при смене пользователя
  useEffect(() => {
    const init = async () => {
      setAppointmentsLoading(true);
      await Promise.all([refetchAppointments(), refetchFavorites()]);
      setAppointmentsLoading(false);
    };
    init();

    // перезагружаем данные при входе/выходе
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      init();
    });
    return () => listener.subscription.unsubscribe();
  }, [refetchAppointments, refetchFavorites]);

  // === СОЗДАНИЕ ЗАПИСИ ===
  const addAppointment = useCallback(
    async (data: NewAppointmentData): Promise<boolean> => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log('Нельзя записаться без входа');
        return false;
      }

      const { error } = await supabase.from('appointments').insert({
        user_id: userData.user.id,
        specialist_id: data.specialist_id,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        comment: data.comment ?? null,
      });

      if (error) {
        console.log('Ошибка создания записи:', error.message);
        return false;
      }

      await refetchAppointments();
      return true;
    },
    [refetchAppointments]
  );

  // === ОТМЕНА ЗАПИСИ ===
  const cancelAppointment = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        console.log('Ошибка отмены:', error.message);
        return;
      }
      await refetchAppointments();
    },
    [refetchAppointments]
  );

  // === ИЗБРАННОЕ ===
  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      if (favorites.includes(id)) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userData.user.id)
          .eq('specialist_id', id);
        setFavorites((prev) => prev.filter((f) => f !== id));
      } else {
        await supabase.from('favorites').insert({
          user_id: userData.user.id,
          specialist_id: id,
        });
        setFavorites((prev) => [...prev, id]);
      }
    },
    [favorites]
  );

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
  return useContext(AppContext);
} 