# Froid360 App 🚀

Froid360 App é um projeto full-stack baseado em Next.js 15 com App Router e TypeScript, projetado para desenvolvimento isolado via Docker no Mac M4 (Apple Silicon). Ele integra Supabase para banco de dados cloud (PostgreSQL, autenticação SSR, realtime opcional), TailwindCSS e shadcn/ui para UI acessível/responsiva, com estrutura organizada em `src/` (`app/`, `components/`, `lib/`, `types/`, `styles/`) e configurações para ESLint, Prettier, acessibilidade ARIA e segurança via env vars/headers. O setup minimiza instalações locais (apenas Docker Desktop + Git), rodando Node.js 20, npm e Next.js em containers ARM64 nativos, com hot-reload e Turbopack para dev rápido. Suporte a autenticação SSR com middleware para sessões seguras, otimizado para Next.js 15 (cookies assíncronos) e deploy serverless (Vercel) ou containerizado (Docker).

## ✨ Features

- **Next.js 15 App Router + Turbopack**: Rotas dinâmicas, server components com TypeScript para type-safety; dev server inicia em ~1s sem erros (symlinks resolvidos via bin direto). Builds otimizados para production (standalone output).
- **UI Acessível**: TailwindCSS + shadcn/ui com componentes como Button, Card, Drawer, NavigationMenu para navbar/sidebar responsivos (ARIA-compliant, mobile-first).
- **Banco de Dados & Auth SSR**: Supabase (PostgreSQL cloud) com `@supabase/ssr` para clients server-side (async cookies), autenticação (email/password, OAuth), realtime subscriptions (opcional, com warnings Edge resolvidos). Middleware para refresh de sessões e proteção de rotas.
- **Containerização**: Dockerfile multi-estágio (dev/prod) com `node:20-alpine`; `docker-compose.yml` gerencia hot-reload (volumes nomeados "froid_froid360-volume") e ports 3000. Compatível com ARM64.
- **Ferramentas Dev**: ESLint/Prettier para code quality, Turbopack para rebuilds rápidos, standalone output para deploy Docker/Vercel.
- **Segurança & Perf**: Headers (X-Frame-Options: DENY), env vars para Supabase keys (anon_key client-side, service_role server-side se necessário), telemetria desabilitada. Middleware SSR previne vazamentos de auth.
- **Estrutura Limpa**: `src/app/` (layouts/pages com RSC e queries async), `src/components/ui/` (shadcn), `src/lib/` (utils/supabase.ts com clients async), `src/types/` (interfaces TS como UserTest), `src/styles/` (globals.css com Tailwind). Middleware em `src/middleware.ts` para auth.

O projeto suporta deploy serverless (Vercel) ou containerizado (Docker), com foco em e-commerce/backend integrations futuras (ex: payments via Supabase Edge Functions ou Stripe).

## 📋 Prerequisites

- **Docker Desktop**: Para containers ARM64 nativos no Mac M4 (baixe em docker.com).
- **Git**: Para clonagem/versionamento (instale via Homebrew: `brew install git`).
- **Supabase Account**: Gratuita em supabase.com (crie projeto para obter URL/anon_key em Settings > API). Crie tabela de teste (ex: `users_test` com colunas `id` serial, `name` text, `email` text, `created_at` timestamptz default now()).
- **Editor Opcional**: VSCode para editar `src/` (hot-reload via host). Não precisa de Node.js local – tudo roda em container.
- **Vercel CLI** (para deploy): Instale no container se necessário (veja seção Deployment).

## 🚀 Setup Instructions

1. Clone o repositório:

git clone https://github.com/luizeduardompf/froid360-app.git

cd froid360-app


2. Configure `.env.local` (obrigatório para Supabase envs):

touch .env.local # Ou cp .env.example .env.local se existir

Edite com valores Supabase:  

NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_TELEMETRY_DISABLED=1

Não commite keys (`.gitignore` ignora `.env.local`). Para server-side admin: adicione `SUPABASE_SERVICE_ROLE_KEY` se usar Edge Functions.


3. Instale shadcn/ui e Supabase (após primeiro up): Veja "Running Development".

## 🏃‍♂️ Running Development

Limpe volumes antigos para reset (remove `.next/node_modules` persistidos):  

docker-compose down -v

Construa e inicie dev server:  

docker-compose up --build

- Target "dev" no Dockerfile: `npm ci` (deps Next.js/Tailwind; ~1min primeira vez, cache layers).  
- Inicia `node ./node_modules/next/dist/bin/next dev --turbopack` (sem symlinks errors; Turbopack para ~1s reloads).  
- Acesse http://localhost:3000 (página inicial App Router com query Supabase SSR).  
- Hot-reload: Edite `src/app/page.tsx` (ex: adicione Tailwind classes); atualiza em segundos via volume `./src:/app/src`.

Instale/inicie shadcn/ui:

docker-compose exec app npx shadcn@latest init # Selecione: src/, TypeScript, Tailwind, slate

docker-compose exec app npx shadcn@latest add button card drawer navigation-menu # UI components

Atualize `src/app/layout.tsx`: Importe/use para navbar/Card. Reinicie: `docker-compose restart`.

Integre Supabase:  

docker-compose exec app npm install @supabase/ssr@latest # Remove auth-helpers depreciados se presente

- `src/lib/supabase.ts` já configura clients async (browser/server com cookies Next.js 15).  
- Teste queries em `src/app/page.tsx`: `{ data } = await supabase.from('users_test').select('*')`. Crie tabelas no Supabase dashboard.  
- Auth SSR: Middleware em `src/middleware.ts` gerencia sessões; teste redirecionamentos em rotas protegidas (ex: /dashboard).

Lint/format:  

docker-compose exec app npm run lint -- --fix

docker-compose exec app npx prettier --write .

(Instale: `docker-compose exec app npm i -D prettier`).

Pare: Ctrl+C ou `docker-compose down`. Logs: `docker-compose logs app`.

## 🔧 Running Production

Ajuste `docker-compose.yml`: Mude `target: dev` para `target: runner`, remova volumes hot-reload (mantenha `env_file`), adicione `command: npm start`. Confirme `output: 'standalone'` em `next.config.ts`.

Limpe/rebuild:  

docker-compose down -v && docker-compose up --build

- Estágio runner: Build otimizado (`node server.js`, sem dev tools).  
- Acesse http://localhost:3000 (estático, sem hot-reload).

## 🚀 Deployment to Vercel

1. Instale CLI no container:  

docker-compose exec app npm install -g vercel


2. Na raiz (container ou local com Git):  

vercel login # GitHub ou email

vercel --prod # Builds automáticos

- Configure env vars Supabase no Vercel dashboard (Settings > Environment Variables): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
- Crie `vercel.json` (raiz) se necessário:  
  ```
  {
    "builds": [{ "src": "package.json", "use": "@vercel/nextjs" }],
    "routes": [{ "src": "/(.*)", "dest": "/" }]
  }
  ```  
Suporte nativo a App Router/Turbopack/Supabase SSR. Commit/push para triggers automáticos.

3. Pós-Deploy: Monitore Runtime Logs/Observability no Vercel dashboard. Warnings Edge (ex: realtime-js Node APIs) são comuns; ignore se não usar realtime – configure polyfills se necessário.

## 📁 Project Structure

- **src/**: Código principal (App Router).  
- `app/`: Layouts/pages (layout.tsx com shadcn, page.tsx com Supabase queries async e Card test).  
- `components/ui/`: Shadcn (button.tsx, card.tsx, drawer.tsx, navigation-menu.tsx).  
- `lib/`: Utils (supabase.ts com clients async, utils.ts com cn).  
- `types/`: Interfaces TS (ex: UserTest.ts).  
- `styles/`: globals.css (Tailwind imports).  
- **public/**: Assets estáticos (imagens, favicon, logos Vercel/Next.js).  
- **Raiz**: package.json (Next.js 15, @supabase/ssr, deps), next.config.ts (standalone/headers), tsconfig.json (TS strict), tailwind.config.ts (shadcn themes), middleware.ts (auth SSR).  
- **Docker**: Dockerfile (multi-estágio), docker-compose.yml (volumes/ports), .dockerignore (exclui node_modules).

## 🔍 Troubleshooting

- **Next.js 15 Errors (Cookies Async)**: Use `await cookies()` em server clients; veja `src/lib/supabase.ts`. Builds falham em type errors? Verifique tsconfig strict e rode `npm run lint -- --fix`.  
- **Symlinks/Next.js Errors**: Resolvido com `node ./node_modules/next/dist/bin/next` no script dev (Alpine compatível). Se persistir, mude base para `node:20-slim`.  
- **Hot-Reload Falha**: Verifique volume `./src:/app/src`; edite `src/app/page.tsx` e acesse localhost:3000.  
- **Supabase Env Errors**: Confirme `.env.local` keys; use anon_key para client-side. Reinicie container. Para auth SSR: Teste middleware com login; ignore Edge warnings se não usar realtime.  
- **Build Lento/Vercel**: Prune cache: `docker builder prune -f`. Use `node:20-alpine` para leveza ARM64. Em Vercel, otimize deps com tree-shaking.  
- **Mac M4 Issues**: Imagens ARM64 nativas; evite emulação (sem Rosetta). Middleware Edge: Compatível, mas teste sessões em prod.  
- **TypeScript Strict**: Erros em middleware cookies? Use `delete(name)` sem options em remove.

## 🤝 Contributing

Fork o repo, crie branch (ex: `feature/ui`), edite `src/` ou Docker, PR com testes (lint/build/up). Use issues para bugs/features. Contribuições bem-vindas para integrations (ex: payments, auth flows, realtime).

## 📄 License

MIT License – veja LICENSE para detalhes. Contato: luizeduardompf (GitHub/email).

## 📚 References

- [Next.js Docs](https://nextjs.org/docs)  
- [Docker + Next.js Guide](https://nextjs.org/docs/app/building-your-application/deploying#docker-image)  
- [Supabase + Next.js SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)  
- [Shadcn/UI](https://ui.shadcn.com/docs)  
- [Vercel Deployment](https://vercel.com/docs)  
- [GitHub Repo Management](https://docs.github.com/en/repositories)

