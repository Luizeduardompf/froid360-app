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