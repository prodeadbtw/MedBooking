// src/hooks/useAvatar.ts

// CUSTOM HOOK — useAvatar
// Управляет аватаркой пользователя:
// - Выбор фото из галереи
// - Сохранение в AsyncStorage
// - Загрузка при старте

import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
// * as ImagePicker — импортируем ВСЁ из библиотеки как объект.
// Потом обращаемся: ImagePicker.launchImageLibraryAsync(), и т.д.
import { Alert } from 'react-native';
import { getItem, setItem } from '../services/storage';

// Добавим новый ключ в storage.ts позже, а пока используем строку
const AVATAR_KEY = '@medbooking:avatar';

interface UseAvatarReturn {
  avatarUri: string | null;
  // URI (путь) к фото. null = аватарка не установлена.
  pickAvatar: () => Promise<void>;
  // Функция для открытия галереи и выбора фото.
  removeAvatar: () => Promise<void>;
  // Функция для удаления аватарки.
  isLoading: boolean;
}

export function useAvatar(): UseAvatarReturn {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка сохранённой аватарки при старте
  useEffect(() => {
    (async () => {
      try {
        const saved = await getItem<string>(AVATAR_KEY);
        if (saved) {
          setAvatarUri(saved);
        }
      } catch (error) {
        console.error('Ошибка загрузки аватара:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Выбор фото из галереи
  const pickAvatar = useCallback(async () => {
    try {
      // На iOS и Android приложение НЕ МОЖЕТ получить доступ
      // к фото без явного разрешения пользователя.
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      // requestMediaLibraryPermissionsAsync() — показывает системный
      // диалог: "Разрешить MedBooking доступ к фото?"

      if (!permissionResult.granted) {
        // Пользователь отказал — показываем объяснение
        Alert.alert(
          'Нет доступа',
          'Для загрузки аватара необходимо разрешить доступ к галерее в настройках устройства.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // launchImageLibraryAsync — открывает системную галерею.
        // Другой вариант: launchCameraAsync — открывает камеру.

        mediaTypes: ['images'],
        // mediaTypes — какие типы файлов показывать.
        // 'images' — только изображения (не видео).

        allowsEditing: true,
        // allowsEditing — после выбора фото даёт обрезать его.
        // Появляется квадратная рамка для кадрирования.

        aspect: [1, 1],
        // aspect — соотношение сторон при обрезке.
        // [1, 1] = квадрат (для аватарки).
        // [4, 3] = прямоугольник 4:3.

        quality: 0.7,
        // quality — качество сжатия от 0 до 1.
        // 0.7 = 70% — хороший баланс между качеством и размером файла.
        // 1 = максимальное качество, но файл большой.
      });

      if (!result.canceled && result.assets[0]) {
        // result.canceled — true если пользователь нажал «Отмена»
        // result.assets — массив выбранных файлов (обычно 1)
        // result.assets[0].uri — путь к файлу на устройстве
        const uri = result.assets[0].uri;

        // Сохраняем URI в state и AsyncStorage
        setAvatarUri(uri);
        await setItem(AVATAR_KEY, uri);
      }
    } catch (error) {
      console.error('Ошибка выбора фото:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать фото.');
    }
  }, []);

  // Удаление аватарки
  const removeAvatar = useCallback(async () => {
    setAvatarUri(null);
    await setItem(AVATAR_KEY, null);
  }, []);

  return {
    avatarUri,
    pickAvatar,
    removeAvatar,
    isLoading,
  };
}