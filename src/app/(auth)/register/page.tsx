'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(3, 'Nome completo obrigatório'),
  crp: z.string().regex(/^\d{2}\/\d{5}$/, 'Formato: 06/12345'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) => cn(
  'w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm outline-none',
  'focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all',
  err ? 'border-destructive focus:ring-destructive/40 focus:border-destructive' : 'border-border'
);

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit() {
    await new Promise(r => setTimeout(r, 1500));
    router.push('/verify');
  }

  return (
    <main className="flex flex-col min-h-screen px-6 py-10">
      <button onClick={() => router.back()} className="flex items-center text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
        <ChevronLeft size={18} /> Voltar
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-medium text-foreground">Criar sua conta</h1>
        <p className="text-muted-foreground text-sm mt-1">Preencha seus dados profissionais</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Nome completo" error={errors.name?.message}>
          <input {...register('name')} type="text" placeholder="Dr. João Silva" className={inputCls(errors.name?.message)} />
        </Field>

        <Field label="CRP" error={errors.crp?.message}>
          <input {...register('crp')} type="text" placeholder="06/12345" className={inputCls(errors.crp?.message)} />
          <p className="text-muted-foreground text-xs -mt-0.5">Conselho Regional de Psicologia</p>
        </Field>

        <Field label="E-mail profissional" error={errors.email?.message}>
          <input {...register('email')} type="email" placeholder="seu@email.com" className={inputCls(errors.email?.message)} />
        </Field>

        <Field label="Senha" error={errors.password?.message}>
          <div className="relative">
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              className={inputCls(errors.password?.message)}
            />
            <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <Field label="Confirmar senha" error={errors.confirmPassword?.message}>
          <input
            {...register('confirmPassword')}
            type={showPass ? 'text' : 'password'}
            placeholder="Repita a senha"
            className={inputCls(errors.confirmPassword?.message)}
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-muted-foreground text-sm mt-auto pt-8">
        Já tem conta?{' '}
        <Link href="/login" className="text-primary font-medium">Entrar</Link>
      </p>
    </main>
  );
}
