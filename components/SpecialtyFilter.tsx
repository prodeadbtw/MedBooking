// src/components/SpecialtyFilter.tsx

// Горизонтальный скроллящийся список «таблеток» (chips/pills)
// для фильтрации врачей по специальности.
// Выглядит так: [Все] [Терапевт] [Кардиолог] [Невролог] ...
// Активная «таблетка» — синяя, остальные — серые.

import React, { memo } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Colors, Spacing } from '../constants';
import { SPECIALTIES, Specialty } from '../data/doctors';

interface SpecialtyFilterProps {
  selected: Specialty;
  // Текущая выбранная специальность
  onSelect: (specialty: Specialty) => void;
  // Функция, вызываемая при выборе специальности
}

const SpecialtyFilter: React.FC<SpecialtyFilterProps> = memo(
  ({ selected, onSelect }) => {
    return (
      <View style={styles.container}>
        {/* ScrollView с horizontal — горизонтальная прокрутка */}
        <ScrollView
          horizontal
          // horizontal — контент прокручивается горизонтально (влево-вправо)
          showsHorizontalScrollIndicator={false}
          // Скрываем полоску прокрутки — так красивее
          contentContainerStyle={styles.scrollContent}
        >
          {/* Перебираем массив специальностей и рисуем кнопку для каждой */}
          {SPECIALTIES.map((specialty) => {
            // .map() — перебирает массив и для каждого элемента
            // возвращает новый элемент (в нашем случае — Pressable)
            const isActive = specialty === selected;
            // isActive — true, если эта специальность сейчас выбрана

            return (
              <Pressable
                key={specialty}
                // key — обязательный атрибут при рендере списка.
                // React использует key для отслеживания, какой элемент изменился.
                // Должен быть уникальным — у нас названия специальностей уникальны.
                style={[
                  styles.chip,
                  isActive && styles.chipActive,
                  // Если активная — добавляем синие стили
                ]}
                onPress={() => onSelect(specialty)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive && styles.chipTextActive,
                  ]}
                >
                  {specialty}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }
);

SpecialtyFilter.displayName = 'SpecialtyFilter';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    // Отступы по бокам, чтобы первая и последняя «таблетка»
    // не прилипали к краям экрана
    paddingVertical: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    // Скругление 20 — создаёт форму «таблетки»/«пилюли»
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    // Отступ между «таблетками»
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.textOnPrimary,
    // Белый текст на синем фоне
  },
});

export default SpecialtyFilter;