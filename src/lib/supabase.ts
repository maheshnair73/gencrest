import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    console.log('✅ Supabase client initialized');
  } else {
    console.warn('⚠️ Supabase not configured - using mock data only');
  }
} catch (error) {
  console.error('❌ Supabase initialization failed:', error);
}

export const supabase = supabaseClient as SupabaseClient;
