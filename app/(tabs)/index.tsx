// src/app/(tabs)/index.tsx

// === ИМПОРТЫ ===
// Импорт — это подключение готового кода из библиотек или наших файлов.

// React — основа всего. Без него ничего не работает.
import React from 'react';

// Из React Native берём «строительные блоки» для интерфейса:
import {
  View,           // Контейнер — как <div> в HTML. Группирует другие элементы.
  Text,           // Текст — для любого текста на экране.
  StyleSheet,     // Для создания стилей (аналог CSS).
  ScrollView,     // Прокручиваемая область — если контент не помещается.
  Image,          // Для отображения картинок.
  StatusBar,      // Управление строкой статуса (время, батарейка вверху экрана).
} from 'react-native';

// Импортируем наши константы (цвета, типографику, отступы)
import { Colors, Typography, Spacing } from '../../constants';
import { Pressable } from 'react-native';
import { router } from 'expo-router';

// === КОМПОНЕНТ ===
// Компонент — это функция, которая возвращает кусочек интерфейса.
// export default — делает этот компонент доступным для других файлов.
// Expo Router автоматически отображает этот компонент как главный экран,
// потому что файл называется index.tsx и лежит в (tabs)/.

export default function HomeScreen() {
  return (
    // ScrollView — позволяет прокручивать содержимое, если оно не помещается
    // contentContainerStyle — стиль для СОДЕРЖИМОГО скролла (не самого контейнера)
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* StatusBar — настройка верхней панели телефона */}
      {/* barStyle="dark-content" — тёмные иконки (для светлого фона) */}
      <StatusBar barStyle="dark-content" />

      {/* === СЕКЦИЯ: Логотип и название === */}
      <View style={styles.heroSection}>
        {/* View с иконкой — имитируем логотип с помощью эмодзи */}
        {/* В реальном проекте здесь была бы картинка */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🏥</Text>
        </View>

        {/* Название приложения */}
        <Text style={styles.appName}>MedBooking</Text>

        {/* Слоган */}
        <Text style={styles.tagline}>
          Запись к врачу — быстро и удобно
        </Text>
      </View>

      {/* === СЕКЦИЯ: Описание функций === */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Возможности приложения</Text>

        {/* Карточка функции 1 */}
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📋</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Выбор специалиста</Text>
            <Text style={styles.featureDescription}>
              Найдите нужного врача по специализации, рейтингу и отзывам
            </Text>
          </View>
        </View>

        {/* Карточка функции 2 */}
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📅</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Онлайн-запись</Text>
            <Text style={styles.featureDescription}>
              Выберите удобное время и запишитесь без звонков и очередей
            </Text>
          </View>
        </View>

        {/* Карточка функции 3 */}
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🔔</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Напоминания</Text>
            <Text style={styles.featureDescription}>
              Получайте уведомления о предстоящих записях
            </Text>
          </View>
        </View>

        {/* Карточка функции 4 */}
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>👤</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Личный кабинет</Text>
            <Text style={styles.featureDescription}>
              История посещений и управление записями в одном месте
            </Text>
          </View>
        </View>
      </View>
      {/* === СЕКЦИЯ: Быстрые действия === */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Быстрые действия</Text>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push('/doctor/1')}
          // router.push — переход на другой экран.
          // '/doctor/1' — открыть экран врача с id=1.
          // push — добавляет экран в стопку (можно вернуться «назад»).
        >
          <Text style={styles.actionIcon}>👨‍⚕️</Text>
          <Text style={styles.actionText}>Найти врача</Text>
          <Text style={styles.actionArrow}>→</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push('/appointment/new')}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionText}>Записаться на приём</Text>
          <Text style={styles.actionArrow}>→</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.actionIcon}>🔐</Text>
          <Text style={styles.actionText}>Войти в аккаунт</Text>
          <Text style={styles.actionArrow}>→</Text>
        </Pressable>
        </View>

      {/* === СЕКЦИЯ: Футер === */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Версия 1.0.0 • MedBooking © 2026
        </Text>
      </View>

    </ScrollView>
  );
}

// === СТИЛИ ===
// StyleSheet.create — создаёт объект стилей.
// Каждый ключ (container, heroSection и т.д.) — это имя стиля.
// Значение — объект с CSS-подобными свойствами.
//
// Отличия от обычного CSS:
// 1. camelCase вместо kebab-case: backgroundColor вместо background-color
// 2. Значения размеров — числа (не нужно писать 'px')
// 3. Flexbox по умолчанию — все View используют flex-вёрстку

const styles = StyleSheet.create({
  // Основной контейнер — растягивается на весь экран
  container: {
    flex: 1,                      // flex: 1 = занять всё доступное пространство
    backgroundColor: Colors.background,
  },

  // Стиль содержимого ScrollView
  contentContainer: {
    paddingBottom: 40,            // Отступ снизу, чтобы контент не прилипал к краю
  },

  // === Секция с логотипом ===
  heroSection: {
    alignItems: 'center',         // Выравнивание дочерних элементов по центру горизонтально
    paddingTop: 60,               // Отступ сверху
    paddingBottom: 40,            // Отступ снизу
    backgroundColor: Colors.primary, // Синий фон
    borderBottomLeftRadius: 30,   // Скругление нижнего левого угла
    borderBottomRightRadius: 30,  // Скругление нижнего правого угла
  },

  // Контейнер для «логотипа»
  logoContainer: {
    width: 100,                   // Ширина
    height: 100,                  // Высота
    borderRadius: Spacing.borderRadius.full, // Полный круг
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Белый с прозрачностью 20%
    justifyContent: 'center',     // Вертикальное выравнивание по центру
    alignItems: 'center',         // Горизонтальное выравнивание по центру
    marginBottom: Spacing.lg,     // Отступ снизу = 16
  },

  // Стиль эмодзи-логотипа
  logoEmoji: {
    fontSize: 50,                 // Размер эмодзи
  },

  // Название приложения
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textOnPrimary,  // Белый текст на синем фоне
    marginBottom: Spacing.sm,     // 8px отступ снизу
  },

  // Слоган
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)', // Белый с лёгкой прозрачностью
    textAlign: 'center',          // Текст по центру
    paddingHorizontal: Spacing.xxl, // Горизонтальные отступы по 24px
  },

  // === Секция с функциями ===
  featuresSection: {
    paddingHorizontal: Spacing.lg, // Горизонтальные отступы = 16
    paddingTop: Spacing.xxl,       // Отступ сверху = 24
  },

  // Заголовок секции
  sectionTitle: {
    ...Typography.h2,              // Spread-оператор (...) — копирует все свойства из Typography.h2
    marginBottom: Spacing.lg,      // + добавляем отступ снизу
  },

  // Карточка функции
  featureCard: {
    flexDirection: 'row',          // Элементы в строку (по горизонтали)
    // По умолчанию в React Native элементы идут столбиком (column).
    // 'row' = горизонтально, как слова в предложении.
    backgroundColor: Colors.surface, // Белый фон
    borderRadius: Spacing.borderRadius.md, // Скругление = 12
    padding: Spacing.lg,           // Отступ внутри = 16
    marginBottom: Spacing.md,      // Отступ снизу = 12

    // Тень (для iOS)
    shadowColor: '#000',           // Цвет тени
    shadowOffset: { width: 0, height: 2 }, // Смещение тени
    shadowOpacity: 0.08,           // Прозрачность тени (8%)
    shadowRadius: 8,               // Размытие тени

    // Тень (для Android) — elevation заменяет shadow* на Android
    elevation: 2,
  },

  // Иконка в карточке
  featureIcon: {
    fontSize: 32,                  // Размер эмодзи
    marginRight: Spacing.md,      // Отступ справа = 12
  },

  // Контейнер для текста в карточке
  featureTextContainer: {
    flex: 1,                       // Занять оставшееся пространство
    // Без flex: 1 текст может выйти за экран, потому что
    // не будет знать свою максимальную ширину.
  },

  // Заголовок карточки
  featureTitle: {
    ...Typography.h3,
    marginBottom: 4,
  },

  // Описание в карточке
  featureDescription: {
    ...Typography.caption,
    lineHeight: 20,
  },

  // === Футер ===
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,      // 32px сверху
    paddingBottom: Spacing.lg,     // 16px снизу
  },

  footerText: {
    ...Typography.caption,
  },
  actionsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },

  // Кнопка действия
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  actionIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },

  actionText: {
    ...Typography.body,
    flex: 1,
    fontWeight: '500',
  },

  actionArrow: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
});