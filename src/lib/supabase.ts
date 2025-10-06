import { createBrowserClient } from '@supabase/ssr';  // Correto para Next.js App Router

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
