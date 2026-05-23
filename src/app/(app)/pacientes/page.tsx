'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, AlertCircle } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { FAB } from '@/components/common/FAB';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MOCK_PATIENTS } from '@/lib/mock-data';
import type { PatientStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const FILTERS: { label: string; value: PatientStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Ativos', value: 'ativo' },
  { label: 'Novos', value: 'novo' },
  { label: 'Inativos', value: 'inativo' },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function PacientesPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PatientStatus | 'todos'>('todos');

  const patients = useMemo(() => {
    return MOCK_PATIENTS.filter(p => {
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchFilter = filter === 'todos' || p.status === filter;
      return matchQuery && matchFilter;
    });
  }, [query, filter]);

  return (
    <>
      <TopBar title="Pacientes" />

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all',
                filter === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Search size={32} strokeWidth={1.5} />
              <p className="text-sm">Nenhum paciente encontrado</p>
            </div>
          ) : (
            patients.map(patient => (
              <Link
                key={patient.id}
                href={`/pacientes/${patient.id}`}
                className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm active:scale-[0.99] transition-all"
              >
                <Avatar name={patient.name} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-foreground truncate">{patient.name}</span>
                    <StatusBadge status={patient.status} />
                  </div>
                  {patient.nextSession ? (
                    <p className="text-xs text-muted-foreground">
                      Próxima sessão: {formatDate(patient.nextSession)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sem sessão agendada</p>
                  )}
                </div>

                {patient.pendingPayment > 0 && (
                  <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                    <AlertCircle size={16} className="text-destructive" />
                    <span className="text-[10px] text-destructive font-medium">
                      R${patient.pendingPayment}
                    </span>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      <FAB onClick={() => router.push('/pacientes/novo')} label="Novo paciente" />
    </>
  );
}
