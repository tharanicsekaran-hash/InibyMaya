import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xllycobgknrzhetpzqso.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbHljb2Jna25yemhldHB6cXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDkyNDIsImV4cCI6MjA5OTYyNTI0Mn0.yC346yzB-_0Jv6dKVOpihvwr43hCH7LdSmOqjlFRwVY';

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
