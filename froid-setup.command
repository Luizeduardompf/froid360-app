#!/usr/bin/env bash
# =============================================================================
# froid-setup.command — Execute com DUPLO CLIQUE no Finder
# Faz push, cria labels e configura ANTHROPIC_API_KEY no GitHub
# =============================================================================
set -euo pipefail

REPO="luizeduardompf/froid360-app"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC}  $*"; }
err()  { echo -e "${RED}✗${NC}  $*"; }
info() { echo -e "${BLUE}▶${NC} $*"; }

clear
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Froid.app — Setup Automação AI         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

cd "$DIR"

# ── 1. Verificar pré-requisitos ───────────────────────────────────────────────
info "Verificando pré-requisitos..."

for cmd in git gh; do
  if ! command -v "$cmd" &>/dev/null; then
    err "'$cmd' não encontrado."
    [[ "$cmd" == "gh" ]] && echo "   Instale: brew install gh"
    exit 1
  fi
done
ok "git e gh encontrados"

# ── 2. gh auth ────────────────────────────────────────────────────────────────
info "Verificando autenticação GitHub..."
if ! gh auth status &>/dev/null; then
  warn "Não autenticado. Iniciando login..."
  gh auth login
fi
GH_USER=$(gh api user --jq .login)
ok "Autenticado como: $GH_USER"

# ── 3. Verificar que o repo existe ────────────────────────────────────────────
info "Verificando repositório $REPO..."
if ! gh repo view "$REPO" &>/dev/null; then
  err "Repositório '$REPO' não encontrado ou sem acesso."
  echo "   Verifique se o repo existe em: https://github.com/$REPO"
  exit 1
fi
ok "Repositório encontrado"

# ── 4. git push ───────────────────────────────────────────────────────────────
info "Fazendo push para origin/main..."
git push -u origin main && ok "Push concluído" || {
  err "Push falhou. Verifique as credenciais do GitHub."
  echo "   Dica: gh auth refresh --scopes repo"
  exit 1
}

# ── 5. Criar labels ───────────────────────────────────────────────────────────
echo ""
info "Criando labels de automação..."

create_label() {
  local name="$1" color="$2" desc="$3"
  if gh label list --repo "$REPO" --json name --jq '.[].name' 2>/dev/null | grep -q "^${name}$"; then
    warn "Label '$name' já existe — pulando"
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" \
      && ok "Label criada: $name"
  fi
}

create_label "ai-processing" "0075ca" "Issue sendo processada pelo agente AI"
create_label "ai-done"       "0e8a16" "Implementação concluída pelo agente AI"
create_label "ai-blocked"    "e4e669" "Agente AI bloqueado — requer intervenção humana"
create_label "needs-review"  "d93f0b" "Aguardando revisão humana"

# ── 6. ANTHROPIC_API_KEY ──────────────────────────────────────────────────────
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
    || warn "Falha ao configurar secret. Configure manualmente em:"
       echo "  https://github.com/$REPO/settings/secrets/actions"
fi

# ── 7. Verificar Actions ──────────────────────────────────────────────────────
echo ""
info "Verificando workflows..."
gh workflow list --repo "$REPO" 2>/dev/null && echo "" || warn "Workflows ainda não indexados — normal no primeiro push."

# ── 8. Resumo ─────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅  Setup concluído!                   ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Repo : https://github.com/$REPO"
echo "  Code : https://github.com/$REPO/actions"
echo ""
echo "  Próximo passo:"
echo "  Abra uma issue em https://github.com/$REPO/issues/new"
echo "  e o agente AI processa automaticamente."
echo ""
read -rp "  Pressione Enter para fechar..." _
