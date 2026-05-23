import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/common/Avatar';
import { ChevronRight, Shield, Bell, CreditCard, HelpCircle, LogOut } from 'lucide-react';

const MENU_ITEMS = [
  { group: 'Conta', items: [
    { icon: Shield, label: 'Privacidade e segurança' },
    { icon: Bell, label: 'Notificações' },
    { icon: CreditCard, label: 'Assinatura e pagamento' },
  ]},
  { group: 'Suporte', items: [
    { icon: HelpCircle, label: 'Central de ajuda' },
  ]},
];

export default function PerfilPage() {
  return (
    <>
      <TopBar title="Perfil" />

      <div className="px-4 py-6 space-y-6">
        {/* Card do psicólogo */}
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
          <Avatar name="Dr. João Silva" size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">Dr. João Silva</p>
            <p className="text-sm text-muted-foreground">CRP 06/12345</p>
            <p className="text-xs text-muted-foreground mt-0.5">joao@email.com</p>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Pacientes', value: '3' },
            { label: 'Sessões/mês', value: '6' },
            { label: 'Receita/mês', value: 'R$1.5k' },
          ].map(m => (
            <div key={m.label} className="bg-card rounded-xl border border-border p-3">
              <p className="text-base font-medium text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        {MENU_ITEMS.map(group => (
          <div key={group.group} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 mb-2">{group.group}</p>
            <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
              {group.items.map(item => (
                <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left">
                  <item.icon size={18} className="text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm text-foreground">{item.label}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sair */}
        <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5 transition-all">
          <LogOut size={16} /> Sair da conta
        </button>

        <p className="text-center text-xs text-muted-foreground">Froid.app v1.0.0 — Fase 0 V0</p>
      </div>
    </>
  );
}
