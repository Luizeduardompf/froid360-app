import Link from 'next/link';
import { MessageCircle, ChevronRight, Sparkles } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/common/Avatar';
import { MOCK_PATIENTS } from '@/lib/mock-data';

const LAST_TOPICS: Record<string, string> = {
  p1: 'Estratégias para ansiedade no trabalho',
  p2: 'Progresso no processo de luto',
};

export default function ChatListPage() {
  return (
    <>
      <TopBar title="Chat AI" />

      <div className="px-4 py-4 space-y-4">
        {/* Chat geral */}
        <Link
          href="/chat/geral"
          className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20 hover:border-primary/40 hover:bg-primary/8 active:scale-[0.99] transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground">Chat geral</p>
            <p className="text-xs text-muted-foreground truncate">Psicologia clínica, técnicas, DSM-5...</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
        </Link>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Por paciente</p>
          <div className="space-y-2">
            {MOCK_PATIENTS.map(p => (
              <Link
                key={p.id}
                href={`/chat/${p.id}`}
                className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm active:scale-[0.99] transition-all"
              >
                <Avatar name={p.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {LAST_TOPICS[p.id] ?? 'Iniciar conversa sobre este paciente'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-muted/60 rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground mb-1 flex items-center gap-1.5">
            <MessageCircle size={13} /> Privacidade e confidencialidade
          </p>
          As conversas são processadas de forma segura. Os dados dos pacientes são usados apenas para gerar contexto nesta sessão e não são armazenados pela IA.
        </div>
      </div>
    </>
  );
}
