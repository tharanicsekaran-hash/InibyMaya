import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'placeholder' && supabaseAnonKey !== 'placeholder') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase SDK initialized successfully. Directing transactions to PostgreSQL.');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('Supabase connection details missing. Operating under localStorage database simulator.');
}

export { supabase };
