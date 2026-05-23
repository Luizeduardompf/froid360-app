'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export function FAB({ onClick, icon, label, className }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label ?? 'Adicionar'}
      className={cn(
        'fixed bottom-20 right-4 z-40',
        'w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg',
        'flex items-center justify-center',
        'hover:bg-primary/90 active:scale-95 transition-all',
        className
      )}
    >
      {icon ?? <Plus size={24} strokeWidth={2} />}
    </button>
  );
}
