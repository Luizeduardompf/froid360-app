'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onSave: (blob: Blob, url: string) => void;
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function AudioRecorder({ onSave }: AudioRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function startRecording() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
        setState('recorded');
      };

      recorder.start(100);
      setState('recording');
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch {
      setError('Permissão de microfone negada. Verifique as configurações do navegador.');
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    mediaRecorderRef.current?.stop();
  }

  function handlePlay() {
    if (!audioUrl) return;
    if (!audioRef.current) audioRef.current = new Audio(audioUrl);
    audioRef.current.play();
    setState('playing');
    audioRef.current.onended = () => setState('recorded');
  }

  function handlePause() {
    audioRef.current?.pause();
    setState('recorded');
  }

  function handleReset() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    blobRef.current = null;
    setElapsed(0);
    setState('idle');
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }

  function handleSave() {
    if (blobRef.current && audioUrl) onSave(blobRef.current, audioUrl);
  }

  return (
    <div className="bg-muted/50 rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Gravação de áudio</span>
        {(state === 'recording' || state === 'recorded' || state === 'playing') && (
          <span className={cn('text-sm font-mono tabular-nums', state === 'recording' ? 'text-destructive' : 'text-muted-foreground')}>
            {state === 'recording' && <span className="inline-block w-2 h-2 rounded-full bg-destructive mr-1.5 animate-pulse" />}
            {formatTime(elapsed)}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        {/* Gravar / Parar */}
        {state === 'idle' && (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-white text-sm font-medium hover:bg-destructive/90 active:scale-[0.98] transition-all"
          >
            <Mic size={16} /> Gravar
          </button>
        )}

        {state === 'recording' && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-white text-sm font-medium hover:bg-destructive/90 active:scale-[0.98] transition-all"
          >
            <Square size={16} fill="white" /> Parar
          </button>
        )}

        {/* Play / Pause */}
        {(state === 'recorded' || state === 'playing') && (
          <>
            <button
              type="button"
              onClick={state === 'playing' ? handlePause : handlePlay}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              {state === 'playing' ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Ouvir</>}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              aria-label="Regravar"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/90 active:scale-[0.98] transition-all ml-auto"
            >
              <Check size={16} /> Usar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
