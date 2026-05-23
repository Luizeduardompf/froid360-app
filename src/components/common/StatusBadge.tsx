import { cn } from '@/lib/utils';
import type { PatientStatus, SessionStatus, PaymentStatus } from '@/lib/types';

type BadgeVariant = PatientStatus | SessionStatus | PaymentStatus | string;

const VARIANT_STYLES: Record<string, string> = {
  // Patient status
  ativo:      'bg-green-100 text-green-700 border-green-200',
  inativo:    'bg-gray-100 text-gray-600 border-gray-200',
  novo:       'bg-blue-100 text-blue-700 border-blue-200',
  // Session status
  realizada:  'bg-green-100 text-green-700 border-green-200',
  agendada:   'bg-blue-100 text-blue-700 border-blue-200',
  cancelada:  'bg-red-100 text-red-700 border-red-200',
  faltou:     'bg-orange-100 text-orange-700 border-orange-200',
  // Payment status
  pago:       'bg-green-100 text-green-700 border-green-200',
  pendente:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  atrasado:   'bg-red-100 text-red-700 border-red-200',
};

const LABELS: Record<string, string> = {
  ativo: 'Ativo', inativo: 'Inativo', novo: 'Novo',
  realizada: 'Realizada', agendada: 'Agendada', cancelada: 'Cancelada', faltou: 'Faltou',
  pago: 'Pago', pendente: 'Pendente', atrasado: 'Atrasado',
};

interface StatusBadgeProps {
  status: BadgeVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = VARIANT_STYLES[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const label = LABELS[status] ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
