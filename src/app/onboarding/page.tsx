'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, MessageCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: Users,
    color: 'bg-primary/10 text-primary',
    title: 'Gerencie seus pacientes',
    description: 'Cadastre pacientes com anamnese completa, histórico clínico e dados financeiros em um só lugar.',
  },
  {
    icon: Calendar,
    color: 'bg-secondary/10 text-secondary',
    title: 'Agenda inteligente',
    description: 'Agende sessões com recorrência automática, receba lembretes e visualize sua semana de forma clara.',
  },
  {
    icon: MessageCircle,
    color: 'bg-purple-100 text-purple-600',
    title: 'IA contextualizada',
    description: 'Consulte a IA com perguntas específicas sobre cada paciente. Privado, seguro e baseado nas suas anotações.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;
  const { icon: Icon, color, title, description } = STEPS[step];

  return (
    <main className="flex flex-col min-h-screen px-6 py-10 max-w-[430px] mx-auto">
      {/* Skip */}
      <button
        onClick={() => router.push('/pacientes')}
        className="self-end text-muted-foreground text-sm hover:text-foreground transition-colors"
      >
        Pular
      </button>

      {/* Illustration area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className={cn('w-28 h-28 rounded-3xl flex items-center justify-center', color)}>
          <Icon size={48} strokeWidth={1.5} />
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-2xl font-medium text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-[300px] mx-auto">
            {description}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-300',
              i === step ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-border'
            )}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button
          onClick={() => isLast ? router.push('/pacientes') : setStep(s => s + 1)}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          {isLast ? 'Começar agora' : 'Próximo'}
          {isLast ? <ArrowRight size={18} /> : <ChevronRight size={18} />}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="w-full py-3 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Voltar
          </button>
        )}
      </div>
    </main>
  );
}
