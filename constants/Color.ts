// src/constants/Colors.ts

// Теперь у нас ДВЕ цветовые схемы: светлая и тёмная.
// Каждая — объект с одинаковыми ключами, но разными значениями.
// Компоненты используют ключи (primary, background, и т.д.),
// а значения подставляются автоматически в зависимости от темы.

const lightColors = {
  primary: '#2B6CB0',
  primaryLight: '#4299E1',
  primaryDark: '#1A365D',

  background: '#F7FAFC',
  surface: '#FFFFFF',

  textPrimary: '#1A202C',
  textSecondary: '#718096',
  textOnPrimary: '#FFFFFF',

  success: '#38A169',
  warning: '#D69E2E',
  error: '#E53E3E',

  border: '#E2E8F0',
  divider: '#EDF2F7',
};

const darkColors = {
  primary: '#4299E1',
  // В тёмной теме primary чуть светлее — лучше видно на тёмном фоне
  primaryLight: '#63B3ED',
  primaryDark: '#2B6CB0',

  background: '#1A202C',
  // Тёмный серо-синий фон
  surface: '#2D3748',
  // Чуть светлее — для карточек

  textPrimary: '#F7FAFC',
  // Почти белый текст на тёмном фоне
  textSecondary: '#A0AEC0',
  textOnPrimary: '#FFFFFF',

  success: '#48BB78',
  warning: '#ECC94B',
  error: '#FC8181',

  border: '#4A5568',
  divider: '#2D3748',
};

// Тип цветовой схемы — все ключи из lightColors
export type ColorScheme = typeof lightColors;

// Объект с обеими темами
export const themes = {
  light: lightColors,
  dark: darkColors,
};

// Экспорт по умолчанию — светлая тема (для обратной совместимости)
// Компоненты, которые мы уже написали, используют `import Colors from ...`
// Они продолжат работать, но мы постепенно перейдём на ThemeContext.
const Colors = lightColors;
export default Colors;