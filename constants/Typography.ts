// src/constants/Typography.ts

// Здесь мы определяем все стили текста, которые будем использовать.
// Это как «шаблоны» для разных типов текста в приложении.
// StyleSheet.create — это функция React Native для создания стилей.

import { StyleSheet } from 'react-native';
import Colors from './Colors';

// StyleSheet.create создаёт оптимизированный объект стилей.
// React Native не использует CSS — вместо этого стили задаются
// как JavaScript-объекты, но свойства очень похожи на CSS.
const Typography = StyleSheet.create({
  // Большой заголовок (название приложения, заголовки экранов)
  h1: {
    fontSize: 28,               // Размер шрифта в пикселях
    fontWeight: '700',          // Жирность: '700' = bold (жирный)
    color: Colors.textPrimary,  // Цвет берём из нашего файла Colors
    letterSpacing: 0.5,         // Расстояние между буквами
  },
  // Заголовок поменьше (заголовки секций)
  h2: {
    fontSize: 22,
    fontWeight: '600',          // '600' = semi-bold (полужирный)
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  // Подзаголовок (название карточки, элемента списка)
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  // Основной текст
  body: {
    fontSize: 16,
    fontWeight: '400',          // '400' = normal (обычный)
    color: Colors.textPrimary,
    lineHeight: 24,             // Высота строки — для удобства чтения
  },
  // Мелкий текст (подписи, даты)
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  // Текст кнопки
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Typography;