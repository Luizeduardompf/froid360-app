'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';

// ── Schemas por step ──────────────────────────────────────────────────────────
const step1Schema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  birthDate: z.string().min(1, 'Data obrigatória'),
  gender: z.enum(['M', 'F', 'outro']),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
});

const step2Schema = z.object({
  chiefComplaint: z.string().min(10, 'Descreva a queixa principal'),
  medicalHistory: z.string(),
  medications: z.string(),
});

const step3Schema = z.object({
  sessionValue: z.coerce.number().min(1, 'Informe o valor da sessão'),
  paymentMethod: z.enum(['pix', 'dinheiro', 'cartão', 'transferência']),
  paymentDueDay: z.coerce.number().min(1).max(28),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

const STEPS = ['Dados básicos', 'Anamnese', 'Financeiro'];

const inputCls = (err?: string) => cn(
  'w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm outline-none',
  'focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all',
  err ? 'border-destructive' : 'border-border'
);

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

export default function NovoPacientePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data1, setData1] = useState<Partial<Step1>>({});
  const [data2, setData2] = useState<Partial<Step2>>({});

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: data1 });
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: data2 });
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema), defaultValues: { paymentMethod: 'pix', paymentDueDay: 10 } });

  async function handleStep1(d: Step1) { setData1(d); setStep(1); }
  async function handleStep2(d: Step2) { setData2(d); setStep(2); }
  async function handleStep3() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    router.push('/pacientes');
  }

  return (
    <>
      <TopBar title="Novo paciente" showBack />

      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2 mb-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn('h-1 w-full rounded-full transition-all duration-300', i <= step ? 'bg-primary' : 'bg-border')} />
              <span className={cn('text-[10px]', i === step ? 'text-primary font-medium' : 'text-muted-foreground')}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Step 1 */}
        {step === 0 && (
          <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-4">
            <Field label="Nome completo" error={form1.formState.errors.name?.message}>
              <input {...form1.register('name')} placeholder="Nome do paciente" className={inputCls(form1.formState.errors.name?.message)} />
            </Field>
            <Field label="Data de nascimento" error={form1.formState.errors.birthDate?.message}>
              <input {...form1.register('birthDate')} type="date" className={inputCls(form1.formState.errors.birthDate?.message)} />
            </Field>
            <Field label="Gênero" error={form1.formState.errors.gender?.message}>
              <select {...form1.register('gender')} className={inputCls(form1.formState.errors.gender?.message)}>
                <option value="">Selecionar...</option>
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
                <option value="outro">Outro / Não informado</option>
              </select>
            </Field>
            <Field label="Telefone" error={form1.formState.errors.phone?.message}>
              <input {...form1.register('phone')} type="tel" placeholder="(11) 99999-9999" className={inputCls(form1.formState.errors.phone?.message)} />
            </Field>
            <Field label="E-mail" error={form1.formState.errors.email?.message}>
              <input {...form1.register('email')} type="email" placeholder="paciente@email.com" className={inputCls(form1.formState.errors.email?.message)} />
            </Field>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-medium mt-4 hover:bg-primary/90 active:scale-[0.98] transition-all">
              Próximo
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-4">
            <Field label="Queixa principal" error={form2.formState.errors.chiefComplaint?.message}>
              <textarea
                {...form2.register('chiefComplaint')}
                placeholder="Descreva o motivo principal que levou o paciente à terapia..."
                rows={4}
                className={cn(inputCls(form2.formState.errors.chiefComplaint?.message), 'resize-none')}
              />
            </Field>
            <Field label="Histórico relevante" error={form2.formState.errors.medicalHistory?.message}>
              <textarea
                {...form2.register('medicalHistory')}
                placeholder="Histórico clínico, familiar, social relevante..."
                rows={4}
                className={cn(inputCls(), 'resize-none')}
              />
            </Field>
            <Field label="Medicações em uso" error={form2.formState.errors.medications?.message}>
              <input {...form2.register('medications')} placeholder="Nome, dose e prescritor (ou 'Nenhuma')" className={inputCls()} />
            </Field>
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setStep(0)} className="flex-1 py-4 rounded-2xl border border-border text-foreground font-medium hover:bg-muted transition-all">
                Voltar
              </button>
              <button type="submit" className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-medium hover:bg-primary/90 active:scale-[0.98] transition-all">
                Próximo
              </button>
            </div>
          </form>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <form onSubmit={form3.handleSubmit(handleStep3)} className="space-y-4">
            <Field label="Valor da sessão (R$)" error={form3.formState.errors.sessionValue?.message}>
              <input {...form3.register('sessionValue')} type="number" min="0" step="10" placeholder="150" className={inputCls(form3.formState.errors.sessionValue?.message)} />
            </Field>
            <Field label="Forma de pagamento preferida" error={form3.formState.errors.paymentMethod?.message}>
              <select {...form3.register('paymentMethod')} className={inputCls()}>
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartão">Cartão</option>
                <option value="transferência">Transferência bancária</option>
              </select>
            </Field>
            <Field label="Dia de vencimento" error={form3.formState.errors.paymentDueDay?.message}>
              <input {...form3.register('paymentDueDay')} type="number" min="1" max="28" placeholder="10" className={inputCls()} />
              <p className="text-muted-foreground text-xs -mt-0.5">Dia do mês para cobrança automática</p>
            </Field>
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl border border-border text-foreground font-medium hover:bg-muted transition-all">
                Voltar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Salvando...' : 'Salvar paciente'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
