// src/app/(tabs)/doctors.tsx

import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DoctorCard from '../../components/DoctorCard';
import SpecialtyFilter from '../../components/SpecialtyFilter';
import { Colors, Spacing, Typography } from '../../constants';
import { useApp } from '../../contexts/AppContext';
import { Doctor, Specialty } from '../../data/doctors';
import { useDoctors } from '../../hooks/useDoctors';

export default function DoctorsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty>('Все');
  const { isFavorite, toggleFavorite } = useApp();
  // НОВОЕ: Загружаем врачей с сервера вместо локальных данных
  const { doctors, isLoading, error, refetch } = useDoctors();
  // doctors — массив врачей (с сервера или локальные как fallback)
  // isLoading — идёт ли загрузка
  // error — текст ошибки (или null)
  // refetch — функция повторной загрузки

  // Состояние для pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Обработчик pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // ОБНОВЛЕНО: Используем doctors (из хука) вместо DOCTORS (из файла)
  const filteredDoctors = useMemo(() => {
    let result = doctors; // ← было DOCTORS, стало doctors
    // ... остальная фильтрация без изменений ...
    if (selectedSpecialty !== 'Все') {
      result = result.filter(
        (doctor) => doctor.specialty === selectedSpecialty
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialty.toLowerCase().includes(query)
      );
    }
    return result;
  }, [searchQuery, selectedSpecialty, doctors]);

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    router.push(`/doctor/${doctor.id}`);
  }, []);

  const renderDoctor = useCallback(
    ({ item }: { item: Doctor }) => (
      <DoctorCard
        doctor={item}
        onPress={handleDoctorPress}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggleFavorite}
      />
    ),
    [handleDoctorPress, isFavorite, toggleFavorite]
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={styles.emptyTitle}>Врачи не найдены</Text>
        <Text style={styles.emptySubtitle}>
          Попробуйте изменить параметры поиска
        </Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      {/* ====================================================
          КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Поиск и фильтр ВЫНЕСЕНЫ из FlatList.
          
          Раньше они были внутри ListHeaderComponent.
          Проблема: при каждом изменении searchQuery React
          пересоздавал ListHeaderComponent → TextInput терял фокус
          → клавиатура закрывалась.
          
          Теперь поиск и фильтр — это ОТДЕЛЬНЫЕ элементы над FlatList.
          Они перерисовываются сами по себе, не затрагивая FlatList.
          TextInput остаётся в фокусе → клавиатура не закрывается.
          ==================================================== */}

      {/* Поисковая строка — ВНЕ FlatList */}
      <View style={styles.searchContainer}>
        
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по имени или специальности..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          returnKeyType="search"
          // returnKeyType="search" — кнопка "Enter" на клавиатуре
          // будет показывать значок поиска (🔍) вместо "return"
        />
      </View>

      {/* Фильтр специальностей — ВНЕ FlatList */}
      <SpecialtyFilter
        selected={selectedSpecialty}
        onSelect={setSelectedSpecialty}
      />

      {/* Счётчик результатов — ВНЕ FlatList */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsText}>
          {filteredDoctors.length} {getDoctorWord(filteredDoctors.length)}
        </Text>
      </View>
      {/* Показываем предупреждение, если сервер недоступен */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            ⚠️ Офлайн-режим. Показаны сохранённые данные
          </Text>
        </View>
      )}

      {/* Список врачей — ТОЛЬКО карточки */}
      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctor}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        // НОВОЕ: Pull-to-refresh
        refreshing={refreshing}
        // refreshing — показывать ли индикатор обновления
        onRefresh={handleRefresh}
        // onRefresh — функция, вызываемая при «потянуть вниз»
        // Когда пользователь тянет список вниз — появляется
        // крутящийся индикатор и вызывается эта функция
      />
    </View>
  );
}

// Склонение слова "врач" (без изменений)
function getDoctorWord(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return 'врачей';
  if (lastOne === 1) return 'врач';
  if (lastOne >= 2 && lastOne <= 4) return 'врача';
  return 'врачей';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  headerTitle: {
    ...Typography.h1,
    marginTop: 50,
    marginBottom: 5,
    paddingHorizontal: Spacing.lg,
  },
  // Поисковая строка
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Spacing.borderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
  },

  // Счётчик результатов
  resultsCount: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  resultsText: {
    ...Typography.caption,
    fontWeight: '500',
  },

  // Пустой список
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: Colors.warning + '20',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Spacing.borderRadius.sm,
  },
  errorBannerText: {
    ...Typography.caption,
    color: Colors.warning,
    textAlign: 'center',
  },
});