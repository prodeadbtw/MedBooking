import Button from '@/components/Button';
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
import Input from '../../components/Input';
import { Colors, Spacing, Typography } from '../../constants';

interface AppointmentForm {
  patientName: string;
  phone: string;
  email: string;
  date: string;
  complaints: string;
}

type FormErrors = Partial<AppointmentForm>;

export default function NewAppointmentScreen() {
  const { doctorId, doctorName } = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
  }>();
  const [form, setForm] = useState<AppointmentForm>({
    patientName: '',
    phone: '',
    email: '',
    date: '',
    complaints: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const updateField = (field: keyof AppointmentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.patientName.trim()) {
      newErrors.patientName = 'Введите ФИО пациента';  
    } else if (form.patientName.trim().length > 3) {
      newErrors.patientName = 'ФИО должно содержать минимум 3 символа';
    }

    const phoneRegex = /^\+7\d{10}$/;
    const cleanPhone = form.phone.replace(/[\s\-\(\)]/g, '');

    if (!form.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Формат: +7XXXXXXXXXX';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!form.date.trim()) {
      newErrors.date = 'Введите желаемую дату';
    } else if (!dateRegex.test(form.date)) {
      newErrors.date = 'Формат: ДД.ММ.ГГГГ';
    }
    
    if (form.complaints.trim() && form.complaints.trim().length < 10) {
      newErrors.complaints = 'Опишите жалобы подробнее (минимум 10 символов)';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Запись создана! ✅',
        `${form.patientName}, вы записаны ${form.date}${doctorName ? ` к врачу ${doctorName}` : ''}.`,
        [{text: 'Отлично', onPress: () => router.back(),},],
      );
    }, 1500);
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
        {doctorName && (
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorLabel}>Вы записываетесь к:</Text>
            <Text style={styles.doctorName}>{doctorName}</Text>
          </View>
        )}
        <Input
        label="ФИО пациента *"
        placeholder="Иванов Иван Иванович"
        value={form.patientName}
        onChangeText={(text) => updateField('patientName', text)}
        error={errors.patientName}
        autoCapitalize="words"
        />
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
        <Button
          title={isLoading ? 'Сохранение...' : 'Записаться'}
          onPress={handleSubmit}
          disabled={isLoading}
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
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
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

