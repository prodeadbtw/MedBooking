// src/services/storage.ts

// СЕРВИС ХРАНЕНИЯ ДАННЫХ
// Это «обёртка» (wrapper) над AsyncStorage.
// Зачем обёртка, а не использовать AsyncStorage напрямую?
// 1. Убирает дублирование try/catch и JSON-преобразований
// 2. Если захотим заменить AsyncStorage на другое хранилище — 
//    меняем только этот файл
// 3. Централизованная обработка ошибок
// 4. Типизация — TypeScript знает, что мы храним

import AsyncStorage from '@react-native-async-storage/async-storage';

// Префикс для всех ключей нашего приложения.
// Если на устройстве несколько приложений используют AsyncStorage,
// префикс предотвращает конфликты имён ключей.
const STORAGE_PREFIX = '@smartbooking:';

// === КЛЮЧИ ХРАНИЛИЩА ===
// Все ключи хранятся в одном месте — легко увидеть, что мы храним.
// as const — делает значения readonly и literal types. 
export const STORAGE_KEYS = {
  APPOINTMENTS: `${STORAGE_PREFIX}appointments`,
  FAVORITE_DOCTORS: `${STORAGE_PREFIX}favorite_doctors`,
  USER_PROFILE: `${STORAGE_PREFIX}user_profile`,
  APP_SETTINGS: `${STORAGE_PREFIX}app_settings`,
} as const;

// === УНИВЕРСАЛЬНЫЕ ФУНКЦИИ ===

/**
 * Сохраняет данные в хранилище.
 * @param key — ключ (имя) для данных
 * @param value — данные любого типа (объект, массив, строка, число)
 * 
 * Дженерик <T> — это "переменная типа".
 * Когда вызываешь setItem<Doctor[]>(...), T заменяется на Doctor[].
 * Это позволяет функции работать с ЛЮБЫМ типом данных.
 */
export async function setItem<T>(key: string, value: T): Promise<void> {
  // async — функция асинхронная (возвращает Promise).
  // Promise<void> — обещание, которое ничего не возвращает (просто сохраняет).
  try {
    // JSON.stringify — преобразует объект/массив в строку.
    // AsyncStorage может хранить ТОЛЬКО строки.
    // Пример: { name: "Иван" } → '{"name":"Иван"}'
    const jsonValue = JSON.stringify(value);
    
    // await — ждём, пока AsyncStorage запишет данные на диск.
    // Без await код пойдёт дальше, не дожидаясь записи.
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    // Если произошла ошибка (нет места на диске, например)
    console.error(`Ошибка сохранения [${key}]:`, error);
    // console.error — выводит ошибку в консоль (видно в терминале Expo)
    throw error;
    // throw — пробрасываем ошибку дальше,
    // чтобы вызывающий код мог её обработать
  }
}

/**
 * Читает данные из хранилища.
 * @param key — ключ для чтения
 * @returns данные или null, если ничего не сохранено
 */
export async function getItem<T>(key: string): Promise<T | null> {
  // Promise<T | null> — вернёт данные типа T или null
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    
    // Если данных нет — вернём null
    if (jsonValue === null) {
      return null;
    }
    
    // JSON.parse — обратное преобразование: строка → объект
    // '{"name":"Иван"}' → { name: "Иван" }
    return JSON.parse(jsonValue) as T;
    // as T — приведение типа. Говорим TypeScript:
    // "я знаю, что результат будет типа T"
  } catch (error) {
    console.error(`Ошибка чтения [${key}]:`, error);
    return null;
    // При ошибке чтения возвращаем null, а не бросаем ошибку.
    // Это безопаснее — приложение не упадёт.
  }
}

/**
 * Удаляет данные по ключу.
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Ошибка удаления [${key}]:`, error);
    throw error;
  }
}

/**
 * Очищает ВСЕ данные приложения.
 * Используется при выходе из аккаунта или для отладки.
 */
export async function clearAll(): Promise<void> {
  try {
    // Получаем все ключи в AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Фильтруем — удаляем только НАШИ ключи (с нашим префиксом)
    const ourKeys = allKeys.filter((key) =>
      key.startsWith(STORAGE_PREFIX)
    );
    
    // multiRemove — удаляет несколько ключей за один раз (эффективнее)
    if (ourKeys.length > 0) {
      await AsyncStorage.multiRemove(ourKeys);
    }
  } catch (error) {
    console.error('Ошибка очистки хранилища:', error);
    throw error;
  }
}