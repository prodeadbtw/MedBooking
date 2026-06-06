// src/contexts/AuthContext.tsx

import { Session } from '@supabase/supabase-js';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // ← НОВОЕ
}

const defaultValue: AuthContextType = {
  state: { isAuthenticated: false, user: null, loading: true },
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  refreshUser: async () => {}, // ← НОВОЕ
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const loadProfile = async (session: Session | null) => {
    if (!session?.user) {
      setState({ isAuthenticated: false, user: null, loading: false });
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', session.user.id)
      .single();

    setState({
      isAuthenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email ?? '',
        name: profile?.full_name ?? session.user.email ?? 'Пользователь',
        phone: profile?.phone ?? '',
      },
      loading: false,
    });
  };

  const refreshUser = async () => {
    const { data } = await supabase.auth.getSession();
    await loadProfile(data.session);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      loadProfile(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        loadProfile(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log('Ошибка входа:', error.message);
      return false;
    }
    return true;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.name, phone: data.phone } },
    });

    if (error) {
      console.log('Ошибка регистрации:', error.message);
      return false;
    }

    if (result.user) {
      await supabase.from('profiles').upsert({
        id: result.user.id,
        full_name: data.name,
        phone: data.phone,
      });
    }
    return true;
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ state, login, register, logout, refreshUser }} // ← refreshUser
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}