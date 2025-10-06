# Froid360 App

Froid360 App é um projeto full-stack baseado em Next.js 15 com App Router e TypeScript, projetado para desenvolvimento isolado via Docker no Mac M4 (Apple Silicon). [web:16][web:20] Ele integra Supabase para banco de dados cloud, TailwindCSS e shadcn/ui para UI acessível, com estrutura organizada em src/ (app/, components/, lib/, types/, styles/) e configurações para ESLint, Prettier, acessibilidade ARIA e segurança via env vars e headers. [web:16][web:34][web:43]

## Features

- **Next.js 15 App Router**: Rotas dinâmicas e server components com TypeScript para type-safety. [web:16][web:43]
- **UI Acessível**: TailwindCSS + shadcn/ui com componentes como Drawer e NavigationMenu para navbar/sidebar responsivos. [web:16][web:34]
- **Banco de Dados**: Supabase (PostgreSQL cloud) com cliente JS para queries, autenticação e realtime. [web:16][web:43]
- **Containerização**: Dockerfile multi-estágio para dev/prod, docker-compose.yml com hot-reload e volumes nomeados ("froid360-volume"). [web:20][web:21][web:26]
- **Ferramentas**: ESLint/Prettier para code quality, Turbopack para dev rápido, standalone output para deploy Docker. [web:16][web:21][web:43]
- **Segurança**: Headers (X-Frame-Options: DENY), env vars para Supabase keys, preparação para Vercel. [web:16][web:26]
- **Estrutura Limpa**: src/app/ (layouts/pages), src/components/ui/ (shadcn), src/lib/ (utils/supabase.ts), src/types/ (interfaces), src/styles/ (globals.css). [web:16][web:34][web:72]

O projeto minimiza instalações locais (apenas Docker Desktop + Git), rodando Node.js 20, npm e Next.js em containers ARM64 nativos. [web:20][web:22][web:28]

## Prerequisites

- **Docker Desktop**: Instale para rodar containers (suporte nativo ARM64 no Mac M4). [web:20][web:22][web:25] Baixe em docker.com.
- **Git**: Para clonagem e versionamento. [web:25] Instale via Homebrew: `brew install git`.
- **Supabase Account**: Crie gratuita em supabase.com para obter URL e anon_key (Settings > API). [web:16][web:43] Não precisa de Node.js local.
- **Editor**: VSCode ou similar para editar src/ (opcional; use via host). [web:25]

## Setup Instructions

1. Clone o repositório:  
git clone https://github.com/luizeduardompf/froid360-app.git
cd froid360-app

[web:25][web:27]

2. Configure .env.local: Copie o exemplo e preencha Supabase vars:  
cp .env.example .env.local # Se .env.example existir; senão touch .env.local
Edite: Adicione `NEXT_PUBLIC_SUPABASE_URL=seu-url` e `NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave`. [web:16][web:43] Não commite valores reais (.gitignore ignora). [web:20][web:45]

3. Instale shadcn/ui (se não no package.json): Siga "Running Development" abaixo. [web:16][web:34]

## Running Development

Limpe volumes antigos para reset (remove node_modules vazio e .next persistidos):  
docker-compose down -v
[web:20][web:32]

Construa e inicie o dev server:  
docker-compose up --build
- Usa target "dev" no Dockerfile para npm ci (instala Next.js, Tailwind, etc.; ~1min primeira vez, cacheia layers). [web:16][web:20][web:21]
- Inicia `next dev --turbopack` sem erros ("sh: next: not found" resolvido). [web:16][web:21][web:43]
- Acesse http://localhost:3000 (página inicial Next.js). [web:16][web:43]
- Edite src/app/page.tsx no host; hot-reload atualiza em segundos via volume ./src:/app/src. [web:16][web:21][web:42]

Instale Supabase client se necessário:  
docker-compose exec app npm install @supabase/supabase-js
Crie src/lib/supabase.ts para cliente: veja exemplos em docs.supabase.com. [web:16][web:34][web:43]

Para shadcn/ui:  
docker-compose exec app npx shadcn@latest init # Escolha src/ para path, TypeScript, Tailwind
docker-compose exec app npx shadcn@latest add button drawer navigation-menu # Componentes para UI

Atualize src/app/layout.tsx: importe e use <NavigationMenu /> para navbar, <Drawer /> para sidebar (ARIA para acessibilidade). [web:16][web:34][web:72] Reinicie: `docker-compose restart`. [web:21][web:24]

Rode lint/format:  
docker-compose exec app npm run lint -- --fix # ESLint
docker-compose exec app npx prettier --write . # Prettier (instale se ausente: npm i -D prettier)

[web:16][web:43]

Pare: Ctrl+C ou `docker-compose down`. [web:24][web:32] Logs: `docker-compose logs app`. [web:22][web:33]

## Running Production

Ajuste docker-compose.yml temporariamente: mude `target: dev` para `target: runner`, remova volumes de hot-reload (mantenha env_file), adicione `command: npm start`. [web:16][web:21][web:31] Confirme output: 'standalone' em next.config.ts. [web:16][web:26]

Construa e rode:  
docker-compose down -v
docker-compose up --build
- Usa estágio runner para servidor otimizado (node server.js; sem dev tools). [web:20][web:26][web:31]
- Acessível em http://localhost:3000 (build estático, sem hot-reload). [web:16][web:31]

## Deployment to Vercel

1. Instale Vercel CLI no container: `docker-compose exec app npm install -g vercel`. [web:16]

2. Na raiz: `vercel login` (autentique com GitHub), então `vercel --prod`. [web:16] Conecta ao repo para builds automáticos.

3. Configure env vars no dashboard Vercel (Supabase URL/key). [web:16][web:43]

4. vercel.json (crie se ausente):  
{
"builds": [{ "src": "package.json", "use": "@vercel/nextjs" }],
"routes": [{ "src": "/(.*)", "dest": "/" }]
}
Suporte nativo a App Router, Turbopack e Supabase. [web:16][web:43] Push mudanças: `git add vercel.json && git commit -m "Add Vercel config" && git push`. [web:16][web:25]

## Project Structure

- **src/**: Código principal (App Router).  
- app/: Layouts, pages (layout.tsx, page.tsx). [web:16]  
- components/ui/: Shadcn componentes (button.tsx, drawer.tsx). [web:16][web:34]  
- lib/: Utils (supabase.ts para cliente). [web:16][web:34]  
- types/: Interfaces TypeScript (ex: User.ts). [web:16]  
- styles/: CSS global (globals.css com Tailwind). [web:16]  

- **public/**: Assets estáticos (imagens, favicon). [web:16]  

- **Raiz**: package.json (Next.js 15, deps), next.config.ts (standalone, headers), tsconfig.json (TypeScript), tailwind.config.ts. [web:16][web:26][web:43]  

- **Docker**: Dockerfile (multi-estágio dev/prod), docker-compose.yml (volumes, ports 3000), .dockerignore (exclui node_modules). [web:20][web:21][web:26]  

## Troubleshooting

- **"next: not found"**: Limpe volumes (`docker-compose down -v`), rebuild (`up --build`); confirme target "dev" e npm ci no Dockerfile. [web:20][web:21][web:81]  
- **Sem hot-reload**: Verifique volume ./src:/app/src; edite em src/app/page.tsx. [web:21][web:42]  
- **Supabase Erros**: Verifique .env.local keys; use anon_key para client-side. [web:16][web:43]  
- **Build Lento**: Cache Docker: `docker builder prune -f` para limpar, ou use node:20-alpine para leveza. [web:20][web:22][web:28]  
- **Mac M4 Issues**: Use imagens ARM64 (node:20-alpine nativo); evite emulação. [web:20][web:22][web:28]  

Para contribuições: Fork, crie branch, PR com mudanças em src/ ou Docker. [web:25] Contato: luizeduardompf (GitHub). [web:25] Licença: MIT (adicione LICENSE se desejar). [web:25]

## References

- Next.js Docs: nextjs.org [web:16]  
- Docker Next.js: blog.jonrshar.pe/2024/Dec/24/nextjs-prisma-docker.html [web:20]  
- Supabase Next.js: supabase.com/docs/guides/getting-started [web:16][web:43]  
- Shadcn/UI: ui.shadcn.com [web:16][web:34]  
- GitHub Setup: docs.github.com/en/repositories [web:25]  


