import { createClient } from '@supabase/supabase-js';

// Primary DB Client (Catalog, Orders, Auth)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xllycobgknrzhetpzqso.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbHljb2Jna25yemhldHB6cXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDkyNDIsImV4cCI6MjA5OTYyNTI0Mn0.yC346yzB-_0Jv6dKVOpihvwr43hCH7LdSmOqjlFRwVY';

// Secondary Media/Settings DB Client (Banners, Settings, Reels — Doubles Free Egress Limit)
const supabaseMediaUrl = import.meta.env.VITE_SUPABASE_MEDIA_URL || supabaseUrl;
const supabaseMediaAnonKey = import.meta.env.VITE_SUPABASE_MEDIA_ANON_KEY || supabaseAnonKey;

let supabase = null;
let supabaseMedia = null;

const clientOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  // Configure Realtime options to prevent noisy background WebSocket retry logs
  realtime: {
    timeout: 2000,
    heartbeatIntervalMs: 30000
  }
};

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'placeholder' && supabaseAnonKey !== 'placeholder') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);
    console.log('Primary Supabase SDK initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Primary Supabase client:', error);
  }
}

if (supabaseMediaUrl && supabaseMediaAnonKey && supabaseMediaUrl !== 'placeholder') {
  try {
    supabaseMedia = (supabaseMediaUrl === supabaseUrl) ? supabase : createClient(supabaseMediaUrl, supabaseMediaAnonKey, clientOptions);
    console.log('Secondary Media Supabase SDK initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Secondary Supabase client:', error);
    supabaseMedia = supabase;
  }
} else {
  supabaseMedia = supabase;
}

export { supabase, supabaseMedia };
