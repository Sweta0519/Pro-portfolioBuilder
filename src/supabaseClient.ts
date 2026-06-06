/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isConfigured) {
  console.warn(
    'Supabase URL or Anon Key is missing in environment variables. Offline mode will be active.'
  );
}

// Custom dummy mock for offline mode
const dummySupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: new Error('Supabase not configured (Offline Mode)'),
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: new Error('Supabase not configured (Offline Mode)'),
    }),
    signInWithOAuth: async () => ({
      data: {},
      error: new Error('Supabase not configured (Offline Mode)'),
    }),
    signOut: async () => ({ error: null }),
  },
  from: () => {
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      order: () => chain,
      single: async () => ({ data: null, error: null }),
      insert: async () => ({ data: null, error: null }),
      upsert: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null }),
    };
    return chain;
  },
} as any;

export const supabase = (
  isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : dummySupabase
) as SupabaseClient;
