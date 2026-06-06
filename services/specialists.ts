// src/services/specialists.ts

import { supabase } from '../lib/supabase';

export interface Specialist {
  id: string;
  company_id: string | null;
  full_name: string;
  profession: string;
  specialization: string | null;
  description: string | null;
  experience_years: number;
  rating: number;
  photo_url: string | null;
  price: number | null;
  companies?: { name: string; address: string } | null; // данные компании
}

// Получить всех специалистов (с поиском по имени/профессии)
export async function getSpecialists(search = ''): Promise<Specialist[]> {
  let query = supabase
    .from('specialists')
    .select('*, companies(name, address)')
    .eq('is_active', true)
    .order('rating', { ascending: false });

  if (search.trim()) {
    // Ищем и по имени, и по профессии, и по специализации
    query = query.or(
      `full_name.ilike.%${search}%,profession.ilike.%${search}%,specialization.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.log('Ошибка загрузки специалистов:', error.message);
    return [];
  }
  return data ?? [];
}

// Получить одного специалиста по id
export async function getSpecialistById(
  id: string
): Promise<Specialist | null> {
  const { data, error } = await supabase
    .from('specialists')
    .select('*, companies(name, address, phone)')
    .eq('id', id)
    .single();

  if (error) {
    console.log('Ошибка загрузки специалиста:', error.message);
    return null;
  }
  return data;
}