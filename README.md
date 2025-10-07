# Froid360 App

![Froid360 Logo](https://via.placeholder.com/400x200/4F46E5/FFFFFF?text Substitua por logo real se disponível -->

## Overview

Froid360 é uma aplicação full-stack moderna construída com **Next.js 15** (App Router, Turbopack), **shadcn/ui** (componentes acessíveis e customizáveis), **Tailwind CSS** para estilização, e **Vercel** para deployment serverless otimizado (SSR, Edge Functions, CDN global). O projeto inclui suporte a temas dinâmicos via **next-themes** (light/dark/system mode), integração inicial com **Supabase** (pronto para auth, database e realtime), e monitoramento de performance com **Vercel Speed Insights**.

- **Versão Next.js**: 15.5.4 (com React 19 RC, strict TS).
- **UI Library**: shadcn/ui (slate theme, components como Button, Card, NavigationMenu).
- **Dev Setup**: Docker Compose para containerização (Alpine Node 20, volumes para hot-reload).
- **Deployment**: Vercel (CLI ou Git integration); cada deploy gera URL dinâmica (ex: froid360-hash.vercel.app); alias persistente: [https://froid360-app.vercel.app/](https://froid360-app.vercel.app/).
- **Ambiente**: Local (localhost:3000 via Docker), Production (Vercel Edge, low-latency EU).
- **Features Atuais**: Tema toggle sem flicker, custom page.tsx ("Get started by editing - LUIZ"), Speed Insights para Core Web Vitals (LCP/CLS/TTFB).
- **Próximos**: Integração Supabase (auth/query), navbar responsivo, dashboard com charts.

O app é otimizado para desenvolvimento rápido (hot-reload), testes locais (sem erros hidratação), e escalabilidade prod (100GB bandwidth free tier). Ideal para apps como dashboards financeiros ou e-commerce (compatível payments como EasyPay).

## Requisitos

- **Node.js**: 20+ (gerenciado via Docker).
- **Docker**: Para dev/prod-like isolation (Compose v2+).
- **Git**: Clone repo (SSH ou HTTPS).
- **Vercel Account**: Free tier (opcional para CLI; GitHub login).
- **Editor**: VSCode (extensões: Tailwind CSS IntelliSense, shadcn/ui snippets).

## Setup Local (Docker)

1. **Clone o Repo**:
   ```
   git clone git@github.com:Luizeduardompf/froid360-app.git  # SSH (configure key)
   cd froid360-app
   ```

2. **Instale Dependências** (se fora Docker):
   ```
   npm install
   ```
   - Mas use Docker para consistency: Volumes montam src/ para hot-reload.

3. **Configure .env.local** (raiz; não commit):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co  # De Supabase dashboard
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...  # Anon key
   NEXT_TELEMETRY_DISABLED=1  # Silencia Next.js telemetry
   SPEED_INSIGHTS_DEV=true  # Opcional: Ativa Speed Insights em dev (não recomendado para dados reais)
   ```

4. **Inicie com Docker**:
   ```
   docker-compose up -d  # Detached mode; ~20s inicial (build cache)
   ```
   - Acessa http://localhost:3000 (hot-reload em src/; edite page.tsx e veja live).
   - Logs: `docker-compose logs app` (confirme "✓ Ready in Xs").
   - Pare: `docker-compose down -v` (limpa volumes se necessário).

5. **Comandos Úteis no Container**:
   ```
   docker-compose exec app npm run dev  # Dev server (se não up)
   docker-compose exec app npm run build  # Teste production build (~30s)
   docker-compose exec app npm run lint -- --fix  # ESLint/TS fix (evite next lint se issue Alpine)
   docker-compose restart  # Aplica mudanças (~5s)
   ```

- **Estrutura**:
  - `src/app/`: App Router (page.tsx, layout.tsx).
  - `src/components/ui/`: shadcn components (Button, Card, etc.).
  - `src/lib/`: Utils (cn, supabase.ts com createBrowserClient de @supabase/ssr).
  - `src/components/providers/`: ThemeProvider (next-themes wrapper).
  - `components.json`: shadcn config (slate theme, Tailwind).

- **Troubleshooting Local**:
  - Hidratação errors: Verifique suppressHydrationWarning em layout.tsx; use cn() para classes condicionais.
  - Docker perms: `docker-compose exec app chown -R node:node /app`.
  - TS issues: Rode `docker-compose exec app npx tsc --noEmit` (strict mode).

## Deployment no Vercel

### Visão Geral
- **Integração Git**: Ativada no dashboard (vercel.com/dashboard > froid360-app > Settings > Git) – pushes para main triggeram deploys auto.
- **URLs Dinâmicas**: Cada deploy gera URL única (ex: https://froid360-hash-luizeduardompf-gmailcoms-projects.vercel.app/) para imutabilidade (snapshots independentes).[1][2]
  - Antigas URLs permanecem ativas (código frozen no momento do build).
  - **URL Persistente (Alias)**: https://froid360-app.vercel.app/ (sempre aponta para latest successful production deploy). Configurado em Settings > Domains > Add alias.
  - Preview URLs: Para branches/PRs (ex: froid360-feat-navbar-xxx.vercel.app); temporárias.
  - Custom Domain: Adicione www.froid360.com (A record: 76.76.21.21; CNAME: cname.vercel-dns.com) para URL própria (SSL auto).[3]

- **Build Otimizado**: Detecta Next.js auto (npm ci > next build > start); cache deps (~2-5min primeiro, ~1min posterior). Sem vercel.json necessário (padrões App Router).

### Deploy via CLI (Docker)
Com container up:
```
docker-compose exec app npx vercel login  # Auth (GitHub)
docker-compose exec app npx vercel --prod  # Deploy production (nova URL)
```
- Logs: Monitore build (Washington iad1, 2 cores/8GB); success: "✓ Compiled successfully".
- Envs: Adicione no dashboard (Settings > Environment Variables): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_TELEMETRY_DISABLED=1. 

### Deploy via Git (Recomendado)
1. Push: `git add . && git commit -m "feat: ..." && git push origin main`.
2. Dashboard > Deployments: Auto-trigger; clique latest > Promote to Production.
3. Teste: Acesse alias (https://froid360-app.vercel.app/) – sempre latest (ex: "Get started by editing - LUIZ" após push page.tsx).

- **Rollback**: Deployments > Deploy anterior > Redeploy.
- **Custos**: Free tier (100GB bandwidth/mês, 100 deploys/dia); Pro (~20€/mês) para teams/custom.

### Vercel Speed Insights e Monitoring
- **O Que É**: Coleta métricas reais de usuários (Core Web Vitals: LCP <2.5s, FCP <1.8s, CLS <0.1; TTFB, FID). Dashboard: vercel.com/dashboard/froid360-app > Speed Insights.[4]
- **Ativação**:
  1. Dashboard > Speed Insights > Enable (adiciona rotas internas /_vercel/speed-insights/*).
  2. Instale: `docker-compose exec app npm install @vercel/speed-insights`.
  3. Crie src/components/insights/speed-insights.tsx:
     ```tsx
     'use client';
     import { SpeedInsights } from '@vercel/speed-insights/next';

     export function SpeedInsightsComponent() {
       return <SpeedInsights />;
     }
     ```
  4. Em layout.tsx: Importe e adicione `<SpeedInsightsComponent />` no fim do `<body>` (dentro ThemeProvider).
  5. Commit/push: Deploy auto; visite alias 5-10x (refresh/scroll) – dados fluem em ~5min.

- **Dev vs Prod**: Não rastreia localhost (dev mode no-op); force com .env.local `SPEED_INSIGHTS_DEV=true` e condicional no componente (não recomendado – use Lighthouse local).[5][4]
- **Outros Tools**: Web Analytics (traffic real-time); Runtime Logs (errors); Speed Insights otimiza shadcn (lazy-load components).[6][4]

## Estrutura do Projeto

```
froid360-app/
├── src/
│   ├── app/                 # App Router
│   │   ├── globals.css      # Tailwind + shadcn
│   │   ├── layout.tsx       # Root layout (metadata, ThemeProvider, SpeedInsights)
│   │   └── page.tsx         # Home page (custom " - LUIZ", shadcn Card/Button)
│   ├── components/
│   │   ├── ui/              # shadcn primitives (button.tsx, card.tsx, etc.)
│   │   ├── providers/       # ThemeProvider wrapper
│   │   └── insights/        # SpeedInsightsComponent
│   └── lib/
│       ├── utils.ts         # cn() helper
│       └── supabase.ts      # createBrowserClient (@supabase/ssr)
├── components.json          # shadcn config (slate theme)
├── docker-compose.yml       # Docker setup (app service, Node 20 Alpine)
├── package.json             # Deps: next@15.5.4, shadcn/ui, @supabase/ssr, next-themes, @vercel/speed-insights
├── tailwind.config.js       # Tailwind + shadcn
├── tsconfig.json            # TS strict (App Router)
├── .env.local               # Envs locais (gitignore)
├── .gitignore               # node_modules, .next, .env*
└── README.md                # Este arquivo
```

## Comandos npm (via Docker)
```
docker-compose exec app npm run dev     # Dev server (localhost:3000)
docker-compose exec app npm run build   # Production build
docker-compose exec app npm run start   # Prod server (porta 3000)
docker-compose exec app npm run lint    # ESLint/TS check
docker-compose exec app npx shadcn@latest add button  # Adicione shadcn component
```

## Troubleshooting

- **Build Fail Vercel**: TS errors (ex: imports)? Verifique package.json deps; redeploy sem cache (Deployments > Advanced).
- **Hydration Mismatch**: Em layout.tsx, use suppressHydrationWarning; evite client state no server.
- **Docker Hot-Reload**: Volumes montam src/; se lento, use `docker-compose up` (não -d).
- **Supabase Errors**: Envs no .env.local/Vercel; use anon key para client-side.
- **Speed Insights Vazio**: Visite alias múltiplas vezes; enable no dashboard; não dev mode.
- **Múltiplas URLs**: Normal; use alias para latest. Para single domain: Custom DNS.

## Próximos Passos

1. **Supabase Integration**: Adicione auth (signInWithOAuth em page.tsx); queries realtime (channels). Instale `@supabase/auth-helpers-nextjs`. 
2. **Navbar shadcn**: Use NavigationMenu em layout.tsx (links /, /dashboard).
3. **Dashboard Page**: Crie src/app/dashboard/page.tsx (charts via Recharts; Supabase data).
4. **Payments**: Integre EasyPay/Stripe (server actions em API routes).
5. **Testing**: Adicione Vitest/Playwright; CI via GitHub Actions.
6. **Otimização**: Analise bundle (.next/analyze); ISR para static pages.

## Contribuição

- Fork/clone; crie branch (ex: feat/navbar); PR para main.
- Commits: Mensagens descritivas (ex: "feat: Add Supabase auth").
- Issues: Report bugs/features aqui.

## Licença

MIT License. © 2025 Luiz Eduardo MPF. (Adapte para seu uso; não proprietário).

***