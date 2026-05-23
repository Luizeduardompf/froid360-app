'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [resent, setResent] = useState(false);

  function handleResend() {
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
        <Mail size={36} className="text-primary" />
      </div>

      <h1 className="text-2xl font-medium text-foreground mb-2">Verifique seu e-mail</h1>
      <p className="text-muted-foreground text-sm leading-relaxed max-w-[300px]">
        Enviamos um link de confirmação para <span className="font-medium text-foreground">seu@email.com</span>.
        Acesse seu e-mail e clique no link para ativar sua conta.
      </p>

      <div className="mt-8 space-y-3 w-full max-w-[320px]">
        {resent && (
          <div className="px-4 py-3 rounded-xl bg-secondary/20 border border-secondary/30 text-sm text-secondary-foreground">
            ✓ E-mail reenviado com sucesso
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={resent}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={resent ? 'animate-spin' : ''} />
          Reenviar e-mail
        </button>

        <button
          onClick={() => router.push('/onboarding')}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-medium text-base hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          Já confirmei, continuar
        </button>
      </div>

      <p className="text-muted-foreground text-xs mt-8 leading-relaxed">
        Não recebeu? Verifique sua pasta de spam ou{' '}
        <button onClick={() => router.push('/login')} className="text-primary underline">
          tente outro e-mail
        </button>
      </p>
    </main>
  );
}
