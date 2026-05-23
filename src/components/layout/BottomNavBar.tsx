'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Calendar, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/agenda',    label: 'Agenda',    icon: Calendar },
  { href: '/chat',      label: 'Chat AI',   icon: MessageCircle },
  { href: '/perfil',    label: 'Perfil',    icon: Settings },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-[430px] mx-auto px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[60px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.8}
                className={cn(active && 'drop-shadow-sm')}
              />
              <span className={cn('text-[10px] font-medium', active ? 'opacity-100' : 'opacity-70')}>
                {label}
              </span>
              {active && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
