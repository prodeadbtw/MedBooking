// src/hooks/useLocation.ts

// CUSTOM HOOK — useLocation
// Определяет текущее местоположение пользователя.
// Находит ближайшую клинику (из захардкоженного списка).

import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

// Координаты клиник (моковые данные)
// В реальном проекте загружались бы с сервера.
interface Clinic {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
}

const CLINICS: Clinic[] = [
  {
    id: '1',
    name: 'МедЦентр на Медицинской',
    address: 'ул. Медицинская, 15',
    latitude: 55.7558,  // Москва (примерные координаты)
    longitude: 37.6173,
    phone: '+7 (495) 123-45-67',
  },
  {
    id: '2',
    name: 'Клиника Здоровье',
    address: 'ул. Лечебная, 42',
    latitude: 55.7620,
    longitude: 37.6250,
    phone: '+7 (495) 987-65-43',
  },
  {
    id: '3',
    name: 'Поликлиника №3',
    address: 'пр-т Врачей, 8',
    latitude: 55.7480,
    longitude: 37.6100,
    phone: '+7 (495) 555-33-22',
  },
];

interface UseLocationReturn {
  location: Location.LocationObject | null;
  // LocationObject содержит coords.latitude и coords.longitude
  nearestClinic: Clinic | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  clinics: Clinic[];
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [nearestClinic, setNearestClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ШАГ 1: Запрашиваем разрешение на доступ к геолокации
      const { status } = await Location.requestForegroundPermissionsAsync();
      // requestForegroundPermissionsAsync — разрешение на GPS
      // только пока приложение открыто (foreground).
      // requestBackgroundPermissionsAsync — и в фоне тоже (нужно редко).

      if (status !== 'granted') {
        setError('Нет доступа к геолокации');
        Alert.alert(
          'Нет доступа',
          'Для определения ближайшей клиники разрешите доступ к местоположению в настройках.'
        );
        return;
      }

      // ШАГ 2: Получаем текущие координаты
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        // Accuracy.Balanced — баланс между точностью и скоростью.
        // Accuracy.Highest — максимальная точность (дольше).
        // Accuracy.Low — быстро, но неточно.
      });

      setLocation(currentLocation);

      // ШАГ 3: Находим ближайшую клинику
      const nearest = findNearestClinic(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      setNearestClinic(nearest);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка определения местоположения';
      setError(message);
      console.error('Ошибка геолокации:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    location,
    nearestClinic,
    isLoading,
    error,
    requestLocation,
    clinics: CLINICS,
  };
}

// === ФОРМУЛА РАССТОЯНИЯ ===
// Формула Гаверсинуса — вычисляет расстояние между двумя
// точками на сфере (Земле) по их координатам.
function findNearestClinic(lat: number, lon: number): Clinic {
  let nearest = CLINICS[0];
  let minDistance = Infinity;
  // Infinity — бесконечность. Любое число меньше бесконечности,
  // поэтому первая же клиника станет ближайшей.

  for (const clinic of CLINICS) {
    const distance = getDistanceKm(lat, lon, clinic.latitude, clinic.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = clinic;
    }
  }

  return nearest;
}

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Радиус Земли в километрах
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  // toRad — переводим градусы в радианы (Math.sin/cos работают с радианами)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Расстояние в километрах
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
  // 180° = π радиан
}