// src/app/appointment/new.tsx

import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Colors, Spacing, Typography } from '../../constants';

// === ТИП ДАННЫХ ФОРМЫ ===
// interface описывает структуру данных.
// Каждое поле формы имеет строковый тип (string).
interface AppointmentForm {
  patientName: string;
  phone: string;
  email: string;
  date: string;
  complaints: string;
}

// === ТИП ОШИБОК ===
// Partial<AppointmentForm> — такой же объект, но ВСЕ поля необязательные.
// Это потому что ошибка может быть только у некоторых полей.
type FormErrors = Partial<AppointmentForm>;

export default function NewAppointmentScreen() {
  const { doctorId, doctorName } = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
  }>();

  // === СОСТОЯНИЕ ФОРМЫ ===
  // Храним все поля формы в одном объекте state.
  // useState принимает начальные значения.
  const [form, setForm] = useState<AppointmentForm>({
    patientName: '',
    phone: '',
    email: '',
    date: '',
    complaints: '',
  });

  // Состояние ошибок — изначально пустой объект (нет ошибок)
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Состояние загрузки (для кнопки)
  const [isLoading, setIsLoading] = useState(false);

  // === ФУНКЦИЯ ОБНОВЛЕНИЯ ПОЛЯ ===
  // Принимает имя поля и новое значение.
  // keyof AppointmentForm — TypeScript гарантирует, что field
  // может быть только 'patientName', 'phone', 'email', 'date' или 'complaints'.
  const updateField = (field: keyof AppointmentForm, value: string) => {
    // Обновляем форму: копируем старые значения (...prev), 
    // заменяем одно поле ([field]: value).
    setForm(prev => ({ ...prev, [field]: value }));

    // Убираем ошибку для этого поля при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // === ФУНКЦИЯ ВАЛИДАЦИИ ===
  // Проверяет все поля и возвращает true, если всё ОК.
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Проверка имени
    // .trim() — убирает пробелы по краям.
    // Без trim() строка из одних пробелов "   " прошла бы проверку.
    if (!form.patientName.trim()) {
      newErrors.patientName = 'Введите ФИО пациента';
    } else if (form.patientName.trim().length < 3) {
      newErrors.patientName = 'ФИО должно содержать минимум 3 символа';
    }

    // Проверка телефона
    // Regex (регулярное выражение) для российского телефона:
    // ^ — начало строки
    // \+7 — начинается с +7
    // \d{10} — ровно 10 цифр после +7
    // $ — конец строки
    const phoneRegex = /^\+7\d{10}$/;
    const cleanPhone = form.phone.replace(/[\s\-\(\)]/g, '');
    // Убираем пробелы, дефисы, скобки перед проверкой
    
    if (!form.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Формат: +7XXXXXXXXXX (11 цифр)';
    }

    // Проверка email
    // Regex для email:
    // [^\s@]+ — один или более символов, кроме пробела и @
    // @ — символ @
    // [^\s@]+ — домен
    // \. — точка
    // [^\s@]+ — зона (.ru, .com и т.д.)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    // Проверка даты
    // Regex для даты в формате ДД.ММ.ГГГГ:
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!form.date.trim()) {
      newErrors.date = 'Введите желаемую дату';
    } else if (!dateRegex.test(form.date)) {
      newErrors.date = 'Формат: ДД.ММ.ГГГГ';
    }

    // Проверка жалоб (необязательное, но если ввёл — минимум 10 символов)
    if (form.complaints.trim() && form.complaints.trim().length < 10) {
      newErrors.complaints = 'Опишите жалобы подробнее (минимум 10 символов)';
    }

    // Устанавливаем ошибки
    setErrors(newErrors);

    // Object.keys() возвращает массив ключей объекта.
    // Если ключей 0 — ошибок нет — валидация прошла.
    return Object.keys(newErrors).length === 0;
  };

  // === ФУНКЦИЯ ОТПРАВКИ ФОРМЫ ===
  const handleSubmit = async () => {
    // Сначала валидируем
    if (!validate()) return;
    // Если validate() вернул false — выходим из функции (return).

    setIsLoading(true);

    // Имитируем отправку на сервер (задержка 1.5 секунды)
    // В ПР №6 мы заменим это на реальный запрос к API.
    // setTimeout — выполняет код через указанное время.
    setTimeout(() => {
      setIsLoading(false);
      
      // Alert.alert — стандартное модальное окно ОС
      Alert.alert(
        'Запись создана! ✅',
        `${form.patientName}, вы записаны ${form.date}${doctorName ? ` к врачу ${doctorName}` : ''}.`,
        [
          {
            text: 'Отлично',
            onPress: () => router.back(),
            // При нажатии «Отлично» — возвращаемся назад
          },
        ],
      );
    }, 1500);
  };

  return (
    // KeyboardAvoidingView — автоматически поднимает контент,
    // когда появляется клавиатура, чтобы поля не скрывались за ней.
    // behavior — отличается на iOS и Android.
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // Platform.OS — возвращает 'ios' или 'android'
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        // keyboardShouldPersistTaps="handled" — клавиатура не скрывается
        // при нажатии на другие элементы внутри ScrollView
      >
        {/* Заголовок */}
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
          // onChangeText — вызывается при каждом изменении текста
          // text — новый текст в поле
          error={errors.patientName}
          autoCapitalize="words"
          // autoCapitalize="words" — первая буква каждого слова — заглавная
        />

        {/* Поле: Телефон */}
        <Input
          label="Телефон *"
          placeholder="+79001234567"
          value={form.phone}
          onChangeText={(text) => updateField('phone', text)}
          error={errors.phone}
          keyboardType="phone-pad"
          // keyboardType="phone-pad" — открывает цифровую клавиатуру
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
          // autoCapitalize="none" — без автозаглавной (email пишется строчными)
        />

        {/* Поле: Дата */}
        <Input
          label="Желаемая дата приёма *"
          placeholder="25.01.2025"
          value={form.date}
          onChangeText={(text) => updateField('date', text)}
          error={errors.date}
          keyboardType="numbers-and-punctuation"
        />

        {/* Поле: Жалобы */}
        <Input
          label="Жалобы / причина обращения"
          placeholder="Опишите свои симптомы..."
          value={form.complaints}
          onChangeText={(text) => updateField('complaints', text)}
          error={errors.complaints}
          multiline
          // multiline — многострочное поле (как textarea в HTML)
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
          // textAlignVertical: 'top' — текст начинается сверху (для Android)
        />

        {/* Кнопка отправки */}
        <Button
          title="Записаться на приём"
          onPress={handleSubmit}
          loading={isLoading}
        />

        {/* Кнопка отмены */}
        <Button
          title="Отмена"
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: Spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
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
});