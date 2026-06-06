// src/hooks/useAvatar.ts

import { decode } from 'base64-arraybuffer';
import { File } from 'expo-file-system'; // новый File API (SDK 54+), без /legacy
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const BUCKET = 'avatars';

export function useAvatar() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Загружаем текущий avatar_url из профиля
  const loadAvatar = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userData.user.id)
      .single();

    if (error) {
      console.log('Ошибка загрузки avatar_url:', error.message);
      return;
    }

    setAvatarUri(data?.avatar_url ?? null);
  }, []);

  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  // Выбрать и загрузить новый аватар
  const pickAvatar = useCallback(async () => {
    // Разрешение на доступ к галерее
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Нет доступа',
        'Разрешите доступ к галерее в настройках телефона.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // актуальный формат вместо MediaTypeOptions.Images
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        Alert.alert('Ошибка', 'Сессия не найдена, войдите заново.');
        return;
      }
      const userId = userData.user.id;
      const asset = result.assets[0];

      // Читаем файл как base64 и декодируем в ArrayBuffer.
      // fetch(uri).arrayBuffer() в Expo часто даёт битый файл —
      // поэтому используем надёжный путь через File API + base64.
      const file = new File(asset.uri);
      const base64 = await file.base64();
      const arrayBuffer = decode(base64);

      // Тип и путь файла
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;

      // Удаляем старые файлы пользователя (чистим папку)
      const { data: oldFiles } = await supabase.storage
        .from(BUCKET)
        .list(userId);

      if (oldFiles && oldFiles.length > 0) {
        const pathsToRemove = oldFiles.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from(BUCKET).remove(pathsToRemove);
      }

      // Загружаем новый файл
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, arrayBuffer, { contentType, upsert: true });

      if (uploadError) {
        console.log('Ошибка загрузки:', uploadError.message);
        Alert.alert('Ошибка', 'Не удалось загрузить фото.');
        return;
      }

      // Публичный URL
      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      // Метка времени в конце URL обходит кэш картинки в <Image>
      const publicUrl = `${publicData.publicUrl}?t=${Date.now()}`;

      // Сохраняем URL в профиль
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.log('Ошибка сохранения URL:', updateError.message);
        Alert.alert('Ошибка', 'Фото загружено, но не сохранилось в профиль.');
        return;
      }

      setAvatarUri(publicUrl);
    } catch (e) {
      console.log('Ошибка обработки фото:', e);
      Alert.alert('Ошибка', 'Что-то пошло не так при загрузке.');
    } finally {
      setUploading(false);
    }
  }, []);

  // Удалить аватар
  const removeAvatar = useCallback(async () => {
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const userId = userData.user.id;

      // Удаляем все файлы в папке пользователя
      const { data: files } = await supabase.storage
        .from(BUCKET)
        .list(userId);

      if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from(BUCKET).remove(paths);
      }

      // Очищаем ссылку в профиле
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      setAvatarUri(null);
    } catch (e) {
      console.log('Ошибка удаления фото:', e);
      Alert.alert('Ошибка', 'Не удалось удалить фото.');
    } finally {
      setUploading(false);
    }
  }, []);

  return { avatarUri, uploading, pickAvatar, removeAvatar };
}