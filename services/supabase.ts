import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables injected by the build tool (Vite/Netlify)
const supabaseUrl = process.env.SUPABASE_URL || 'https://govxxalszeeyzzftpclt.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvdnh4YWxzemVleXp6ZnRwY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODAzMTQsImV4cCI6MjA4NTc1NjMxNH0.fYngmVo4T153M8qQUJ2E0mQ019oKVzeoHXpvOk6wAMI';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing.');
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;