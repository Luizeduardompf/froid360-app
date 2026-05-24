# Git Operations

Before ANY git operation, always run:
```bash
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock
```

**NUNCA use GitHub Desktop. Sempre use o Terminal do Mac.**

For commits, always use this sequence — via Terminal:
```bash
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock
git add -A
git commit -m "message"
git push origin HEAD:main
```

If any git command fails with a lock error, run the rm command above and retry immediately. Never ask — just do it.

### Known sandbox restriction
The sandbox bash has network blocked — `git push` fails from sandbox.
To push, use `write_clipboard` with the push command and paste into the Mac Terminal app,
or use computer-use to open Terminal and run the push from there.

Preferred push sequence from Mac Terminal:
```bash
cd ~/Documents/Claude/Projects/Froid.app
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock
git push origin HEAD:main
```

---

# Project Context

## Stack
- Next.js 15.5.4 / React 19 / TypeScript
- Tailwind CSS v4 (CSS-based config, oklch colors — sem `tailwind.config.js`)
- Vercel AI SDK (`ai`, `@ai-sdk/openai`) com modelo `gpt-4o-mini`
- Supabase SSR (`@supabase/ssr`) — instalado mas NÃO obrigatório no V0

## Fase atual: V0 Demo
- Auth é 100% mockada — sem Supabase obrigatório em runtime
- `src/lib/mock-data.ts` é a única fonte de verdade dos dados
- Middleware (`src/middleware.ts`) é no-op passthrough
- `ANTHROPIC_API_KEY` só configurar quando explicitamente solicitado

## Deploy
- Plataforma: Vercel
- Região: `gru1` (São Paulo)
- Branch principal: `feat/phases-v0` → push para `origin HEAD:main`
- `vercel.json` já presente com placeholders de Supabase env vars
- Sem `output: standalone` no next.config.ts (Vercel gerencia output)

## Ambiente
- `node_modules` não existe no FUSE mount do sandbox — Vercel instala durante build
- `rm` em `.git/` pode falhar no sandbox (FUSE restriction) — usar `mv` ou Terminal do Mac
- Contorno para index.lock via sandbox (não faz push):
  ```bash
  GIT_INDEX_FILE=/tmp/fresh.index git read-tree HEAD
  GIT_INDEX_FILE=/tmp/fresh.index git add <arquivo>
  GIT_INDEX_FILE=/tmp/fresh.index git commit -m "..."
  # push ainda precisa do Terminal do Mac
  ```
