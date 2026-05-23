'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Bell, Plus } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MOCK_CALENDAR } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/lib/types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const STATUS_DOT: Record<string, string> = {
  agendada: 'bg-primary',
  realizada: 'bg-secondary',
  cancelada: 'bg-destructive',
  faltou: 'bg-orange-400',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const NOTIFICATIONS = [
  { id: 1, type: 'sessão', text: 'Ana Clara Souza — sessão em 1 hora (10h)', urgency: false },
  { id: 2, type: 'pagamento', text: 'Bruno Mendes — pagamento pendente há 7 dias', urgency: true },
];

export default function AgendaPage() {
  const today = new Date();
  const [view, setView] = useState<'month' | 'week'>('month');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  // Mapa de datas com eventos
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  MOCK_CALENDAR.forEach(ev => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const todayStr = today.toISOString().slice(0, 10);
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  // Week view: get Mon–Sun of current week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
  const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i); // 8–20

  return (
    <>
      <TopBar
        title="Agenda"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setView(v => v === 'month' ? 'week' : 'month')}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-all"
            >
              {view === 'month' ? 'Semana' : 'Mês'}
            </button>
          </div>
        }
      />

      {/* Notificações */}
      <div className="px-4 pt-3 space-y-2">
        {NOTIFICATIONS.map(n => (
          <div key={n.id} className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border text-sm',
            n.urgency ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-primary/5 border-primary/15 text-primary')}>
            <Bell size={15} className="flex-shrink-0" />
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      {/* ── Monthly View ──────────────────────────────────── */}
      {view === 'month' && (
        <div className="px-4 py-4 space-y-4">
          {/* Nav */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-medium text-foreground">{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map(d => (
              <span key={d} className="text-[11px] font-medium text-muted-foreground py-1">{d}</span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const events = eventsByDate[dateStr] ?? [];

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={cn(
                    'flex flex-col items-center py-1 rounded-xl transition-all',
                    isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'bg-primary/15 text-primary' : 'hover:bg-muted text-foreground'
                  )}
                >
                  <span className="text-xs font-medium">{day}</span>
                  {events.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {events.slice(0, 3).map(ev => (
                        <span key={ev.id} className={cn('w-1 h-1 rounded-full', isSelected ? 'bg-white' : STATUS_DOT[ev.status])} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day events */}
          {selectedDate && (
            <div className="space-y-2 mt-2">
              <p className="text-sm font-medium text-foreground">
                {new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma sessão agendada</p>
              ) : (
                selectedEvents.map(ev => (
                  <div key={ev.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                    <Avatar name={ev.patientName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{ev.patientName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={11} />{ev.time} · {ev.duration}min · {ev.recurrence}
                      </p>
                    </div>
                    <StatusBadge status={ev.status} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Weekly View ───────────────────────────────────── */}
      {view === 'week' && (
        <div className="px-2 py-4 overflow-x-auto">
          <div className="min-w-[560px]">
            {/* Week headers */}
            <div className="grid grid-cols-8 mb-2">
              <div className="w-10" />
              {weekDays.map(d => {
                const isToday = d.toISOString().slice(0, 10) === todayStr;
                return (
                  <div key={d.toISOString()} className="text-center">
                    <p className="text-[10px] text-muted-foreground">{WEEKDAYS[d.getDay()]}</p>
                    <p className={cn('text-xs font-medium w-7 h-7 mx-auto flex items-center justify-center rounded-full',
                      isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                    )}>
                      {d.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Hour rows */}
            {HOURS.map(hour => {
              return (
                <div key={hour} className="grid grid-cols-8 border-t border-border/40 min-h-[52px]">
                  <div className="w-10 pr-2 pt-1">
                    <span className="text-[10px] text-muted-foreground">{hour}h</span>
                  </div>
                  {weekDays.map(d => {
                    const dateStr = d.toISOString().slice(0, 10);
                    const events = (eventsByDate[dateStr] ?? []).filter(ev => parseInt(ev.time.split(':')[0]) === hour);
                    return (
                      <div key={dateStr} className="border-l border-border/30 px-0.5 py-0.5 min-h-[52px]">
                        {events.map(ev => (
                          <div
                            key={ev.id}
                            className={cn(
                              'rounded-md px-1.5 py-1 text-[10px] leading-tight mb-0.5',
                              ev.status === 'agendada' ? 'bg-primary/15 text-primary' :
                              ev.status === 'realizada' ? 'bg-secondary/15 text-secondary' :
                              'bg-destructive/15 text-destructive'
                            )}
                          >
                            <p className="font-medium truncate">{ev.patientName.split(' ')[0]}</p>
                            <p className="opacity-75">{ev.time} · {ev.duration}min</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agendar */}
      {!showSchedule ? (
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowSchedule(true)}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-primary flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <Plus size={16} /> Agendar nova sessão
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-3">
          <h3 className="font-medium text-foreground">Agendar sessão</h3>
          {[
            { label: 'Paciente', type: 'select', options: ['Ana Clara Souza', 'Bruno Mendes', 'Carla Ferreira'] },
            { label: 'Data', type: 'date' },
            { label: 'Horário', type: 'time' },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{f.label}</label>
              {f.type === 'select' ? (
                <select className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40">
                  {f.options?.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40" />
              )}
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Recorrência</label>
            <select className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40">
              <option>Única</option>
              <option>Semanal</option>
              <option>Quinzenal</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowSchedule(false)} className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-all">
              Cancelar
            </button>
            <button onClick={() => setShowSchedule(false)} className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
              Agendar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
