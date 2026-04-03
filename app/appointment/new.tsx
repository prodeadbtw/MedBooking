// src/app/appointment/new.tsx

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Colors, Spacing, Typography } from '../../constants';

// === ТИПЫ ===
interface AppointmentForm {
  patientName: string;
  phone: string;
  email: string;
  complaints: string;
  // Убрали date: string — теперь дата хранится отдельно как объект Date
}

type FormErrors = Partial<AppointmentForm> & { date?: string };
// & { date?: string } — добавляем поле date к ошибкам,
// хотя дата больше не часть формы (она в отдельном state)

export default function NewAppointmentScreen() {
  const { doctorId, doctorName } = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
  }>();

  // === СОСТОЯНИЕ ФОРМЫ ===
  const [form, setForm] = useState<AppointmentForm>({
    patientName: '',
    phone: '',
    email: '',
    complaints: '',
  });

  // === СОСТОЯНИЕ ДАТЫ ===
  // Дата хранится как объект Date (встроенный тип JavaScript).
  // null — значит дата ещё не выбрана.
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Показывать ли пикер даты?
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Временная дата — та, которую пользователь крутит в пикере,
  // но ещё не подтвердил (нужно для iOS, где пикер остаётся открытым)
  const [tempDate, setTempDate] = useState(new Date());

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // === ФУНКЦИЯ ОБНОВЛЕНИЯ ПОЛЯ (без изменений) ===
  const updateField = (field: keyof AppointmentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // === ФОРМАТИРОВАНИЕ ДАТЫ ===
  // Принимает объект Date, возвращает строку "25 января 2025"
  const formatDate = (date: Date): string => {
    // toLocaleDateString — встроенный метод Date для форматирования.
    // 'ru-RU' — русская локаль (месяцы по-русски).
    // Опции определяют формат: день (число), месяц (словом), год (4 цифры).
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // === ОБРАБОТЧИК ВЫБОРА ДАТЫ ===
  // Вызывается каждый раз, когда пользователь прокручивает «барабан»
  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    // event.type может быть:
    // 'set' — пользователь подтвердил выбор (Android)
    // 'dismissed' — пользователь нажал «Отмена» (Android)
    // 'neutralButtonPressed' — нажата нейтральная кнопка

    if (Platform.OS === 'android') {
      // На Android пикер закрывается автоматически после выбора
      setShowDatePicker(false);
      if (event.type === 'set' && date) {
        setSelectedDate(date);
        // Убираем ошибку даты
        if (errors.date) {
          setErrors(prev => ({ ...prev, date: undefined }));
        }
      }
    } else {
      // На iOS пикер остаётся открытым — сохраняем во временную дату
      // Подтверждение будет по кнопке "Готово"
      if (date) {
        setTempDate(date);
      }
    }
  };

  // === ПОДТВЕРЖДЕНИЕ ДАТЫ (для iOS) ===
  const confirmDate = () => {
    setSelectedDate(tempDate);
    setShowDatePicker(false);
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: undefined }));
    }
  };

  // === ОТМЕНА ВЫБОРА ДАТЫ (для iOS) ===
  const cancelDatePicker = () => {
    setShowDatePicker(false);
    // Возвращаем tempDate к выбранной дате (или текущей)
    setTempDate(selectedDate || new Date());
  };

  // === ВАЛИДАЦИЯ ===
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.patientName.trim()) {
      newErrors.patientName = 'Введите ФИО пациента';
    } else if (form.patientName.trim().length < 3) {
      newErrors.patientName = 'ФИО должно содержать минимум 3 символа';
    }

    const phoneRegex = /^\+7\d{10}$/;
    const cleanPhone = form.phone.replace(/[\s\-\(\)]/g, '');
    if (!form.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Формат: +7XXXXXXXXXX (11 цифр)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    // Валидация даты — теперь просто проверяем, выбрана ли она
    if (!selectedDate) {
      newErrors.date = 'Выберите дату приёма';
    } else {
      // Проверяем, что дата не в прошлом
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Сбрасываем время до начала дня
      if (selectedDate < today) {
        newErrors.date = 'Нельзя записаться на прошедшую дату';
      }
    }

    if (form.complaints.trim() && form.complaints.trim().length < 10) {
      newErrors.complaints = 'Опишите жалобы подробнее (минимум 10 символов)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === ОТПРАВКА ===
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Запись создана! ✅',
        `${form.patientName}, вы записаны на ${formatDate(selectedDate!)}${
          doctorName ? ` к врачу ${doctorName}` : ''
        }.`,
        // selectedDate! — восклицательный знак говорит TypeScript:
        // "я уверен, что это не null" (мы проверили в validate)
        [
          {
            text: 'Отлично',
            onPress: () => router.back(),
          },
        ],
      );
    }, 1500);
  };

  // === РЕНДЕР ПИКЕРА ДАТЫ ===
  // Вынесено в отдельную функцию для чистоты кода
  const renderDatePicker = () => {
    if (!showDatePicker) return null;
    // Если пикер не показывается — возвращаем null (ничего не рисуем)

    if (Platform.OS === 'ios') {
      // На iOS пикер показываем в модальном окне с кнопками
      // "Отмена" и "Готово", потому что iOS-пикер не закрывается сам
      return (
        <Modal
          transparent
          // transparent — фон за модалкой прозрачный
          animationType="slide"
          // animationType="slide" — модалка въезжает снизу
          visible={showDatePicker}
        >
          {/* Затемнение фона */}
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Шапка с кнопками */}
              <View style={styles.modalHeader}>
                <Pressable onPress={cancelDatePicker}>
                  <Text style={styles.modalCancelText}>Отмена</Text>
                </Pressable>
                <Text style={styles.modalTitle}>Выберите дату</Text>
                <Pressable onPress={confirmDate}>
                  <Text style={styles.modalConfirmText}>Готово</Text>
                </Pressable>
              </View>

              {/* Сам DateTimePicker — «барабан» */}
              <DateTimePicker
                value={tempDate}
                mode="date"
                // mode="date" — только дата (без времени)
                // Другие варианты: "time", "datetime"
                display="spinner"
                // display="spinner" — ЭТО И ЕСТЬ «БАРАБАН»!
                // Другие варианты:
                //   "default" — системный вид
                //   "compact" — компактный (iOS 14+)
                //   "inline" — встроенный календарь (iOS 14+)
                //   "spinner" — крутящиеся колёсики (наш выбор!)
                onChange={onDateChange}
                minimumDate={new Date()}
                // minimumDate — нельзя выбрать дату раньше сегодня
                maximumDate={
                  new Date(
                    new Date().setMonth(new Date().getMonth() + 3)
                  )
                }
                // maximumDate — нельзя записаться больше чем на 3 месяца вперёд
                locale="ru"
                // locale="ru" — русские названия месяцев и дней
              />
            </View>
          </View>
        </Modal>
      );
    }

    // На Android пикер показывается как системный диалог
    // Он сам закрывается после выбора
    return (
      <DateTimePicker
        value={tempDate}
        mode="date"
        display="spinner"
        // На Android "spinner" тоже работает — показывает барабан
        onChange={onDateChange}
        minimumDate={new Date()}
        maximumDate={
          new Date(new Date().setMonth(new Date().getMonth() + 3))
        }
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Информация о враче */}
        {doctorName && (
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorLabel}>Врач:</Text>
            <Text style={styles.doctorName}>{doctorName}</Text>
          </View>
        )}

        {/* Поле: ФИО */}
        <Input
          label="ФИО пациента *"
          placeholder="Иванов Иван Иванович"
          value={form.patientName}
          onChangeText={(text) => updateField('patientName', text)}
          error={errors.patientName}
          autoCapitalize="words"
        />

        {/* Поле: Телефон */}
        <Input
          label="Телефон *"
          placeholder="+79001234567"
          value={form.phone}
          onChangeText={(text) => updateField('phone', text)}
          error={errors.phone}
          keyboardType="phone-pad"
        />

        {/* Поле: Email */}
        <Input
          label="Email *"
          placeholder="example@mail.ru"
          value={form.email}
          onChangeText={(text) => updateField('email', text)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* === ПОЛЕ ДАТЫ — ТЕПЕРЬ ЭТО КНОПКА, А НЕ INPUT === */}
        <View style={styles.dateFieldContainer}>
          <Text style={styles.dateLabel}>Дата приёма *</Text>

          {/* Pressable вместо TextInput — при нажатии открывает пикер */}
          <Pressable
            style={[
              styles.dateButton,
              // Если есть ошибка — красная рамка
              errors.date ? styles.dateButtonError : null,
            ]}
            onPress={() => {
              // При открытии пикера — устанавливаем tempDate
              setTempDate(selectedDate || new Date());
              setShowDatePicker(true);
            }}
          >
            <Text
              style={[
                styles.dateButtonText,
                // Если дата не выбрана — серый текст (placeholder)
                !selectedDate && styles.dateButtonPlaceholder,
              ]}
            >
              {selectedDate
                ? formatDate(selectedDate)
                : 'Нажмите для выбора даты'}
            </Text>
            {/* Иконка календаря */}
            <Text style={styles.dateIcon}>📅</Text>
          </Pressable>

          {/* Ошибка даты */}
          {errors.date && (
            <Text style={styles.dateError}>{errors.date}</Text>
          )}
        </View>

        {/* Поле: Жалобы */}
        <Input
          label="Жалобы / причина обращения"
          placeholder="Опишите свои симптомы..."
          value={form.complaints}
          onChangeText={(text) => updateField('complaints', text)}
          error={errors.complaints}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
        />

        {/* Кнопки */}
        <Button
          title="Записаться на приём"
          onPress={handleSubmit}
          loading={isLoading}
        />

        <Button
          title="Отмена"
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: Spacing.md }}
        />

        {/* Рендерим DatePicker (если showDatePicker = true) */}
        {renderDatePicker()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// === СТИЛИ ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },

  // Информация о враче
  doctorInfo: {
    backgroundColor: Colors.primaryLight + '15',
    borderRadius: Spacing.borderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  doctorName: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    flex: 1,
  },

  // === СТИЛИ ПОЛЯ ДАТЫ ===
  dateFieldContainer: {
    marginBottom: Spacing.lg,
    // Такой же marginBottom как у Input, чтобы выглядело одинаково
  },
  dateLabel: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    color: Colors.textPrimary,
  },
  dateButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    // Иконка и текст в строку
    alignItems: 'center',
    justifyContent: 'space-between',
    // space-between — текст слева, иконка справа
    minHeight: 48,
    // Такая же высота, как у обычных Input
  },
  dateButtonError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  dateButtonPlaceholder: {
    color: Colors.textSecondary,
    // Серый цвет — как placeholder у обычного Input
  },
  dateIcon: {
    fontSize: 20,
    marginLeft: Spacing.sm,
  },
  dateError: {
    color: Colors.error,
    fontSize: 13,
    marginTop: Spacing.xs,
  },

  // === СТИЛИ МОДАЛЬНОГО ОКНА (iOS) ===
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    // flex-end — контент прижат к низу экрана
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    // Полупрозрачный чёрный фон — затемнение
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    // 34px снизу — для безопасной зоны iPhone (нижняя полоска)
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // space-between: "Отмена" слева, "Выберите дату" по центру, "Готово" справа
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h3,
  },
  modalCancelText: {
    ...Typography.body,
    color: Colors.error,
  },
  modalConfirmText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});