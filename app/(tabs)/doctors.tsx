// src/app/(tabs)/doctors.tsx

import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';
import { useApp } from '../../contexts/AppContext';
import { getSpecialists, Specialist } from '../../services/specialists';

export default function SpecialistsScreen() {
  const { isFavorite, toggleFavorite } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('Все');

  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // === ЗАГРУЗКА ИЗ БД ===
  const loadSpecialists = useCallback(async () => {
    const data = await getSpecialists(); // тянем всех, фильтруем локально
    setSpecialists(data);
  }, []);

  // Первая загрузка
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadSpecialists();
      setIsLoading(false);
    };
    init();
  }, [loadSpecialists]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSpecialists();
    setRefreshing(false);
  }, [loadSpecialists]);

  // Список профессий для фильтра — собираем из загруженных данных
  const professions = useMemo(() => {
    const set = new Set(specialists.map((s) => s.profession));
    return ['Все', ...Array.from(set)];
  }, [specialists]);

  // Фильтрация (по профессии + поиск по имени/специализации)
  const filtered = useMemo(() => {
    let result = specialists;

    if (selectedProfession !== 'Все') {
      result = result.filter((s) => s.profession === selectedProfession);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.profession.toLowerCase().includes(q) ||
          (s.specialization?.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  }, [specialists, selectedProfession, searchQuery]);

  // === КАРТОЧКА СПЕЦИАЛИСТА ===
  const renderItem = useCallback(
    ({ item }: { item: Specialist }) => {
      const fav = isFavorite(item.id);
      const company = item.companies?.name ?? 'Частный специалист';
      const initial = item.full_name.charAt(0).toUpperCase();

      return (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/doctor/${item.id}`)}
        >
          {/* Аватар */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          {/* Инфо */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.full_name}
            </Text>
            <Text style={styles.cardProfession} numberOfLines={1}>
              {item.profession}
              {item.specialization ? ` • ${item.specialization}` : ''}
            </Text>
            <Text style={styles.cardCompany} numberOfLines={1}>
              🏢 {company}
            </Text>
            <View style={styles.cardBottom}>
              <Text style={styles.cardRating}>⭐ {item.rating}</Text>
              {item.price ? (
                <Text style={styles.cardPrice}>{item.price} ₽</Text>
              ) : null}
            </View>
          </View>

          {/* Избранное */}
          <Pressable
            hitSlop={10}
            onPress={() => toggleFavorite(item.id)}
            style={styles.favButton}
          >
            <Text style={styles.favIcon}>{fav ? '❤️' : '🤍'}</Text>
          </Pressable>
        </Pressable>
      );
    },
    [isFavorite, toggleFavorite]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={styles.emptyTitle}>Специалисты не найдены</Text>
        <Text style={styles.emptySubtitle}>
          Попробуйте изменить параметры поиска
        </Text>
      </View>
    ),
    []
  );

  // === ЗАГРУЗКА ===
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Поиск */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по имени или профессии..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {/* Фильтр профессий */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {professions.map((prof) => {
            const active = prof === selectedProfession;
            return (
              <Pressable
                key={prof}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedProfession(prof)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {prof}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Счётчик */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsText}>
          {filtered.length} {getWord(filtered.length)}
        </Text>
      </View>

      {/* Список */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

// Склонение "специалист"
function getWord(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return 'специалистов';
  if (lastOne === 1) return 'специалист';
  if (lastOne >= 2 && lastOne <= 4) return 'специалиста';
  return 'специалистов';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  listContent: { paddingBottom: 20, flexGrow: 1 },

  // Поиск
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
  searchIcon: { fontSize: 18, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  
  filterWrapper: {
    height: 56,
    marginBottom: Spacing.sm,
  },

  // Фильтр-чипы
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  chip: {
    height: 36,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { ...Typography.caption, color: Colors.textPrimary },
  chipTextActive: { color: Colors.textOnPrimary, fontWeight: '600' },

  // Счётчик
  resultsCount: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  resultsText: { ...Typography.caption, fontWeight: '500' },

  // Карточка
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  cardInfo: { flex: 1 },
  cardName: { ...Typography.h3, fontSize: 16, marginBottom: 2 },
  cardProfession: {
    ...Typography.caption,
    color: Colors.primary,
    marginBottom: 2,
  },
  cardCompany: { ...Typography.caption, marginBottom: 4 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardRating: { ...Typography.caption, fontWeight: '600' },
  cardPrice: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  favButton: { padding: Spacing.sm },
  favIcon: { fontSize: 22 },

  // Пусто
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.lg },
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
});