// src/app/profile/edit.tsx

import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Colors, Spacing } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function EditProfileScreen() {
  const { state, refreshUser } = useAuth();

  const [name, setName] = useState(state.user?.name ?? '');
  const [phone, setPhone] = useState(state.user?.phone ?? '');
  const [email, setEmail] = useState(state.user?.email ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Заполните поле', 'Имя не может быть пустым.');
      return;
    }
    if (!state.user) return;

    setLoading(true);
    try {
      const userId = state.user.id;
      const emailChanged = email.trim() !== state.user.email;

      // 1. Обновляем имя и телефон в таблице profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: name.trim(), phone: phone.trim() })
        .eq('id', userId);

      if (profileError) {
        console.log('Ошибка обновления профиля:', profileError.message);
        Alert.alert('Ошибка', 'Не удалось сохранить данные.');
        return;
      }

      // 2. Email меняется через Auth (требует подтверждения по письму)
      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim(),
        });

        if (emailError) {
          console.log('Ошибка смены email:', emailError.message);
          Alert.alert('Ошибка', 'Не удалось изменить почту: ' + emailError.message);
          return;
        }

        Alert.alert(
          'Подтвердите почту',
          'На новый адрес отправлено письмо. Перейдите по ссылке, чтобы подтвердить смену.'
        );
      }

      await refreshUser();

      if (!emailChanged) {
        Alert.alert('Готово', 'Данные сохранены.');
      }
      router.back();
    } catch (e) {
      console.log(e);
      Alert.alert('Ошибка', 'Что-то пошло не так.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Редактирование профиля</Text>

      <Input
        label="Имя"
        placeholder="Ваше имя"
        value={name}
        onChangeText={setName}
      />
      <Input
        label="Телефон"
        placeholder="+7 999 123-45-67"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Input
        label="Почта"
        placeholder="email@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.hint}>
        При смене почты на новый адрес придёт письмо для подтверждения.
      </Text>

      <Button
        title="Сохранить"
        onPress={handleSave}
        loading={loading}
        style={{ marginTop: Spacing.lg }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});