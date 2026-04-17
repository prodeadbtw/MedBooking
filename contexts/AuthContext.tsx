// src/contexts/AuthContext.tsx

// AUTH CONTEXT — глобальное состояние авторизации.
//
// Зачем Context?
// Представь: пользователь авторизовался. Его данные нужны:
// - На Главной (приветствие: "Здравствуйте, Иван!")
// - В Профиле (показать email, телефон)
// - В форме записи (автозаполнение ФИО, телефона)
// - В списке записей (показать только его записи)
//
// Без Context пришлось бы передавать данные через props
// от родителя к ребёнку через 5-10 уровней вложенности.
// С Context — любой компонент получает данные напрямую.

import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useReducer,
} from 'react';
import { usersApi } from '../services/api';
import { getItem, removeItem, setItem, STORAGE_KEYS } from '../services/storage';

// === ТИПЫ ===

// Данные пользователя (без пароля — пароль не храним в state)
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
}

// Состояние контекста авторизации
interface AuthState {
  user: User | null;
  // null = не авторизован, User = авторизован
  isLoading: boolean;
  // true пока загружаем данные из хранилища при старте
  isAuthenticated: boolean;
  // Удобный флаг: true если user !== null
}

// Действия (Actions) — описывают, ЧТО может произойти
// Каждое действие — объект с type и (иногда) payload.
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' };
// Объединение типов через | — AuthAction может быть ОДНИМ из трёх.
// TypeScript не позволит создать действие с type: 'UNKNOWN'.

// Интерфейс контекста — что доступно потребителям (экранам)
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// === REDUCER ===
// Reducer — чистая функция, которая описывает,
// КАК состояние меняется в ответ на действие.
// «Чистая» = не имеет побочных эффектов, всегда возвращает
// одинаковый результат для одинаковых аргументов.
//
// Зачем reducer вместо useState?
// 1. Состояние авторизации сложное (несколько связанных полей)
// 2. Несколько способов изменения (login, logout, update)
// 3. Легче тестировать — это просто функция
// 4. Легче отлаживать — все изменения проходят через switch

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        // ...state — копируем все текущие поля
        isLoading: action.payload,
        // Перезаписываем только isLoading
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

    default:
      return state;
      // Если действие неизвестное — возвращаем текущее состояние без изменений
  }
}

// Начальное состояние
const initialState: AuthState = {
  user: null,
  isLoading: true,
  // true при старте — мы ещё не знаем, авторизован ли пользователь.
  // Нужно проверить хранилище.
  isAuthenticated: false,
};

// === СОЗДАНИЕ CONTEXT ===
// createContext создаёт «канал» для передачи данных.
// undefined — значение по умолчанию (будет заменено Provider'ом).
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// === PROVIDER COMPONENT ===
// Provider — компонент, который оборачивает часть приложения
// и предоставляет данные всем потомкам.
// children — всё, что находится внутри <AuthProvider>...</AuthProvider>

export function AuthProvider({ children }: { children: ReactNode }) {
  // useReducer — как useState, но вместо прямого изменения
  // мы «диспатчим» (отправляем) действия.
  // state — текущее состояние
  // dispatch — функция отправки действий
  const [state, dispatch] = useReducer(authReducer, initialState);

  // === ЗАГРУЗКА ПРИ СТАРТЕ ===
  // Проверяем, есть ли сохранённый пользователь
  useEffect(() => {
    (async () => {
      try {
        const savedUser = await getItem<User>(STORAGE_KEYS.USER_PROFILE);
        if (savedUser) {
          dispatch({ type: 'SET_USER', payload: savedUser });
          // Отправляем действие SET_USER → reducer обновит state
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  // === ВХОД ===
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Запрос к серверу
        const userData = await usersApi.login(email, password);

        if (!userData || !userData.id) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return false;
          // Пользователь не найден — возвращаем false
        }

        // Формируем объект User (без пароля!)
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
        };

        // Сохраняем в хранилище
        await setItem(STORAGE_KEYS.USER_PROFILE, user);

        // Обновляем state
        dispatch({ type: 'SET_USER', payload: user });

        return true;
      } catch (error) {
        console.error('Ошибка входа:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        return false;
      }
    },
    []
  );

  // === РЕГИСТРАЦИЯ ===
  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      phone: string;
    }): Promise<boolean> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Создаём пользователя на сервере
        const userData = await usersApi.register(data);

        const user: User = {
          id: userData.id || generateId(),
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
        };

        await setItem(STORAGE_KEYS.USER_PROFILE, user);
        dispatch({ type: 'SET_USER', payload: user });

        return true;
      } catch (error) {
        console.error('Ошибка регистрации:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        return false;
      }
    },
    []
  );

  // === ВЫХОД ===
  const logout = useCallback(async () => {
    await removeItem(STORAGE_KEYS.USER_PROFILE);
    dispatch({ type: 'LOGOUT' });
  }, []);

  // === ОБНОВЛЕНИЕ ПРОФИЛЯ ===
  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!state.user) return;

      const updatedUser: User = { ...state.user, ...data };

      try {
        // Пытаемся обновить на сервере
        await usersApi.update(state.user.id, data);
      } catch {
        console.warn('Сервер недоступен, обновляем только локально');
      }

      await setItem(STORAGE_KEYS.USER_PROFILE, updatedUser);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    },
    [state.user]
  );

  // === ЗНАЧЕНИЕ КОНТЕКСТА ===
  // Этот объект будет доступен всем потомкам через useContext
  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Всё, что внутри <AuthProvider>, получит доступ к value */}
    </AuthContext.Provider>
  );
}

// === ХЕЛПЕР-ХУК ===
// Удобная обёртка над useContext.
// Вместо: const context = useContext(AuthContext)
// Пишем: const { state, login } = useAuth()
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // Если useAuth() вызван вне AuthProvider — ошибка.
    // Это защита от неправильного использования.
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}