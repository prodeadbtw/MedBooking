// src/app/(tabs)/match.tsx

import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Button from '../../components/Button';
import { Colors, Spacing } from '../../constants';
import { MatchResult, matchSpecialists } from '../../services/matcher';

export default function MatchScreen() {
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResult[] | null>(null);

  const handleSearch = async () => {
    if (problem.trim().length < 3) return;
    setLoading(true);
    try {
      const matches = await matchSpecialists(problem.trim());
      setResults(matches);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Умный подбор</Text>
      <Text style={styles.subtitle}>
        Опишите своими словами, что вас беспокоит — подберём подходящего
        специалиста.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Например: болит зуб и кровоточат дёсны"
        placeholderTextColor={Colors.textSecondary}
        value={problem}
        onChangeText={setProblem}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Button
        title="Подобрать"
        onPress={handleSearch}
        loading={loading}
        disabled={problem.trim().length < 3}
        style={{ marginTop: Spacing.md }}
      />

      {loading && (
        <ActivityIndicator
          color={Colors.primary}
          style={{ marginTop: Spacing.lg }}
        />
      )}

      {results && !loading && (
        <View style={{ marginTop: Spacing.lg }}>
          {results.length === 0 ? (
            <Text style={styles.empty}>
              Не удалось определить специалиста. Попробуйте описать иначе.
            </Text>
          ) : (
            <>
              <Text style={styles.resultsTitle}>Рекомендуем:</Text>
              {results.map((r) => (
                <Pressable
                  key={r.doctor.id}
                  style={styles.card}
                  onPress={() => router.push(`/doctor/${r.doctor.id}`)}
                >
                  <Text style={styles.cardName}>{r.doctor.full_name}</Text>
                  <Text style={styles.cardProfession}>
                    {r.doctor.profession ?? r.doctor.specialization}
                  </Text>
                  <Text style={styles.cardReason}>{r.reason}</Text>
                </Pressable>
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.lg },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 100,
    backgroundColor: Colors.surface,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  empty: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  cardProfession: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  cardReason: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});