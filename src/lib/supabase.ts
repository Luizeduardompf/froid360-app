import { createBrowserClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Browser Client (para 'use client' components ou client-side)
export const createClientComponentClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server Client (para RSC/Server Actions, com cookies para session)
export const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookies().set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookies().set({ name, value: '', ...options });
      },
    },
  }
);
