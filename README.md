# Froid360 App 🚀

Aplicação full-stack moderna baseada em **Next.js 15** com App Router e TypeScript, integrando **Supabase** para backend, **Tailwind CSS** + **shadcn/ui** para interface, e **Docker** para containerização. Desenvolvida para Mac M4 (Apple Silicon) com foco em performance e desenvolvimento eficiente.

## ✨ Features Atuais

- **Next.js 15 App Router**: Server Components, TypeScript, Turbopack para dev rápido
- **Supabase Integration**: PostgreSQL cloud, autenticação SSR, queries assíncronas
- **UI Moderna**: Tailwind CSS + shadcn/ui (Button, Card, Drawer, NavigationMenu)
- **Sistema de Temas**: Suporte a modo claro/escuro com next-themes
- **Performance**: Speed Insights do Vercel para monitoramento
- **Containerização**: Docker multi-estágio para dev/prod
- **Segurança**: Headers de segurança, middleware de autenticação

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, next-themes
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Docker, Vercel
- **Tools**: ESLint, Prettier, Turbopack

## 📋 Pré-requisitos

- **Docker Desktop** (Mac M4/ARM64)
- **Git** 
- **Conta Supabase** (gratuita em supabase.com)
- **Editor** (VSCode recomendado)

## 🚀 Configuração

### 1. Clone e Setup
```bash
git clone https://github.com/luizeduardompf/froid360-app.git
cd froid360-app
```

### 2. Configure Supabase
Crie `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_TELEMETRY_DISABLED=1
```

### 3. Crie tabela de teste no Supabase
```sql
CREATE TABLE users_test (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🏃‍♂️ Desenvolvimento

### Iniciar o projeto
```bash
# Limpar volumes antigos
docker-compose down -v

# Construir e iniciar
docker-compose up --build
```

Acesse: http://localhost:3000

### Hot Reload
- Edite arquivos em `src/` e veja as mudanças instantaneamente
- Turbopack para rebuilds rápidos (~1s)

### Comandos úteis
```bash
# Instalar componentes shadcn/ui
docker-compose exec app npx shadcn@latest add button card drawer

# Lint e formatação
docker-compose exec app npm run lint -- --fix

# Parar containers
docker-compose down
```

## 🚀 Deploy

### Docker Production
```bash
# Modificar docker-compose.yml para target: runner
docker-compose down -v && docker-compose up --build
```

### Vercel
```bash
# Instalar Vercel CLI
docker-compose exec app npm install -g vercel

# Deploy
vercel --prod
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal com ThemeProvider
│   ├── page.tsx           # Página inicial com query Supabase
│   └── globals.css        # Estilos Tailwind
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── providers/         # ThemeProvider
│   └── insights/          # Speed Insights
├── lib/
│   ├── supabase.ts        # Clientes Supabase (browser/server)
│   └── utils.ts           # Utilitários (cn helper)
└── middleware.ts          # Middleware de autenticação
```

## 🔧 Troubleshooting

### Problemas Comuns
- **Next.js 15 Cookies**: Use `await cookies()` em server components
- **Hot-reload não funciona**: Verifique volumes Docker
- **Erro Supabase**: Confirme variáveis de ambiente em `.env.local`
- **Build lento**: Use `docker builder prune -f` para limpar cache

## 📚 Referências

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase + Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Docker + Next.js](https://nextjs.org/docs/app/building-your-application/deploying#docker-image)

## 📄 Licença

MIT License - Desenvolvido por [luizeduardompf](https://github.com/luizeduardompf)

