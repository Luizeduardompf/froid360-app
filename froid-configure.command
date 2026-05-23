#!/usr/bin/env bash
# =============================================================================
# froid-configure.command — Execute com DUPLO CLIQUE no Finder
# Cria labels e configura ANTHROPIC_API_KEY no GitHub
# =============================================================================
set -uo pipefail

REPO="luizeduardompf/froid360-app"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC}  $*"; }
err()  { echo -e "${RED}✗${NC}  $*"; }
info() { echo -e "${BLUE}▶${NC} $*"; }

clear
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Froid.app — Configurar Labels & Secret ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Verificar gh ───────────────────────────────────────────────────────────
info "Verificando gh CLI..."
if ! command -v gh &>/dev/null; then
  err "'gh' não encontrado. Instale: brew install gh"
  read -rp "  Pressione Enter para fechar..." _
  exit 1
fi
ok "gh encontrado"

# ── 2. gh auth ────────────────────────────────────────────────────────────────
info "Verificando autenticação GitHub..."
if ! gh auth status &>/dev/null; then
  warn "Não autenticado. Iniciando login..."
  gh auth login
fi
GH_USER=$(gh api user --jq .login)
ok "Autenticado como: $GH_USER"

# ── 3. Criar labels ───────────────────────────────────────────────────────────
echo ""
info "Criando labels de automação no repo $REPO..."

create_label() {
  local name="$1" color="$2" desc="$3"
  if gh label list --repo "$REPO" --json name --jq '.[].name' 2>/dev/null | grep -q "^${name}$"; then
    warn "Label '$name' já existe — pulando"
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" \
      && ok "Label criada: $name" \
      || warn "Falha ao criar label '$name'"
  fi
}

create_label "ai-processing" "0075ca" "Issue sendo processada pelo agente AI"
create_label "ai-done"       "0e8a16" "Implementação concluída pelo agente AI"
create_label "ai-blocked"    "e4e669" "Agente AI bloqueado — requer intervenção humana"
create_label "needs-review"  "d93f0b" "Aguardando revisão humana"

# ── 4. ANTHROPIC_API_KEY ──────────────────────────────────────────────────────
echo ""
info "Configurando secret ANTHROPIC_API_KEY..."

if gh secret list --repo "$REPO" 2>/dev/null | grep -q "ANTHROPIC_API_KEY"; then
  ok "Secret ANTHROPIC_API_KEY já configurada"
else
  echo ""
  echo "  Cole sua ANTHROPIC_API_KEY abaixo."
  echo "  (a chave fica oculta durante a digitação)"
  echo ""
  gh secret set ANTHROPIC_API_KEY --repo "$REPO" \
    && ok "Secret ANTHROPIC_API_KEY configurada" \
    || warn "Falha. Configure manualmente em: https://github.com/$REPO/settings/secrets/actions"
fi

# ── 5. Resumo ─────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅  Configuração concluída!            ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Repo   : https://github.com/$REPO"
echo "  Labels : https://github.com/$REPO/labels"
echo "  Actions: https://github.com/$REPO/actions"
echo ""
echo "  PR de automação:"
echo "  https://github.com/$REPO/compare/feat/ai-automation-setup"
echo ""
read -rp "  Pressione Enter para fechar..." _
