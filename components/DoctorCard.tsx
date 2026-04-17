// src/components/DoctorCard.tsx — ОБНОВЛЁННАЯ ВЕРСИЯ

import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../constants';
import { Doctor } from '../data/doctors';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: (doctor: Doctor) => void;
  isFavorite?: boolean;                              // НОВОЕ
  onToggleFavorite?: (doctorId: string) => void;     // НОВОЕ
}

const DoctorCard: React.FC<DoctorCardProps> = memo(
  ({ doctor, onPress, isFavorite = false, onToggleFavorite }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => onPress(doctor)}
      >
        {/* Аватар */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{doctor.photo}</Text>
        </View>

        {/* Информация */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {doctor.name}
          </Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.rating}>⭐ {doctor.rating}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.reviews}>
              {doctor.reviewsCount} отзывов
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.experience}>
              {doctor.experience} лет
            </Text>
          </View>
          <Text style={styles.price}>от {doctor.price} ₽</Text>
        </View>

        {/* НОВОЕ: Кнопка избранного + стрелка */}
        <View style={styles.rightSection}>
          {onToggleFavorite && (
            <Pressable
              style={styles.favoriteButton}
              onPress={() => onToggleFavorite(doctor.id)}
              // Важно: onPress на favoriteButton НЕ вызовет onPress карточки,
              // потому что React Native останавливает «всплытие» события.
              hitSlop={8}
              // hitSlop — увеличивает область нажатия на 8px со всех сторон.
              // Маленькую иконку сердечка сложно нажать точно —
              // hitSlop решает эту проблему UX.
            >
              <Text style={styles.favoriteIcon}>
                {isFavorite ? '❤️' : '🤍'}
                {/* Красное сердце если избранный, белое — если нет */}
              </Text>
            </Pressable>
          )}
          <Text style={styles.arrow}>›</Text>
        </View>
      </Pressable>
    );
  }
);

DoctorCard.displayName = 'DoctorCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: Spacing.borderRadius.full,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatar: {
    fontSize: 30,
  },
  infoContainer: {
    flex: 1,
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
  },
  rating: { fontSize: 12, color: Colors.textSecondary },
  dot: { fontSize: 12, color: Colors.textSecondary, marginHorizontal: 4 },
  reviews: { fontSize: 12, color: Colors.textSecondary },
  experience: { fontSize: 12, color: Colors.textSecondary },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  // НОВЫЕ СТИЛИ
  rightSection: {
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  favoriteButton: {
    padding: 4,
    marginBottom: 4,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  arrow: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
});

export default DoctorCard;