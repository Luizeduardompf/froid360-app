'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function TopBar({ title, subtitle, showBack, onBack, action, className }: TopBarProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border',
        'pt-safe',
        className
      )}
    >
      <div className="flex items-center gap-3 px-4 h-14 max-w-[430px] mx-auto">
        {showBack && (
          <button
            onClick={onBack ?? (() => router.back())}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors text-foreground"
            aria-label="Voltar"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-medium text-foreground truncate leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate leading-tight">{subtitle}</p>
          )}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}

        {!showBack && !action && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium flex-shrink-0">
            Dr
          </div>
        )}
      </div>
    </header>
  );
}
