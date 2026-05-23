'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Play, Pause, Loader2 } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AudioRecorder } from '@/components/common/AudioRecorder';
import { MOCK_PATIENTS, MOCK_SESSIONS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const schema = z.object({
  patientId: z.string().min(1, 'Selecione o paciente'),
  date: z.string().min(1, 'Data obrigatória'),
  time: z.string().min(1, 'Horário obrigatório'),
  duration: z.coerce.number().min(1),
  status: z.enum(['realizada', 'cancelada', 'faltou']),
  notes: z.string(),
  charged: z.boolean(),
});
type FormData = z.infer<typeof schema>;

const inputCls = cn(
  'w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm outline-none',
  'focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all'
);

function AudioPlayerCompact({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function toggle() {
    if (!audioRef.current) audioRef.current = new Audio(url);
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); audioRef.current.onended = () => setPlaying(false); }
  }

  return (
    <button type="button" onClick={toggle} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all">
      {playing ? <Pause size={14} /> : <Play size={14} />}
      {playing ? 'Pausar' : 'Ouvir gravação'}
    </button>
  );
}

// workaround para useRef sem importar
import { useRef } from 'react';

export default function SessoesPage() {
  const router = useRouter();
  const [audioSaved, setAudioSaved] = useState<{ blob: Blob; url: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      time: '09:00',
      duration: 50,
      status: 'realizada',
      notes: '',
      charged: true,
    },
  });

  const status = watch('status');

  async function onSubmit() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    router.push('/pacientes');
  }

  return (
    <>
      <TopBar title="Registrar sessão" showBack />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-4 space-y-5">
        {/* Paciente */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Paciente</label>
          <select {...register('patientId')} className={inputCls}>
            <option value="">Selecionar paciente...</option>
            {MOCK_PATIENTS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.patientId && <p className="text-destructive text-xs">{errors.patientId.message}</p>}
        </div>

        {/* Data e hora */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Data</label>
            <input {...register('date')} type="date" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Horário</label>
            <input {...register('time')} type="time" className={inputCls} />
          </div>
        </div>

        {/* Duração e status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Duração</label>
            <select {...register('duration')} className={inputCls}>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={50}>50 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select {...register('status')} className={inputCls}>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
              <option value="faltou">Paciente faltou</option>
            </select>
          </div>
        </div>

        {/* Anotações */}
        {status === 'realizada' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Anotações da sessão</label>
            <textarea
              {...register('notes')}
              placeholder="Registre os principais pontos abordados na sessão..."
              rows={5}
              className={cn(inputCls, 'resize-none')}
            />
          </div>
        )}

        {/* Gravação de áudio */}
        {status === 'realizada' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Anotação em áudio</label>
            {audioSaved ? (
              <div className="flex items-center gap-3 bg-secondary/10 rounded-xl border border-secondary/20 p-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-secondary">Gravação salva</p>
                  <p className="text-xs text-muted-foreground">Armazenada localmente nesta sessão</p>
                </div>
                <AudioPlayerCompact url={audioSaved.url} />
              </div>
            ) : (
              <AudioRecorder onSave={(blob, url) => setAudioSaved({ blob, url })} />
            )}
          </div>
        )}

        {/* Cobrança */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...register('charged')}
            type="checkbox"
            className="w-5 h-5 rounded accent-primary"
          />
          <div>
            <p className="text-sm font-medium text-foreground">Gerar cobrança automaticamente</p>
            <p className="text-xs text-muted-foreground">Registra o pagamento como pendente</p>
          </div>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar sessão'}
        </button>
      </form>

      {/* Lista de sessões recentes */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3 mt-2">Sessões recentes</h2>
        <div className="space-y-2">
          {MOCK_SESSIONS.slice(0, 4).map(s => {
            const patient = MOCK_PATIENTS.find(p => p.id === s.patientId);
            return (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border">
                {patient && <Avatar name={patient.name} size="sm" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{patient?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.date).toLocaleDateString('pt-BR')} · {s.duration}min
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
