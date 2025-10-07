import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieOptions = {
  name: string;
  value: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none';
};

// Client para componentes 'use client' (browser-side, sem cookies custom)
export const createClientComponentClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server client para RSC/Server Actions (com cookies async de next/headers)
export const createServerComponentClient = async () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      async get(name: string) {
        const c = await cookies();
        return c.get(name)?.value;
      },
      async getAll() {
        const c = await cookies();
        return c.getAll();
      },
      async set(name: string, value: string, options?: CookieOptions) {
        const c = await cookies();
        c.set({ name, value, ...options });
      },
      async remove(name: string, options?: CookieOptions) {
        const c = await cookies();
        c.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  }
);
