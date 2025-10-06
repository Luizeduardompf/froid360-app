# Froid360 App 🚀

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-blue?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-20-alpine-blue?style=flat&logo=docker)](https://www.docker.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-purple?style=flat&logo=supabase)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue?style=flat&logo=tailwind)](https://tailwindcss.com)

Froid360 App é um projeto full-stack baseado em Next.js 15 com App Router e TypeScript, projetado para desenvolvimento isolado via Docker no Mac M4 (Apple Silicon). Ele integra Supabase para banco de dados cloud (PostgreSQL, autenticação, realtime), TailwindCSS e shadcn/ui para UI acessível/responsiva, com estrutura organizada em src/ (app/, components/, lib/, types/, styles/) e configurações para ESLint, Prettier, acessibilidade ARIA e segurança via env vars/headers. O setup minimiza instalações locais (apenas Docker Desktop + Git), rodando Node.js 20, npm e Next.js em containers ARM64 nativos, com hot-reload e Turbopack para dev rápido.

## ✨ Features

- **Next.js 15 App Router + Turbopack**: Rotas dinâmicas, server components com TypeScript para type-safety; dev server inicia em ~1s sem erros (symlinks resolvidos via bin direto).
- **UI Acessível**: TailwindCSS + shadcn/ui com componentes como Button, Drawer, NavigationMenu para navbar/sidebar responsivos (ARIA-compliant, mobile-first).
- **Banco de Dados & Auth**: Supabase (PostgreSQL cloud) com cliente JS para queries client-side, autenticação (email/password, OAuth) e realtime subscriptions.
- **Containerização**: Dockerfile multi-estágio (dev/prod) com node:20-alpine; docker-compose.yml gerencia hot-reload (volumes nomeados "froid_froid360-volume") e ports 3000.
- **Ferramentas Dev**: ESLint/Prettier para code quality, Turbopack para rebuilds rápidos, standalone output para deploy Docker/Vercel.
- **Segurança & Perf**: Headers (X-Frame-Options: DENY), env vars para Supabase keys (anon_key client-side), telemetria desabilitada.
- **Estrutura Limpa**: src/app/ (layouts/pages com RSC), src/components/ui/ (shadcn), src/lib/ (utils/supabase.ts), src/types/ (interfaces TS), src/styles/ (globals.css com Tailwind).

O projeto suporta deploy serverless (Vercel) ou containerizado (Docker), com foco em e-commerce/backend integrations futuras (ex: payments via Supabase).

## 📋 Prerequisites

- **Docker Desktop**: Para containers ARM64 nativos no Mac M4 (baixe em docker.com).
- **Git**: Para clonagem/versionamento (instale via Homebrew: `brew install git`).
- **Supabase Account**: Gratuita em supabase.com (crie projeto para obter URL/anon_key em Settings > API).
- **Editor Opcional**: VSCode para editar src/ (hot-reload via host).
Não precisa de Node.js local – tudo roda em container.

## 🚀 Setup Instructions

1. Clone o repositório:  
git clone https://github.com/luizeduardompf/froid360-app.git
cd froid360-app

2. Configure .env.local (obrigatório para Supabase envs):  
touch .env.local # Ou cp .env.example .env.local se existir

Edite com valores Supabase:  
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_TELEMETRY_DISABLED=1

Não commite keys (.gitignore ignora .env.local).

3. Instale shadcn/ui e Supabase (após primeiro up): Veja "Running Development".

## 🏃‍♂️ Running Development

Limpe volumes antigos para reset (remove .next/node_modules persistidos):  
docker-compose down -v

Construa e inicie dev server:  
docker-compose up --build

- Target "dev" no Dockerfile: npm ci (deps Next.js/Tailwind; ~1min primeira vez, cache layers).
- Inicia `node ./node_modules/next/dist/bin/next dev --turbopack` (sem symlinks errors; Turbopack para ~1s reloads).
- Acesse http://localhost:3000 (página inicial App Router).
- Hot-reload: Edite src/app/page.tsx (ex: adicione Tailwind classes); atualiza em segundos via volume ./src:/app/src.

Instale/inicie shadcn/ui:  
docker-compose exec app npx shadcn@latest init # Selecione: src/, TypeScript, Tailwind, slate
docker-compose exec app npx shadcn@latest add button drawer navigation-menu # UI components

Atualize src/app/layout.tsx: Importe/use <NavigationMenu> para navbar, <Drawer> para sidebar (ARIA). Reinicie: `docker-compose restart`.

Integre Supabase:  
docker-compose exec app npm install @supabase/supabase-js

Crie src/lib/supabase.ts (createBrowserClient com envs). Teste queries em page.tsx: `const { data } = await supabase.from('table').select('*');`. Crie tabelas no Supabase dashboard.

Lint/format:  
docker-compose exec app npm run lint -- --fix
docker-compose exec app npx prettier --write . # Instale: npm i -D prettier

Pare: Ctrl+C ou `docker-compose down`. Logs: `docker-compose logs app`.

## 🔧 Running Production

Ajuste docker-compose.yml: Mude `target: dev` para `target: runner`, remova volumes hot-reload (mantenha env_file), adicione `command: npm start`. Confirme `output: 'standalone'` em next.config.ts.

Limpe/rebuild:  
docker-compose down -v && docker-compose up --build

- Estágio runner: Build otimizado (node server.js, sem dev tools).
- Acesse http://localhost:3000 (estático, sem hot-reload).

## 🚀 Deployment to Vercel

1. Instale CLI: `docker-compose exec app npm install -g vercel`.

2. Na raiz: `vercel login` (GitHub), `vercel --prod` (builds automáticos).

3. Configure envs Supabase no Vercel dashboard.

4. Crie vercel.json (raiz):  
{
"builds": [{ "src": "package.json", "use": "@vercel/nextjs" }],
"routes": [{ "src": "/(.*)", "dest": "/" }]
}
Suporte nativo a App Router/Turbopack/Supabase. Commit/push.

## 📁 Project Structure

- **src/**: Código principal (App Router).  
- `app/`: Layouts/pages (layout.tsx com shadcn, page.tsx com Supabase queries).  
- `components/ui/`: Shadcn (button.tsx, drawer.tsx, navigation-menu.tsx).  
- `lib/`: Utils (supabase.ts, utils.ts com cn).  
- `types/`: Interfaces TS (ex: User.ts).  
- `styles/`: globals.css (Tailwind imports).  

- **public/**: Assets estáticos (imagens, favicon, logos Vercel/Next.js).  

- **Raiz**: package.json (Next.js 15, deps), next.config.ts (standalone/headers), tsconfig.json (TS strict), tailwind.config.ts (shadcn themes).  

- **Docker**: Dockerfile (multi-estágio), docker-compose.yml (volumes/ports), .dockerignore (exclui node_modules).  

## 🔍 Troubleshooting

- **Symlinks/Next.js Errors**: Resolvido com `node ./node_modules/next/dist/bin/next` no script dev (Alpine compatível). Se persistir, mude base para node:20-slim.  
- **Hot-Reload Falha**: Verifique volume ./src:/app/src; edite src/app/page.tsx e acesse localhost:3000.  
- **Supabase Env Errors**: Confirme .env.local keys; use anon_key para client-side. Reinicie container.  
- **Build Lento**: Prune cache: `docker builder prune -f`. Use node:20-alpine para leveza ARM64.  
- **Mac M4 Issues**: Imagens ARM64 nativas; evite emulação (sem Rosetta).  

## 🤝 Contributing

Fork o repo, crie branch (ex: feature/ui), edite src/ ou Docker, PR com testes (lint/up). Use issues para bugs/features. Contribuições bem-vindas para integrations (ex: payments, auth flows).

## 📄 License

MIT License – veja LICENSE para detalhes. Contato: luizeduardompf (GitHub/email).

## 📚 References

- [Next.js Docs](https://nextjs.org/docs)  
- [Docker + Next.js Guide](https://blog.jonrshar.pe/2024/Dec/24/nextjs-prisma-docker.html)  
- [Supabase + Next.js](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)  
- [Shadcn/UI](https://ui.shadcn.com/docs)  
- [GitHub Repo Management](https://docs.github.com/en/repositories)  
