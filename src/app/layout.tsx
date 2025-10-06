'use client';  // Adicione: Força client render para theme, evitando SSR mismatch

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';  // shadcn ThemeProvider (crie se ausente)
import './globals.css';  // Tailwind + shadcn styles
import { cn } from '@/lib/utils';  // shadcn utils (cn helper)

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Froid360 App',
  description: 'Full-stack app with Next.js, Supabase, and shadcn',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning className="light">  {/* suppress + default class para evitar empty SSR */}
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange  // Opcional: Evita flicker em theme switch
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
