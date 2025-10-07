// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Type para CookieOptions (de Next.js cookies API)
type CookieOptions = {
  name: string;
  value: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none';
};

// Browser Client (para 'use client' components)
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
      set(name: string, value: string, options?: CookieOptions) {  // Fix: CookieOptions em vez de any
        cookies().set({ name, value, ...options });
      },
      remove(name: string, options?: CookieOptions) {  // Fix: CookieOptions em vez de any
        cookies().set({ name, value: '', ...options });
      },
    },
  }
);
