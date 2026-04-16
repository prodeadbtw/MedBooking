// src/app/(tabs)/doctors.tsx

// Это ГЛАВНЫЙ ЭКРАН практической работы №4.
// Здесь реализовано:
// 1. Отображение списка врачей через FlatList
// 2. Поиск по имени
// 3. Фильтрация по специальности
// 4. Переход к деталям врача

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
import { Doctor, DOCTORS, Specialty } from '../../data/doctors';

export default function DoctorsScreen() {
  // === СОСТОЯНИЯ ===
  
  // Текст поиска
  const [searchQuery, setSearchQuery] = useState('');
  
  // Выбранная специальность для фильтрации
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty>('Все');

  // === ФИЛЬТРАЦИЯ ДАННЫХ ===
  // useMemo — «запоминает» результат вычисления.
  // Пересчитывает список ТОЛЬКО когда searchQuery или selectedSpecialty изменились.
  // Без useMemo список фильтровался бы при КАЖДОМ рендере компонента,
  // даже если ничего не изменилось — это трата ресурсов.
  const filteredDoctors = useMemo(() => {
    let result = DOCTORS;

    // Фильтрация по специальности
    if (selectedSpecialty !== 'Все') {
      result = result.filter(
        (doctor) => doctor.specialty === selectedSpecialty
      );
      // .filter() — создаёт новый массив, оставляя только элементы,
      // для которых функция вернула true.
    }

    // Фильтрация по поиску (имя или специальность)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      // .toLowerCase() — приводим к нижнему регистру,
      // чтобы поиск был регистронезависимым (иванова = Иванова)
      result = result.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialty.toLowerCase().includes(query)
        // .includes(query) — содержит ли строка подстроку query
      );
    }

    return result;
  }, [searchQuery, selectedSpecialty]);
  // [searchQuery, selectedSpecialty] — массив зависимостей.
  // useMemo пересчитает filteredDoctors ТОЛЬКО когда одно из этих значений изменится.

  // === ОБРАБОТЧИК НАЖАТИЯ НА КАРТОЧКУ ===
  // useCallback — «запоминает» функцию между рендерами.
  // Без useCallback при каждом рендере создавалась бы НОВАЯ функция,
  // и memo() в DoctorCard не работал бы (он сравнивает props,
  // а новая функция !== старая функция, даже если код одинаковый).
  const handleDoctorPress = useCallback((doctor: Doctor) => {
    router.push(`/doctor/${doctor.id}`);
    // Переходим на экран деталей врача.
    // /doctor/3 → откроет файл doctor/[id].tsx с id="3"
  }, []);
  // [] — пустой массив зависимостей = функция создаётся один раз и не меняется.

  // === РЕНДЕР ЭЛЕМЕНТА СПИСКА ===
  // Эту функцию FlatList вызывает для КАЖДОГО элемента данных.
  // item — один объект Doctor из массива filteredDoctors.
  const renderDoctor = useCallback(
    ({ item }: { item: Doctor }) => (
      <DoctorCard doctor={item} onPress={handleDoctorPress} />
    ),
    [handleDoctorPress]
  );

  // === КОМПОНЕНТ ПУСТОГО СПИСКА ===
  // Показывается, когда filteredDoctors пустой (ничего не найдено)
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

  // === ШАПКА СПИСКА ===
  // Это то, что отображается НАД списком: поисковая строка + фильтр + счётчик.
  // ListHeaderComponent — специальный prop FlatList для шапки.
  // Шапка прокручивается вместе со списком (в отличие от элементов вне FlatList).
  const renderHeader = useCallback(
    () => (
      <View>
        {/* Поисковая строка */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по имени или специальности..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            // onChangeText={setSearchQuery} — сокращённая запись.
            // Эквивалентно: onChangeText={(text) => setSearchQuery(text)}
            // Работает, потому что setSearchQuery принимает строку,
            // и onChangeText передаёт строку.
            autoCorrect={false}
            // autoCorrect={false} — отключаем автозамену,
            // потому что имена/специальности она коверкает
          />
        </View>

        {/* Фильтр по специальности */}
        <SpecialtyFilter
          selected={selectedSpecialty}
          onSelect={setSelectedSpecialty}
        />

        {/* Счётчик результатов */}
        <View style={styles.resultsCount}>
          <Text style={styles.resultsText}>
            {/* Формируем текст в зависимости от количества */}
            {filteredDoctors.length}{' '}
            {getDoctorWord(filteredDoctors.length)}
            {/* getDoctorWord — функция для правильного склонения */}
          </Text>
        </View>
      </View>
    ),
    [searchQuery, selectedSpecialty, filteredDoctors.length]
    // Зависимости — шапка перерисовывается, когда изменились:
    // 1. Текст поиска
    // 2. Выбранная специальность
    // 3. Количество результатов
  );

  // === РЕНДЕР ===
  return (
    <View style={styles.container}>
      <FlatList
        data={filteredDoctors}
        // data — массив данных. FlatList вызовет renderItem для каждого элемента.

        renderItem={renderDoctor}
        // renderItem — функция рендера одного элемента (карточки врача).

        keyExtractor={(item) => item.id}
        // keyExtractor — функция, возвращающая уникальный ключ для каждого элемента.
        // React использует ключи для эффективного обновления списка.
        // Если ключей не будет — React будет перерисовывать ВСЕ элементы
        // при любом изменении.

        ListHeaderComponent={renderHeader}
        // ListHeaderComponent — компонент над списком.
        // Прокручивается вместе со списком.

        ListEmptyComponent={renderEmptyList}
        // ListEmptyComponent — показывается, когда data — пустой массив.

        contentContainerStyle={styles.listContent}
        // Стиль содержимого (отступы)

        showsVerticalScrollIndicator={false}
        // Скрываем полоску прокрутки

        initialNumToRender={8}
        // Количество элементов, которые рисуются при первом рендере.
        // Остальные рисуются по мере прокрутки.
        // 8 — обычно хватает, чтобы заполнить экран.

        maxToRenderPerBatch={5}
        // Максимум элементов за одну «пачку» рендеринга.
        // Меньше = плавнее прокрутка, больше = быстрее загрузка.

        windowSize={5}
        // Определяет, сколько экранов «вперёд» и «назад» от видимой области
        // рендерить. 5 = 2 экрана вверх + текущий + 2 экрана вниз.
        // Это баланс между памятью и плавностью.
      />
    </View>
  );
}

// === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ===
// Правильное склонение слова «врач» в зависимости от числа.
// 1 врач, 2 врача, 5 врачей
function getDoctorWord(count: number): string {
  // Определяем последние две цифры числа
  const lastTwo = count % 100;
  // Определяем последнюю цифру
  const lastOne = count % 10;

  // 11-19 — всегда "врачей" (11 врачей, 12 врачей...)
  if (lastTwo >= 11 && lastTwo <= 19) {
    return 'врачей';
  }

  // Последняя цифра 1 — "врач" (1 врач, 21 врач, 31 врач)
  if (lastOne === 1) {
    return 'врач';
  }

  // Последняя цифра 2-4 — "врача" (2 врача, 23 врача)
  if (lastOne >= 2 && lastOne <= 4) {
    return 'врача';
  }

  // Всё остальное — "врачей" (5 врачей, 10 врачей)
  return 'врачей';
}

// === СТИЛИ ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingTop: Spacing.md,
    paddingBottom: 20,
    // flexGrow: 1 нужен, чтобы ListEmptyComponent
    // мог занять весь экран (для центрирования "Не найдено")
    flexGrow: 1,
  },

  // Поисковая строка
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
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
    // flex: 1 — поле ввода занимает всё оставшееся пространство
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
    // flex: 1 + flexGrow: 1 в listContent — позволяют
    // центрировать содержимое по вертикали
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
});