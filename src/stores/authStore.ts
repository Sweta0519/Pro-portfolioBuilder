import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';

type Updater<T> = T | ((prev: T) => T);
type FieldSetter<T> = (value: Updater<T>) => void;

export interface AuthState {
  user: SupabaseUser | null;
  showAuthModal: boolean;
  authMode: 'login' | 'signup';
  authEmail: string;
  authPassword: string;
  authLoading: boolean;
  authError: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';

  setUser: FieldSetter<SupabaseUser | null>;
  setShowAuthModal: FieldSetter<boolean>;
  setAuthMode: FieldSetter<'login' | 'signup'>;
  setAuthEmail: FieldSetter<string>;
  setAuthPassword: FieldSetter<string>;
  setAuthLoading: FieldSetter<boolean>;
  setAuthError: FieldSetter<string>;
  setSyncStatus: FieldSetter<'idle' | 'syncing' | 'synced' | 'error'>;

  resetAuthForm: () => void;
}

const fieldSetter = <T,>(
  set: (fn: (state: AuthState) => Partial<AuthState>) => void,
  key: keyof AuthState
): FieldSetter<T> => (value) =>
  set((state) => ({
    [key]:
      typeof value === 'function'
        ? (value as (prev: T) => T)(state[key] as T)
        : (value as T),
  }) as Partial<AuthState>);

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  showAuthModal: false,
  authMode: 'login',
  authEmail: '',
  authPassword: '',
  authLoading: false,
  authError: '',
  syncStatus: 'idle',

  setUser: fieldSetter<AuthState['user']>(set, 'user'),
  setShowAuthModal: fieldSetter<AuthState['showAuthModal']>(set, 'showAuthModal'),
  setAuthMode: fieldSetter<AuthState['authMode']>(set, 'authMode'),
  setAuthEmail: fieldSetter<AuthState['authEmail']>(set, 'authEmail'),
  setAuthPassword: fieldSetter<AuthState['authPassword']>(set, 'authPassword'),
  setAuthLoading: fieldSetter<AuthState['authLoading']>(set, 'authLoading'),
  setAuthError: fieldSetter<AuthState['authError']>(set, 'authError'),
  setSyncStatus: fieldSetter<AuthState['syncStatus']>(set, 'syncStatus'),

  resetAuthForm: () =>
    set(() => ({
      authEmail: '',
      authPassword: '',
      authError: '',
      authLoading: false,
    })),
}));
