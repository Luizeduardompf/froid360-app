import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cliente para componentes 'use client' (browser-side, sem cookies server)
export const createClientComponentClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Cliente para Server Components/Actions/Handlers (assíncrono para Next.js 15)
export async function createServerComponentClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options });
            });
          } catch {
            // Ignorar se chamado de Server Component sem middleware de refresh
          }
        },
      },
    }
  );
}
