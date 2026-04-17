// src/app/auth/register.tsx

import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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
import { useAuth } from '../../contexts/AuthContext';

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<RegisterForm>;

export default function RegisterScreen() {
  const { register } = useAuth();

  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Введите ФИО';
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'Минимум 3 символа';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    const phoneRegex = /^\+7\d{10}$/;
    const cleanPhone = form.phone.replace(/[\s\-\(\)]/g, '');
    if (!form.phone.trim()) {
      newErrors.phone = 'Введите телефон';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Формат: +7XXXXXXXXXX';
    }

    if (!form.password) {
      newErrors.password = 'Введите пароль';
    } else if (form.password.length < 6) {
      newErrors.password = 'Минимум 6 символов';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const success = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      if (success) {
        Alert.alert(
          'Регистрация успешна! 🎉',
          'Добро пожаловать в MedBooking!',
          [{ text: 'Начать', onPress: () => router.dismiss() }]
          // router.dismiss() — закрывает все модальные экраны,
          // возвращая на главный (вкладки)
        );
      } else {
        Alert.alert('Ошибка', 'Не удалось зарегистрироваться.');
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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Шапка */}
        <View style={styles.header}>
          <Text style={styles.logo}>📝</Text>
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>
            Создайте аккаунт для записи к врачу
          </Text>
        </View>

        {/* Форма */}
        <View style={styles.form}>
          <Input
            label="ФИО *"
            placeholder="Иванов Иван Иванович"
            value={form.name}
            onChangeText={(text) => updateField('name', text)}
            error={errors.name}
            autoCapitalize="words"
          />

          <Input
            label="Email *"
            placeholder="example@mail.ru"
            value={form.email}
            onChangeText={(text) => updateField('email', text)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Телефон *"
            placeholder="+79001234567"
            value={form.phone}
            onChangeText={(text) => updateField('phone', text)}
            error={errors.phone}
            keyboardType="phone-pad"
          />

          <Input
            label="Пароль *"
            placeholder="Минимум 6 символов"
            value={form.password}
            onChangeText={(text) => updateField('password', text)}
            error={errors.password}
            secureTextEntry
          />

          <Input
            label="Подтвердите пароль *"
            placeholder="Повторите пароль"
            value={form.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            error={errors.confirmPassword}
            secureTextEntry
          />

          <Button
            title="Зарегистрироваться"
            onPress={handleRegister}
            loading={isLoading}
          />
        </View>

        {/* Ссылка на вход */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Уже есть аккаунт? </Text>
          <Pressable onPress={() => router.replace('/auth/login')}>
            <Text style={styles.footerLink}>Войти</Text>
          </Pressable>
        </View>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Вернуться</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  logo: { fontSize: 64, marginBottom: Spacing.md },
  title: { ...Typography.h1, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },
  form: { marginBottom: Spacing.xxl },
  footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.xxl },
  footerText: { ...Typography.body, color: Colors.textSecondary },
  footerLink: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  backButton: { alignItems: 'center' },
  backButtonText: { ...Typography.body, color: Colors.textSecondary },
});