import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Cookie } from 'next/headers';  // Type para getAll/setAll

// Client para componentes 'use client' (browser-side, sem cookies server)
export const createClientComponentClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server client para RSC/Server Actions (cookies getAll/setAll de next/headers)
export const createServerComponentClient = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return cookies().getAll() as Cookie[];  // Typed array Cookie[] (Supabase usa para hints/session)
      },
      setAll(cookiesToSet: Cookie[]) {
        try {
          cookiesToSet.forEach(({ name, value, ...options }) => {
            if (options.maxAge === 0) {
              // Remove (expira)
              cookies().delete(name);
            } else {
              // Set
              cookies().set(name, value, options);
            }
          });
        } catch (error) {
          // Ignora se chamado de Server Component (middleware refresh session)
          console.warn('Cookies set ignored in Server Component:', error);
        }
      },
    },
  }
);
