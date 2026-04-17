// src/services/api.ts

// API-СЕРВИС
// Централизованное место для всех HTTP-запросов.
// Зачем отдельный файл?
// 1. Все запросы в одном месте — легко менять URL сервера
// 2. Единообразная обработка ошибок
// 3. Можно добавить авторизацию (токен) в одном месте
// 4. Легко заменить mock API на настоящий сервер

import { Platform } from 'react-native';
import { Appointment } from '../data/appointments';
import { Doctor } from '../data/doctors';

// === БАЗОВЫЙ URL ===
// На Android-эмуляторе localhost = сам эмулятор, а не компьютер.
// 10.0.2.2 — специальный адрес, который указывает на localhost компьютера
// из Android-эмулятора.
// На реальном устройстве нужно использовать IP-адрес компьютера
// в локальной сети (например, 192.168.1.100).
//
// Как узнать свой IP:
// Windows: ipconfig → IPv4 Address
// Mac/Linux: ifconfig → inet

const getBaseUrl = (): string => {
  if (__DEV__) {
    // __DEV__ — глобальная переменная React Native.
    // true в режиме разработки, false в production-сборке.

    // Для реального устройства через Expo Go — 
    // замени на IP своего компьютера:
    // return 'http://192.168.1.XXX:3001';

    if (Platform.OS === 'ios') {
      return 'http://192.168.1.96:3001';
    }
    // iOS симулятор и веб — localhost работает
    return 'http://localhost:3001';
  }
  // В production — URL реального сервера
  return 'https://api.medbooking.example.com';
};

const BASE_URL = getBaseUrl();

// === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ===
// Обёртка над fetch с обработкой ошибок и JSON-парсингом.
// Все запросы проходят через эту функцию.
//
// Дженерик <T> — тип возвращаемых данных.
// Например: request<Doctor[]>('/doctors') — вернёт массив врачей.

async function request<T>(
  endpoint: string,
  // endpoint — путь к ресурсу: '/doctors', '/appointments'
  options: RequestInit = {}
  // options — настройки запроса (метод, тело, заголовки).
  // RequestInit — встроенный тип TypeScript для настроек fetch.
  // = {} — значение по умолчанию (пустой объект).
): Promise<T> {
  // Формируем полный URL: http://localhost:3001/doctors
  const url = `${BASE_URL}${endpoint}`;

  try {
    // fetch — встроенная функция для HTTP-запросов.
    // Возвращает Promise<Response> — обещание ответа от сервера.
    const response = await fetch(url, {
      // Заголовки по умолчанию
      headers: {
        'Content-Type': 'application/json',
        // Говорим серверу: "я отправляю данные в формате JSON"
        ...options.headers,
        // Если переданы дополнительные заголовки — добавляем их
      },
      ...options,
      // Остальные настройки (method, body и т.д.)
    });

    // Проверяем HTTP-статус ответа
    if (!response.ok) {
      // response.ok = true если статус 200-299
      // Если статус 400, 404, 500 и т.д. — это ошибка
      throw new Error(
        `HTTP ошибка: ${response.status} ${response.statusText}`
        // response.status = 404
        // response.statusText = "Not Found"
      );
    }

    // Парсим ответ из JSON-строки в JavaScript-объект
    const data: T = await response.json();
    return data;
  } catch (error) {
    // Ловим ошибки:
    // 1. Сетевая ошибка (нет интернета, сервер не отвечает)
    // 2. HTTP ошибка (404, 500)
    // 3. Ошибка парсинга JSON

    if (error instanceof TypeError && error.message === 'Network request failed') {
      // TypeError с сообщением 'Network request failed' —
      // означает, что запрос не дошёл до сервера.
      throw new Error(
        'Нет соединения с сервером. Проверьте подключение к интернету.'
      );
    }

    throw error;
    // Пробрасываем ошибку дальше — 
    // вызывающий код решит, как её обработать
  }
}

// === API ВРАЧЕЙ ===
export const doctorsApi = {
  // Получить всех врачей
  getAll: (): Promise<Doctor[]> => {
    return request<Doctor[]>('/doctors');
    // GET http://localhost:3001/doctors
    // Метод GET используется по умолчанию в fetch
  },

  // Получить врача по ID
  getById: (id: string): Promise<Doctor> => {
    return request<Doctor>(`/doctors/${id}`);
    // GET http://localhost:3001/doctors/3
  },

  // Поиск врачей по специальности
  getBySpecialty: (specialty: string): Promise<Doctor[]> => {
    return request<Doctor[]>(
      `/doctors?specialty=${encodeURIComponent(specialty)}`
      // encodeURIComponent — кодирует спецсимволы для URL.
      // "Кардиолог" → "%D0%9A%D0%B0%D1%80%D0%B4%D0%B8%D0%BE%D0%BB%D0%BE%D0%B3"
      // json-server поддерживает фильтрацию через query-параметры:
      // /doctors?specialty=Кардиолог → только кардиологи
    );
  },
};

// === API ЗАПИСЕЙ ===
export const appointmentsApi = {
  // Получить все записи
  getAll: (): Promise<Appointment[]> => {
    return request<Appointment[]>('/appointments');
  },

  // Создать новую запись
  create: (data: Omit<Appointment, 'id'>): Promise<Appointment> => {
    return request<Appointment>('/appointments', {
      method: 'POST',
      // POST — метод для создания новых ресурсов
      body: JSON.stringify(data),
      // body — тело запроса. Данные, которые мы отправляем на сервер.
      // JSON.stringify — преобразуем объект в JSON-строку,
      // потому что HTTP передаёт только текст.
    });
    // json-server автоматически сгенерирует id для новой записи
  },

  // Обновить запись (например, изменить статус)
  update: (
    id: string,
    data: Partial<Appointment>
    // Partial<Appointment> — все поля необязательные.
    // Можно передать только { status: 'cancelled' },
    // не отправляя все остальные поля.
  ): Promise<Appointment> => {
    return request<Appointment>(`/appointments/${id}`, {
      method: 'PATCH',
      // PATCH — метод для частичного обновления.
      // PUT — для полного обновления (нужно передать ВСЕ поля).
      body: JSON.stringify(data),
    });
  },

  // Удалить запись
  delete: (id: string): Promise<void> => {
    return request<void>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};

// === API ПОЛЬЗОВАТЕЛЕЙ ===
export interface UserData {
  id?: string;
  email: string;
  password: string;
  name: string;
  phone: string;
}

export const usersApi = {
  // Регистрация
  register: (data: UserData): Promise<UserData> => {
    return request<UserData>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Вход (ищем пользователя по email и паролю)
  login: async (
    email: string,
    password: string
  ): Promise<UserData | null> => {
    // json-server поддерживает фильтрацию:
    // /users?email=test@mail.ru&password=123
    const users = await request<UserData[]>(
      `/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    );
    // Если массив не пустой — пользователь найден
    return users.length > 0 ? users[0] : null;
  },

  // Обновить профиль
  update: (id: string, data: Partial<UserData>): Promise<UserData> => {
    return request<UserData>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};