// src/components/DoctorCard.tsx

// Это ПЕРЕИСПОЛЬЗУЕМЫЙ компонент — карточка врача в списке.
// Принцип: один компонент = одна задача.
// DoctorCard отвечает ТОЛЬКО за отображение одного врача.
// Он не знает, откуда пришли данные и что происходит при нажатии —
// это решает родительский компонент.

import React, { memo } from 'react';
// memo — функция для мемоизации компонента.
// Компонент, обёрнутый в memo, перерисовывается ТОЛЬКО если его props изменились.
// Это оптимизация: если список из 100 врачей, а изменился только один —
// перерисуется только одна карточка, а не все 100.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../constants';
import { Doctor } from '../data/doctors';

// === ТИПЫ PROPS ===
interface DoctorCardProps {
  doctor: Doctor;
  // doctor — объект с данными врача (тип Doctor из нашего файла данных)
  onPress: (doctor: Doctor) => void;
  // onPress — функция обратного вызова (callback).
  // Принимает объект врача, ничего не возвращает (void).
  // Родительский компонент передаст сюда функцию навигации.
}

// memo() оборачивает компонент — это и есть мемоизация
const DoctorCard: React.FC<DoctorCardProps> = memo(({ doctor, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        // pressed — true, когда пользователь удерживает палец на карточке.
        // При нажатии карточка становится чуть прозрачной — визуальная обратная связь.
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(doctor)}
      // При нажатии вызываем onPress и передаём данные врача
    >
      {/* Левая часть — фото */}
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{doctor.photo}</Text>
      </View>

      {/* Центральная часть — информация */}
      <View style={styles.infoContainer}>
        {/* Имя врача */}
        <Text style={styles.name} numberOfLines={1}>
          {/* numberOfLines={1} — текст не переносится, 
              если не помещается — добавляется "..." */}
          {doctor.name}
        </Text>

        {/* Специальность */}
        <Text style={styles.specialty}>{doctor.specialty}</Text>

        {/* Строка с рейтингом и опытом */}
        <View style={styles.detailsRow}>
          <Text style={styles.rating}>⭐ {doctor.rating}</Text>
          <Text style={styles.dot}>•</Text>
          {/* Точка-разделитель */}
          <Text style={styles.reviews}>
            {doctor.reviewsCount} отзывов
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.experience}>
            {doctor.experience} лет опыта
          </Text>
        </View>

        {/* Стоимость */}
        <Text style={styles.price}>от {doctor.price} ₽</Text>
      </View>

      {/* Правая часть — стрелка */}
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
});

// displayName нужен для отладки — в React DevTools будет видно имя компонента
// Без него memo() показывает "Anonymous"
DoctorCard.displayName = 'DoctorCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',      // Элементы в строку: фото | инфо | стрелка
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    // Тени
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
    // При нажатии карточка становится полупрозрачной
    // Это стандартный паттерн для кликабельных элементов
  },

  // Аватар
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: Spacing.borderRadius.full,
    // Полный круг (borderRadius >= половины ширины)
    backgroundColor: Colors.primaryLight + '20',
    // Светло-синий полупрозрачный фон
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatar: {
    fontSize: 30,
  },

  // Информация
  infoContainer: {
    flex: 1,
    // flex: 1 — занять всё оставшееся пространство между аватаром и стрелкой.
    // Без этого текст может вылезти за границы экрана.
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  specialty: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    // flexWrap: 'wrap' — если не помещается в строку,
    // элементы переносятся на следующую строку
  },
  rating: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dot: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginHorizontal: 4,
  },
  reviews: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  experience: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Стрелка
  arrow: {
    fontSize: 24,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
});

export default DoctorCard;