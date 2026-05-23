'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Edit, Plus, DollarSign } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MOCK_PATIENTS, MOCK_SESSIONS, MOCK_PAYMENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const TABS = ['Resumo', 'Sessões', 'Financeiro', 'Anamnese'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tab, setTab] = useState(0);

  const patient = MOCK_PATIENTS.find(p => p.id === id) ?? MOCK_PATIENTS[0];
  const sessions = MOCK_SESSIONS.filter(s => s.patientId === patient.id);
  const payments = MOCK_PAYMENTS.filter(p => p.patientId === patient.id);
  const totalPaid = payments.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.amount, 0);
  const totalPending = payments.filter(p => p.status !== 'pago').reduce((acc, p) => acc + p.amount, 0);

  const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();

  return (
    <>
      <TopBar
        title={patient.name.split(' ')[0]}
        subtitle={`${age} anos · CID registrado`}
        showBack
        action={
          <button className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Edit size={18} className="text-muted-foreground" />
          </button>
        }
      />

      {/* Header card */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
          <Avatar name={patient.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-foreground">{patient.name}</span>
              <StatusBadge status={patient.status} />
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone size={11} />{patient.phone}</span>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1 truncate"><Mail size={11} />{patient.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar px-4 gap-1 border-b border-border">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={cn(
              'flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all',
              tab === i
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-3">

        {/* ── Tab: Resumo ──────────────────────────────────── */}
        {tab === 0 && (
          <div className="space-y-3">
            {/* Métricas */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Sessões', value: patient.totalSessions },
                { label: 'Último pgto', value: payments.filter(p => p.status === 'pago').length > 0 ? formatDate(payments.filter(p => p.status === 'pago')[0].date) : '—' },
                { label: 'Próxima sessão', value: patient.nextSession ? new Date(patient.nextSession).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—' },
              ].map(m => (
                <div key={m.label} className="bg-card rounded-xl border border-border p-3 text-center">
                  <p className="text-base font-medium text-foreground">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Valor sessão */}
            <div className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Valor por sessão</p>
                <p className="font-medium text-foreground">{formatCurrency(patient.sessionValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Pagamento</p>
                <p className="font-medium text-foreground capitalize">{patient.paymentMethod}</p>
              </div>
            </div>

            {patient.pendingPayment > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-center gap-3">
                <DollarSign size={20} className="text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Pagamento pendente</p>
                  <p className="text-xs text-destructive/80">{formatCurrency(patient.pendingPayment)} em aberto</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Sessões ─────────────────────────────────── */}
        {tab === 1 && (
          <div className="space-y-2">
            <button
              onClick={() => router.push(`/sessoes`)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <Plus size={16} />
              Registrar sessão
            </button>

            {sessions.map(s => (
              <div key={s.id} className="bg-card rounded-2xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(s.date)} às {s.time}
                  </span>
                  <StatusBadge status={s.status} />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{s.duration} min</span>
                  <span>{formatCurrency(s.value)}</span>
                  {!s.charged && s.status === 'realizada' && (
                    <span className="text-destructive font-medium">Não cobrado</span>
                  )}
                </div>
                {s.notes && (
                  <p className="text-xs text-muted-foreground border-t border-border pt-2 line-clamp-2">{s.notes}</p>
                )}
              </div>
            ))}

            {sessions.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-10">Nenhuma sessão registrada</p>
            )}
          </div>
        )}

        {/* ── Tab: Financeiro ──────────────────────────────── */}
        {tab === 2 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground">Total recebido</p>
                <p className="text-lg font-medium text-secondary">{formatCurrency(totalPaid)}</p>
              </div>
              <div className={cn('rounded-2xl p-4 border', totalPending > 0 ? 'bg-destructive/10 border-destructive/20' : 'bg-muted border-border')}>
                <p className="text-xs text-muted-foreground">Em aberto</p>
                <p className={cn('text-lg font-medium', totalPending > 0 ? 'text-destructive' : 'text-muted-foreground')}>
                  {formatCurrency(totalPending)}
                </p>
              </div>
            </div>

            {payments.map(p => (
              <div key={p.id} className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{p.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.date)} · {p.method}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-sm font-medium text-foreground">{formatCurrency(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}

            <button className="w-full py-3.5 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-primary flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Plus size={16} /> Registrar pagamento
            </button>
          </div>
        )}

        {/* ── Tab: Anamnese ────────────────────────────────── */}
        {tab === 3 && (
          <div className="space-y-4">
            {[
              { label: 'Queixa principal', value: patient.chiefComplaint },
              { label: 'Histórico relevante', value: patient.medicalHistory },
              { label: 'Medicações em uso', value: patient.medications || 'Nenhuma' },
            ].map(item => (
              <div key={item.label} className="bg-card rounded-2xl border border-border p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                <p className="text-sm text-foreground leading-relaxed">{item.value}</p>
              </div>
            ))}
            <button className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
              Editar anamnese
            </button>
          </div>
        )}
      </div>
    </>
  );
}
