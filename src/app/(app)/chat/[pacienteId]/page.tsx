'use client';

import { use, useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import { Send, Mic, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/common/Avatar';
import { MOCK_PATIENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const QUICK_SUGGESTIONS = [
  'O que tratar hoje?',
  'Resumo da última sessão',
  'Histórico de pagamentos',
  'Progresso geral',
];

export default function ChatPage({ params }: { params: Promise<{ pacienteId: string }> }) {
  const { pacienteId } = use(params);
  const isGeral = pacienteId === 'geral';
  const patient = isGeral ? null : MOCK_PATIENTS.find(p => p.id === pacienteId);

  const { messages, input, setInput, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: { patientId: isGeral ? undefined : pacienteId },
    initialMessages: [],
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendSuggestion(text: string) {
    setInput(text);
    setTimeout(() => {
      const form = document.querySelector<HTMLFormElement>('form[data-chat-form]');
      form?.requestSubmit();
    }, 50);
  }

  function handleVoiceInput() {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  }

  const title = patient ? patient.name.split(' ')[0] : 'Chat geral';
  const subtitle = patient ? 'IA contextualizada com dados do paciente' : 'Psicologia clínica & técnicas';

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <TopBar
        title={title}
        subtitle={subtitle}
        showBack
        action={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/15 border border-secondary/20">
            <Sparkles size={12} className="text-secondary" />
            <span className="text-[11px] text-secondary font-medium">IA ativa</span>
          </div>
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-8">
            {patient ? (
              <Avatar name={patient.name} size="lg" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles size={28} className="text-primary" />
              </div>
            )}
            <div>
              <p className="font-medium text-foreground">
                {patient ? `Consulte sobre ${patient.name.split(' ')[0]}` : 'Chat geral'}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
                {patient
                  ? 'A IA tem acesso às anotações e histórico deste paciente.'
                  : 'Pergunte sobre técnicas, DSM-5, casos hipotéticos ou qualquer tema clínico.'}
              </p>
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={13} className="text-primary-foreground" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card border border-border text-foreground rounded-bl-sm'
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Sparkles size={13} className="text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle size={16} />
            {error.message.includes('quota') ? 'Limite de uso atingido. Tente novamente mais tarde.' : 'Erro ao processar. Verifique sua conexão.'}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2">
          {QUICK_SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => sendSuggestion(s)}
              className="flex-shrink-0 px-3 py-2 rounded-xl border border-border bg-card text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-safe pt-2 bg-background border-t border-border">
        <form
          data-chat-form
          onSubmit={handleSubmit}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); } }}
              placeholder="Pergunte sobre o paciente..."
              rows={1}
              className="w-full px-4 py-3 pr-10 rounded-2xl border border-border bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none transition-all"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          <button
            type="button"
            onClick={handleVoiceInput}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center border border-border flex-shrink-0 transition-all',
              listening ? 'bg-destructive text-white border-destructive' : 'bg-card text-muted-foreground hover:text-foreground hover:border-primary/50'
            )}
          >
            <Mic size={18} />
          </button>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
