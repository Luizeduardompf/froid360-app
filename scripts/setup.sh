#!/usr/bin/env bash
# =============================================================================
# scripts/setup.sh — Froid.app AI Automation Bootstrap
# Roda UMA vez para configurar labels, secrets hint e validar pré-requisitos.
# =============================================================================
set -euo pipefail

REPO="${GITHUB_REPO:-}"   # ex: luizeduardompf/froid.app  (ou detecta via gh)
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC}  $*"; }
err()  { echo -e "${RED}✗${NC}  $*"; }

echo ""
echo "═══════════════════════════════════════"
echo "  Froid.app — Fase 0: Setup Automação"
echo "═══════════════════════════════════════"
echo ""

# ── 1. Pré-requisitos ────────────────────────────────────────────────────────
echo "▶ Verificando pré-requisitos..."

if ! command -v gh &>/dev/null; then
  err "GitHub CLI (gh) não encontrado."
  echo "   Instale: https://cli.github.com/"
  exit 1
fi
ok "gh CLI encontrado: $(gh --version | head -1)"

if ! command -v git &>/dev/null; then
  err "git não encontrado."
  exit 1
fi
ok "git encontrado: $(git --version)"

# ── 2. Auth GitHub ───────────────────────────────────────────────────────────
echo ""
echo "▶ Verificando autenticação GitHub..."

if ! gh auth status &>/dev/null; then
  warn "Não autenticado. Iniciando login..."
  gh auth login
fi
ok "Autenticado como: $(gh api user --jq .login)"

# ── 3. Detectar/confirmar repositório ────────────────────────────────────────
echo ""
echo "▶ Detectando repositório..."

if [[ -z "$REPO" ]]; then
  # Tenta detectar pelo remote origin
  if git remote get-url origin &>/dev/null; then
    REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || true)
  fi
fi

if [[ -z "$REPO" ]]; then
  warn "Repositório não detectado automaticamente."
  echo "   Crie o repositório no GitHub primeiro:"
  echo "   gh repo create froid.app --private"
  echo ""
  read -rp "   Nome do repo (owner/name): " REPO
fi

ok "Repositório: $REPO"

# ── 4. Criar labels ──────────────────────────────────────────────────────────
echo ""
echo "▶ Criando labels de automação..."

declare -A LABELS=(
  ["ai-processing"]="0075ca:Issue sendo processada pelo agente AI"
  ["ai-done"]="0e8a16:Implementação concluída pelo agente AI"
  ["ai-blocked"]="e4e669:Agente AI bloqueado — requer intervenção humana"
  ["needs-review"]="d93f0b:Aguardando revisão humana"
)

for label in "${!LABELS[@]}"; do
  IFS=':' read -r color description <<< "${LABELS[$label]}"
  if gh label list --repo "$REPO" --json name --jq '.[].name' | grep -q "^${label}$"; then
    warn "Label '${label}' já existe — pulando"
  else
    gh label create "$label" \
      --repo "$REPO" \
      --color "$color" \
      --description "$description" && ok "Label criada: $label"
  fi
done

# ── 5. Verificar secret ANTHROPIC_API_KEY ────────────────────────────────────
echo ""
echo "▶ Verificando secrets..."

if gh secret list --repo "$REPO" 2>/dev/null | grep -q "ANTHROPIC_API_KEY"; then
  ok "Secret ANTHROPIC_API_KEY já configurada"
else
  warn "Secret ANTHROPIC_API_KEY não encontrada."
  echo ""
  echo "   Configure no GitHub:"
  echo "   gh secret set ANTHROPIC_API_KEY --repo $REPO"
  echo "   (ou via Settings → Secrets → Actions no GitHub.com)"
  echo ""
  read -rp "   Deseja configurar agora? (s/N): " ans
  if [[ "${ans,,}" == "s" ]]; then
    gh secret set ANTHROPIC_API_KEY --repo "$REPO"
    ok "Secret configurada"
  else
    warn "Configure ANTHROPIC_API_KEY antes de abrir issues para automação."
  fi
fi

# ── 6. Push inicial ──────────────────────────────────────────────────────────
echo ""
echo "▶ Verificando remote..."

if ! git remote get-url origin &>/dev/null; then
  git remote add origin "https://github.com/${REPO}.git"
  ok "Remote 'origin' adicionado"
else
  ok "Remote 'origin' já configurado: $(git remote get-url origin)"
fi

# ── 7. Resumo ────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════"
echo "  Setup concluído!"
echo "═══════════════════════════════════════"
echo ""
echo "  Próximos passos:"
echo "  1. git add . && git commit -m 'feat: fase-0 ai automation setup'"
echo "  2. git push -u origin main"
echo "  3. Abra uma issue com qualquer título → automação dispara"
echo ""
echo "  Workflows ativos após push:"
echo "  • .github/workflows/ai-triage.yml   — roteia novas issues"
echo "  • .github/workflows/ai-agent.yml    — executa Claude Code"
echo ""
