// src/hooks/useResponsive.ts

// CUSTOM HOOK — useResponsive
// Определяет размер экрана и предоставляет адаптивные значения.
// На планшете — больше колонок, другие отступы.

import { useWindowDimensions } from 'react-native';
// useWindowDimensions — хук, который возвращает ширину и высоту экрана.
// Обновляется автоматически при повороте устройства.

interface ResponsiveValues {
  isTablet: boolean;
  // true если ширина экрана >= 768px (стандартный порог для планшетов)
  screenWidth: number;
  screenHeight: number;
  horizontalPadding: number;
  // Горизонтальные отступы: больше на планшете
  numColumns: number;
  // Количество колонок: 1 на телефоне, 2 на планшете
  cardWidth: number;
  // Ширина карточки с учётом колонок
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  // 768px — ширина iPad mini в портретной ориентации.
  // Стандартный брейкпоинт для планшетов.

  const horizontalPadding = isTablet ? 32 : 16;
  const numColumns = isTablet ? 2 : 1;
  
  // Ширина карточки: общая ширина минус отступы, делим на количество колонок
  const cardWidth = isTablet
    ? (width - horizontalPadding * 2 - 12) / 2
    // -12 = gap (расстояние между колонками)
    : width - horizontalPadding * 2;

  return {
    isTablet,
    screenWidth: width,
    screenHeight: height,
    horizontalPadding,
    numColumns,
    cardWidth,
  };
}