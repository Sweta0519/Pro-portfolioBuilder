import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';

type Updater<T> = T | ((prev: T) => T);
type FieldSetter<T> = (value: Updater<T>) => void;

export type SyncPhase = 'idle' | 'pulling' | 'pushing' | 'error';

export interface AuthState {
  user: SupabaseUser | null;
  showAuthModal: boolean;
  authMode: 'login' | 'signup';
  authEmail: string;
  authPassword: string;
  authLoading: boolean;
  authError: string;

  // Per-resource sync phases. Replaces the single shared `syncStatus` flag,
  // which previously allowed `auto-sync resumes` and `auto-sync sessions` to
  // cancel each other out of the run guards.
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  resumeSyncPhase: SyncPhase;
  sessionSyncPhase: SyncPhase;
  // Monotonically increasing token. Every sync captures the value at start and
  // bails out at completion if the value has changed (user signed out, user
  // switched, manual abort). Prevents stale writes from clobbering the store.
  syncGeneration: number;
  // True while a sign-out is in progress and waiting for an in-flight sync to
  // either flush or abort. The UI uses this to show a "Signing out…" state.
  isSigningOut: boolean;

  setUser: FieldSetter<SupabaseUser | null>;
  setShowAuthModal: FieldSetter<boolean>;
  setAuthMode: FieldSetter<'login' | 'signup'>;
  setAuthEmail: FieldSetter<string>;
  setAuthPassword: FieldSetter<string>;
  setAuthLoading: FieldSetter<boolean>;
  setAuthError: FieldSetter<string>;
  setSyncStatus: FieldSetter<'idle' | 'syncing' | 'synced' | 'error'>;
  setResumeSyncPhase: FieldSetter<SyncPhase>;
  setSessionSyncPhase: FieldSetter<SyncPhase>;
  setSyncGeneration: FieldSetter<number>;
  setIsSigningOut: FieldSetter<boolean>;

  resetAuthForm: () => void;
  /**
   * Bump the generation counter so any in-flight sync started under the
   * previous generation is invalidated. Returns the new value.
   */
  bumpSyncGeneration: () => number;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  showAuthModal: false,
  authMode: 'login',
  authEmail: '',
  authPassword: '',
  authLoading: false,
  authError: '',
  syncStatus: 'idle',
  resumeSyncPhase: 'idle',
  sessionSyncPhase: 'idle',
  syncGeneration: 0,
  isSigningOut: false,

  setUser: fieldSetter<AuthState['user']>(set, 'user'),
  setShowAuthModal: fieldSetter<AuthState['showAuthModal']>(set, 'showAuthModal'),
  setAuthMode: fieldSetter<AuthState['authMode']>(set, 'authMode'),
  setAuthEmail: fieldSetter<AuthState['authEmail']>(set, 'authEmail'),
  setAuthPassword: fieldSetter<AuthState['authPassword']>(set, 'authPassword'),
  setAuthLoading: fieldSetter<AuthState['authLoading']>(set, 'authLoading'),
  setAuthError: fieldSetter<AuthState['authError']>(set, 'authError'),
  setSyncStatus: fieldSetter<AuthState['syncStatus']>(set, 'syncStatus'),
  setResumeSyncPhase: fieldSetter<AuthState['resumeSyncPhase']>(set, 'resumeSyncPhase'),
  setSessionSyncPhase: fieldSetter<AuthState['sessionSyncPhase']>(set, 'sessionSyncPhase'),
  setSyncGeneration: fieldSetter<AuthState['syncGeneration']>(set, 'syncGeneration'),
  setIsSigningOut: fieldSetter<AuthState['isSigningOut']>(set, 'isSigningOut'),

  resetAuthForm: () =>
    set(() => ({
      authEmail: '',
      authPassword: '',
      authError: '',
      authLoading: false,
    })),

  bumpSyncGeneration: () => {
    const next = get().syncGeneration + 1;
    set({ syncGeneration: next });
    return next;
  },
}));
