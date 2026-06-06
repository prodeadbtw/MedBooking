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
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface AppointmentForm {
  date: string; // ДД.ММ.ГГГГ
  time: string; // ЧЧ:ММ
  comment: string;
}

type FormErrors = Partial<AppointmentForm>;

export default function NewAppointmentScreen() {
  const { addAppointment } = useApp();
  const { state: authState } = useAuth();

  const { specialistId, specialistName } = useLocalSearchParams<{
    specialistId: string;
    specialistName: string;
  }>();

  const [form, setForm] = useState<AppointmentForm>({
    date: '',
    time: '',
    comment: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof AppointmentForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Дата: ДД.ММ.ГГГГ
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!form.date.trim()) {
      newErrors.date = 'Введите дату';
    } else if (!dateRegex.test(form.date)) {
      newErrors.date = 'Формат: ДД.ММ.ГГГГ';
    }

    // Время: ЧЧ:ММ
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!form.time.trim()) {
      newErrors.time = 'Введите время';
    } else if (!timeRegex.test(form.time)) {
      newErrors.time = 'Формат: ЧЧ:ММ (например, 14:30)';
    }

    if (form.comment.trim() && form.comment.trim().length < 5) {
      newErrors.comment = 'Опишите подробнее (минимум 5 символов)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Сначала проверяем авторизацию — без неё записаться нельзя
    if (!authState.isAuthenticated) {
      Alert.alert(
        'Требуется вход',
        'Чтобы записаться, войдите или зарегистрируйтесь.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Войти', onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }

    if (!validate()) return;
    if (!specialistId) {
      Alert.alert('Ошибка', 'Специалист не выбран.');
      return;
    }

    setIsLoading(true);

    try {
      // Дату "25.01.2026" переводим в формат БД "2026-01-25"
      const [day, month, year] = form.date.split('.');
      const isoDate = `${year}-${month}-${day}`;

      const success = await addAppointment({
        specialist_id: specialistId,
        appointment_date: isoDate,
        appointment_time: form.time, // "14:30"
        comment: form.comment.trim() || undefined,
      });

      if (success) {
        Alert.alert(
          'Запись создана! ✅',
          `Вы записаны на ${form.date} в ${form.time}${
            specialistName ? ` к специалисту ${specialistName}` : ''
          }.`,
          [{ text: 'Отлично', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Ошибка', 'Не удалось создать запись. Попробуйте ещё раз.');
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось подключиться к серверу.');
    } finally {
      setIsLoading(false);
    }
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
        {/* Инфо о специалисте */}
        {specialistName && (
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorLabel}>Специалист:</Text>
            <Text style={styles.doctorName}>{specialistName}</Text>
          </View>
        )}

        {/* Инфо о пациенте (из профиля) */}
        {authState.user && (
          <View style={styles.patientInfo}>
            <Text style={styles.patientText}>
              Запись от имени: {authState.user.name}
            </Text>
            {authState.user.phone ? (
              <Text style={styles.patientSubtext}>
                Телефон: {authState.user.phone}
              </Text>
            ) : null}
          </View>
        )}

        {/* Дата */}
        <Input
          label="Желаемая дата *"
          placeholder="25.01.2026"
          value={form.date}
          onChangeText={(text) => updateField('date', text)}
          error={errors.date}
          keyboardType="numbers-and-punctuation"
        />

        {/* Время */}
        <Input
          label="Время *"
          placeholder="14:30"
          value={form.time}
          onChangeText={(text) => updateField('time', text)}
          error={errors.time}
          keyboardType="numbers-and-punctuation"
        />

        {/* Комментарий */}
        <Input
          label="Комментарий / причина обращения"
          placeholder="Опишите задачу или симптомы..."
          value={form.comment}
          onChangeText={(text) => updateField('comment', text)}
          error={errors.comment}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
        />

        <Button
          title="Записаться"
          onPress={handleSubmit}
          loading={isLoading}
        />

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
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: Spacing.lg, paddingBottom: 40 },
  doctorInfo: {
    backgroundColor: Colors.primaryLight + '15',
    borderRadius: Spacing.borderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
  patientInfo: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  patientText: { ...Typography.body, fontWeight: '500' },
  patientSubtext: {
    ...Typography.caption,
    marginTop: 2,
  },
});