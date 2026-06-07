import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthState {
  user: SupabaseUser | null;
  showAuthModal: boolean;
  authMode: 'login' | 'signup';
  authEmail: string;
  authPassword: string;
  authLoading: boolean;
  authError: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  set: (update: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  showAuthModal: false,
  authMode: 'login',
  authEmail: '',
  authPassword: '',
  authLoading: false,
  authError: '',
  syncStatus: 'idle',
  set: (update) => set(update as any),
}));
