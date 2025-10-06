# Estágio base
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Estágio dev (para desenvolvimento)
FROM base AS dev
COPY package*.json ./
RUN npm ci --only=production=false  # Instala todas deps, incluindo devDeps (Next.js, Tailwind, ESLint)
COPY . .
EXPOSE 3000
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["npm", "run", "dev"]

# Estágio de dependências (para build/prod)
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Estágio de build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Estágio de runtime (produção)
FROM base AS runner
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
WORKDIR /app

COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
