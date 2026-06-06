// src/services/matcher.ts

import { supabase } from '../lib/supabase';

export interface MatchResult {
  doctor: any;
  score: number;
  reason: string;
}

// Ключевые слова → ищем в profession + specialization
const KEYWORDS: Record<string, string[]> = {
  'Аргонная сварка': ['аргон', 'нержаве', 'алюмин', 'тонкий металл'],
  'Газовая сварка': ['газовая сварка', 'газосвар', 'резка металла', 'пропан'],
  'Дуговая сварка': ['сварить', 'сварка', 'металл', 'ворота', 'забор', 'электрод', 'заварить'],
  'Сантехник': ['труб', 'кран', 'смесител', 'унитаз', 'протеч', 'засор', 'вода', 'батаре', 'отоплен', 'канализац', 'раковин', 'течёт', 'течет'],
  'Электрик': ['проводк', 'розетк', 'выключател', 'свет', 'электр', 'щиток', 'замыкан', 'автомат', 'люстр', 'счётчик', 'счетчик'],
  'Плотник': ['дерев', 'доск', 'лестниц', 'мебель', 'брус', 'пол скрипит'],
  'Маляр': ['покрас', 'краск', 'штукатур', 'обои', 'шпаклёв', 'шпаклев', 'потолок'],
  'Каменщик': ['кирпич', 'кладк', 'блок', 'облицов', 'фундамент'],
  'Кровельщик': ['крыш', 'кровл', 'черепиц', 'чердак'],
  'Плиточник': ['плитк', 'кафел', 'керамогранит', 'мозаик', 'затирк', 'санузел'],
  'Монтажник окон': ['окн', 'стеклопакет', 'подоконник', 'застеклить', 'балкон'],
  'Мастер по ремонту бытовой техники': ['стиральн', 'холодильник', 'посудомоеч', 'микроволнов', 'сломал', 'не включается', 'не работает'],
};

function detectKeys(text: string): { key: string; score: number }[] {
  const lower = text.toLowerCase();
  const scored: { key: string; score: number }[] = [];

  for (const [key, words] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const w of words) {
      if (lower.includes(w)) score += 1;
    }
    if (score > 0) scored.push({ key, score });
  }
  return scored.sort((a, b) => b.score - a.score);
}

export async function matchSpecialists(problem: string): Promise<MatchResult[]> {
  const detected = detectKeys(problem);

  const { data: specialists, error } = await supabase
    .from('specialists')
    .select('*');

  if (error || !specialists) {
    console.log('Ошибка загрузки специалистов:', error?.message);
    return [];
  }
  if (detected.length === 0) return [];

  const results: MatchResult[] = [];
  const addedIds = new Set();

  for (const { key, score } of detected) {
    const k = key.toLowerCase();
    const matched = specialists.filter((s: any) => {
      const prof = (s.profession ?? '').toLowerCase();
      const spec = (s.specialization ?? '').toLowerCase();
      // Совпадение по профессии ИЛИ по специализации
      return prof.includes(k) || spec.includes(k);
    });

    for (const sp of matched) {
      if (addedIds.has(sp.id)) continue;
      addedIds.add(sp.id);
      results.push({
        doctor: sp,
        score,
        reason: `Подходит: ${sp.specialization ?? sp.profession}`,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}