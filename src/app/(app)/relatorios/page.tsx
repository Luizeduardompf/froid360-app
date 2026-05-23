'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, XCircle, AlertTriangle, FileText, Download, Check } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MOCK_PATIENTS, MOCK_SESSIONS, MOCK_PAYMENTS, WEEKLY_REVENUE } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const TABS = ['Dashboard', 'Por paciente', 'Exportar'];

// ── Métricas ─────────────────────────────────────────────────────────────────
const sessoesMes = MOCK_SESSIONS.filter(s => s.date.startsWith('2026-05'));
const realizadas = sessoesMes.filter(s => s.status === 'realizada');
const canceladas = sessoesMes.filter(s => s.status === 'cancelada');
const receitaRealizada = realizadas.reduce((acc, s) => acc + s.value, 0);
const pagPendentes = MOCK_PAYMENTS.filter(p => p.status === 'pendente');
const inadimplencia = pagPendentes.reduce((acc, p) => acc + p.amount, 0);
const taxaCancelamento = sessoesMes.length > 0 ? Math.round((canceladas.length / sessoesMes.length) * 100) : 0;

export default function RelatoriosPage() {
  const [tab, setTab] = useState(0);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [paidIds, setPaidIds] = useState<string[]>([]);
  const [exportPeriod, setExportPeriod] = useState('2026-05');

  async function handleMarkPaid(id: string) {
    setMarkingPaid(id);
    await new Promise(r => setTimeout(r, 800));
    setPaidIds(ids => [...ids, id]);
    setMarkingPaid(null);
  }

  async function handleExportCSV() {
    const { default: Papa } = await import('papaparse');
    const rows = MOCK_SESSIONS.filter(s => s.date.startsWith(exportPeriod)).map(s => {
      const p = MOCK_PATIENTS.find(pt => pt.id === s.patientId);
      return {
        'Data': s.date,
        'Horário': s.time,
        'Paciente': p?.name ?? '',
        'Duração (min)': s.duration,
        'Status': s.status,
        'Valor (R$)': s.value,
        'Cobrado': s.charged ? 'Sim' : 'Não',
      };
    });
    const csv = Papa.unparse(rows, { delimiter: ';' });
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessoes_${exportPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleExportPDF() {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const primaryColor: [number, number, number] = [74, 144, 184];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Froid.app — Relatório Financeiro', 15, 19);

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Período: ${exportPeriod}`, 15, 40);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 15, 48);

    // Métricas
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo do período', 15, 62);

    const metricas = [
      ['Receita realizada', formatCurrency(receitaRealizada)],
      ['Sessões realizadas', String(realizadas.length)],
      ['Taxa de cancelamento', `${taxaCancelamento}%`],
      ['Inadimplência', formatCurrency(inadimplencia)],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    metricas.forEach(([label, value], i) => {
      const y = 74 + i * 10;
      doc.setTextColor(100, 100, 100);
      doc.text(label, 15, y);
      doc.setTextColor(30, 30, 30);
      doc.text(value, 120, y, { align: 'right' });
      doc.setDrawColor(220, 220, 220);
      doc.line(15, y + 2, 195, y + 2);
    });

    // Sessões
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(50, 50, 50);
    doc.text('Sessões do período', 15, 124);

    const sessoesPeriodo = MOCK_SESSIONS.filter(s => s.date.startsWith(exportPeriod));
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Data', 15, 134);
    doc.text('Paciente', 40, 134);
    doc.text('Status', 130, 134);
    doc.text('Valor', 175, 134, { align: 'right' });
    doc.setDrawColor(...primaryColor);
    doc.line(15, 136, 195, 136);

    doc.setFont('helvetica', 'normal');
    sessoesPeriodo.forEach((s, i) => {
      const y = 144 + i * 9;
      const p = MOCK_PATIENTS.find(pt => pt.id === s.patientId);
      doc.setTextColor(80, 80, 80);
      doc.text(new Date(s.date).toLocaleDateString('pt-BR'), 15, y);
      doc.text(p?.name?.split(' ').slice(0, 2).join(' ') ?? '', 40, y);
      doc.text(s.status, 130, y);
      doc.text(formatCurrency(s.value), 175, y, { align: 'right' });
    });

    doc.save(`relatorio_financeiro_${exportPeriod}.pdf`);
  }

  return (
    <>
      <TopBar title="Relatórios" />

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar px-4 gap-1 border-b border-border">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={cn(
              'flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all',
              tab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab: Dashboard ───────────────────────────────── */}
      {tab === 0 && (
        <div className="px-4 py-4 space-y-4">
          {/* Mês atual */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Maio 2026</p>

          {/* Métricas cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Receita', value: formatCurrency(receitaRealizada), icon: TrendingUp, color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Sessões', value: String(realizadas.length), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Cancelamentos', value: `${taxaCancelamento}%`, icon: XCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Inadimplência', value: formatCurrency(inadimplencia), icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
            ].map(m => (
              <div key={m.label} className="bg-card rounded-2xl border border-border p-4">
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-2', m.bg)}>
                  <m.icon size={16} className={m.color} />
                </div>
                <p className="text-lg font-medium text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Gráfico de barras */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-sm font-medium text-foreground mb-3">Receita semanal (R$)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={WEEKLY_REVENUE} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Receita']}
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: 12 }}
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pagamentos pendentes */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Pagamentos pendentes</p>
            <div className="space-y-2">
              {pagPendentes.map(p => {
                const patient = MOCK_PATIENTS.find(pt => pt.id === p.patientId);
                const isPaid = paidIds.includes(p.id);
                return (
                  <div key={p.id} className={cn('flex items-center gap-3 p-4 bg-card rounded-2xl border transition-all',
                    isPaid ? 'border-secondary/30 opacity-60' : 'border-border')}>
                    {patient && <Avatar name={patient.name} size="sm" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{patient?.name}</p>
                      <p className="text-xs text-muted-foreground">{p.description} · {formatCurrency(p.amount)}</p>
                    </div>
                    <button
                      onClick={() => !isPaid && handleMarkPaid(p.id)}
                      disabled={isPaid || markingPaid === p.id}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                        isPaid ? 'bg-secondary/15 text-secondary' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      )}
                    >
                      {isPaid ? <><Check size={12} className="inline mr-1" />Pago</> : markingPaid === p.id ? '...' : 'Marcar pago'}
                    </button>
                  </div>
                );
              })}
              {pagPendentes.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-6">Sem pagamentos pendentes 🎉</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Por paciente ────────────────────────────── */}
      {tab === 1 && (
        <div className="px-4 py-4 space-y-3">
          {MOCK_PATIENTS.map(patient => {
            const pSessions = MOCK_SESSIONS.filter(s => s.patientId === patient.id && s.status === 'realizada');
            const pPayments = MOCK_PAYMENTS.filter(p => p.patientId === patient.id);
            const totalInvested = pPayments.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.amount, 0);
            const lastSession = pSessions.sort((a, b) => b.date.localeCompare(a.date))[0];

            return (
              <div key={patient.id} className="bg-card rounded-2xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name={patient.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{patient.name}</p>
                    <StatusBadge status={patient.status} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Sessões', value: pSessions.length },
                    { label: 'Investido', value: formatCurrency(totalInvested) },
                    { label: 'Última sessão', value: lastSession ? new Date(lastSession.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—' },
                  ].map(m => (
                    <div key={m.label} className="bg-muted/50 rounded-xl p-2">
                      <p className="text-sm font-medium text-foreground">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={async () => {
                    const { default: jsPDF } = await import('jspdf');
                    const doc = new jsPDF();
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Relatório — ${patient.name}`, 15, 20);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(11);
                    doc.text(`Total investido: ${formatCurrency(totalInvested)}`, 15, 35);
                    doc.text(`Sessões realizadas: ${pSessions.length}`, 15, 45);
                    doc.text(`Última sessão: ${lastSession?.date ? new Date(lastSession.date).toLocaleDateString('pt-BR') : '—'}`, 15, 55);
                    doc.save(`relatorio_${patient.name.replace(/\s/g, '_')}.pdf`);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                >
                  <FileText size={14} /> Exportar PDF
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Exportar ────────────────────────────────── */}
      {tab === 2 && (
        <div className="px-4 py-4 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Período</label>
            <input
              type="month"
              value={exportPeriod}
              onChange={e => setExportPeriod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
                <Download size={20} className="text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Exportar sessões (CSV)</p>
                <p className="text-xs text-muted-foreground">Compatível com Excel e Google Sheets</p>
              </div>
            </button>

            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Relatório financeiro (PDF)</p>
                <p className="text-xs text-muted-foreground">Resumo do período com gráficos e métricas</p>
              </div>
            </button>
          </div>

          <div className="bg-muted/60 rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed">
            Os dados exportados incluem todas as sessões e informações financeiras do período selecionado. Os dados clínicos dos pacientes não são incluídos nas exportações.
          </div>
        </div>
      )}
    </>
  );
}
