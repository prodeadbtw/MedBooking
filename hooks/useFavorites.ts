// src/hooks/useFavorites.ts

// CUSTOM HOOK — useFavorites
// Управляет списком избранных врачей.
// Работает с массивом ID врачей — сохраняет/загружает из AsyncStorage.

import { useCallback, useEffect, useState } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';

interface UseFavoritesReturn {
  favorites: string[];               // Массив ID избранных врачей
  isFavorite: (id: string) => boolean; // Проверка: избранный ли врач?
  toggleFavorite: (id: string) => void; // Переключить: добавить/убрать
  isLoading: boolean;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка при запуске
  useEffect(() => {
    (async () => {
      // (async () => { ... })() — IIFE (Immediately Invoked Function Expression)
      // Самовызывающаяся асинхронная функция.
      // Нужна потому, что useEffect НЕ МОЖЕТ быть async напрямую.
      // useEffect должен возвращать либо undefined, либо функцию очистки,
      // а async-функция возвращает Promise.
      try {
        const saved = await getItem<string[]>(
          STORAGE_KEYS.FAVORITE_DOCTORS
        );
        if (saved) {
          setFavorites(saved);
        }
      } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Проверка: избранный ли врач?
  const isFavorite = useCallback(
    (id: string): boolean => {
      return favorites.includes(id);
      // .includes(id) — содержит ли массив этот элемент
    },
    [favorites]
  );

  // Переключение избранного
  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        let updated: string[];
        
        if (prev.includes(id)) {
          // Если уже в избранном — убираем
          updated = prev.filter((favId) => favId !== id);
          // .filter() оставляет только элементы, НЕ равные id
        } else {
          // Если не в избранном — добавляем
          updated = [...prev, id];
        }

        // Сохраняем в хранилище
        // Не используем await, потому что setState callback не может быть async.
        // Вместо этого вызываем асинхронную функцию «огнём и забудь» (fire and forget).
        setItem(STORAGE_KEYS.FAVORITE_DOCTORS, updated).catch((error) =>
          console.error('Ошибка сохранения избранного:', error)
        );

        return updated;
      });
    },
    []
    // Пустой массив зависимостей — мы используем функциональное обновление
    // setFavorites(prev => ...), которое всегда получает актуальный prev.
    // Поэтому зависимость от favorites не нужна.
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading,
  };
}