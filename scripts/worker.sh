#!/usr/bin/env bash
# =============================================================================
# scripts/worker.sh — Froid.app Local AI Worker
# Uso: ./scripts/worker.sh [--dry-run] [--issue <número>]
#
# Modo de operação:
#   - Busca issues abertas com label 'ai-processing' (ou a próxima pendente)
#   - Seleciona a de menor número (FIFO)
#   - Cria branch local
#   - Executa Claude Code com contexto da issue
#   - Cria PR via gh CLI
# =============================================================================
set -euo pipefail

# ── Config ───────────────────────────────────────────────────────────────────
DRY_RUN=false
SPECIFIC_ISSUE=""
MAIN_BRANCH="${MAIN_BRANCH:-main}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; NC='\033[0m'

log()  { echo -e "${BLUE}[worker]${NC} $*"; }
ok()   { echo -e "${GREEN}[worker]${NC} ✓ $*"; }
warn() { echo -e "${YELLOW}[worker]${NC} ⚠  $*"; }
err()  { echo -e "${RED}[worker]${NC} ✗ $*" >&2; }

# ── Args ─────────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)   DRY_RUN=true; shift ;;
    --issue)     SPECIFIC_ISSUE="$2"; shift 2 ;;
    --branch)    MAIN_BRANCH="$2"; shift 2 ;;
    -h|--help)
      echo "Uso: $0 [--dry-run] [--issue <número>] [--branch <main|develop>]"
      exit 0 ;;
    *) err "Flag desconhecida: $1"; exit 1 ;;
  esac
done

# ── Pré-requisitos ────────────────────────────────────────────────────────────
for cmd in gh git claude; do
  if ! command -v "$cmd" &>/dev/null; then
    err "Comando '$cmd' não encontrado. Verifique instalação."
    [[ "$cmd" == "claude" ]] && echo "   Instale: npm install -g @anthropic-ai/claude-code"
    exit 1
  fi
done

if ! gh auth status &>/dev/null; then
  err "gh não autenticado. Execute: gh auth login"
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null)
if [[ -z "$REPO" ]]; then
  err "Não foi possível detectar repositório. Execute dentro do diretório do projeto."
  exit 1
fi

log "Repositório: $REPO"
[[ "$DRY_RUN" == true ]] && warn "Modo DRY RUN — nenhuma mudança será feita"

# ── Selecionar issue ──────────────────────────────────────────────────────────
log "Buscando issues para processar..."

if [[ -n "$SPECIFIC_ISSUE" ]]; then
  ISSUE_JSON=$(gh issue view "$SPECIFIC_ISSUE" --repo "$REPO" --json number,title,body,labels)
else
  # Busca issues abertas com label ai-processing, ordem crescente
  ISSUE_JSON=$(gh issue list \
    --repo "$REPO" \
    --label "ai-processing" \
    --state open \
    --json number,title,body,labels \
    --jq 'sort_by(.number) | first' 2>/dev/null || echo "")

  # Se não houver ai-processing, pega qualquer aberta sem ai-done/ai-blocked
  if [[ -z "$ISSUE_JSON" || "$ISSUE_JSON" == "null" ]]; then
    warn "Nenhuma issue com 'ai-processing'. Buscando issues abertas pendentes..."
    ISSUE_JSON=$(gh issue list \
      --repo "$REPO" \
      --state open \
      --json number,title,body,labels \
      --jq '[.[] | select(
        ([.labels[].name] | any(. == "ai-done")) == false and
        ([.labels[].name] | any(. == "ai-blocked")) == false
      )] | sort_by(.number) | first' 2>/dev/null || echo "")
  fi
fi

if [[ -z "$ISSUE_JSON" || "$ISSUE_JSON" == "null" ]]; then
  ok "Nenhuma issue pendente. Worker ocioso."
  exit 0
fi

ISSUE_NUM=$(echo "$ISSUE_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['number'])")
ISSUE_TITLE=$(echo "$ISSUE_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['title'])")
ISSUE_BODY=$(echo "$ISSUE_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('body','') or '')")

log "Issue selecionada: #${ISSUE_NUM} — ${ISSUE_TITLE}"

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "  Título : $ISSUE_TITLE"
  echo "  Corpo  : ${ISSUE_BODY:0:200}..."
  echo ""
  ok "Dry run concluído."
  exit 0
fi

# ── Label ai-processing (se não tiver) ────────────────────────────────────────
HAS_LABEL=$(echo "$ISSUE_JSON" | python3 -c "
import sys,json
d=json.load(sys.stdin)
labels=[l['name'] for l in d.get('labels',[])]
print('true' if 'ai-processing' in labels else 'false')
")

if [[ "$HAS_LABEL" == "false" ]]; then
  log "Adicionando label 'ai-processing'..."
  gh issue edit "$ISSUE_NUM" --repo "$REPO" --add-label "ai-processing"
fi

# ── Criar branch ──────────────────────────────────────────────────────────────
SLUG=$(echo "$ISSUE_TITLE" \
  | tr '[:upper:]' '[:lower:]' \
  | sed 's/[^a-z0-9]/-/g' \
  | sed 's/--*/-/g' \
  | sed 's/^-//;s/-$//' \
  | cut -c1-50)
BRANCH="feat/issue-${ISSUE_NUM}-${SLUG}"

log "Criando branch: $BRANCH"
git checkout "$MAIN_BRANCH"
git pull origin "$MAIN_BRANCH" --rebase
git checkout -b "$BRANCH"

# ── Construir prompt ──────────────────────────────────────────────────────────
PROMPT=$(cat <<EOF
Você está implementando a seguinte issue do Froid.app (sistema para Psicólogos):

**Issue #${ISSUE_NUM}: ${ISSUE_TITLE}**

${ISSUE_BODY}

---

**Instruções:**

1. Leia o contexto atual do projeto antes de implementar.
2. Planeje antes de codar.
3. Implemente de forma incremental e segura.
4. Escreva testes quando aplicável.
5. Faça commits semânticos descritivos.
6. Se encontrar bloqueio técnico, crie BLOCKED.md explicando o motivo.
7. NÃO abra PR — o script cuida disso.

**Restrições:**
- Trabalhe apenas no escopo desta issue.
- Prefira soluções simples e testáveis.
- Preserve compatibilidade existente.
EOF
)

# ── Executar Claude Code ──────────────────────────────────────────────────────
log "Executando Claude Code..."
echo "$PROMPT" | claude --print || {
  err "Claude Code falhou."
  git checkout "$MAIN_BRANCH"
  git branch -D "$BRANCH"
  gh issue edit "$ISSUE_NUM" --repo "$REPO" \
    --remove-label "ai-processing" \
    --add-label "ai-blocked"
  gh issue comment "$ISSUE_NUM" --repo "$REPO" \
    --body "⚠️ Worker local falhou ao executar Claude Code. Verifique logs."
  exit 1
}

# ── Verificar mudanças ────────────────────────────────────────────────────────
if git diff --quiet HEAD && git diff --cached --quiet; then
  warn "Nenhuma mudança produzida."
  git checkout "$MAIN_BRANCH"
  git branch -D "$BRANCH"
  gh issue edit "$ISSUE_NUM" --repo "$REPO" \
    --remove-label "ai-processing" \
    --add-label "ai-blocked"
  gh issue comment "$ISSUE_NUM" --repo "$REPO" \
    --body "⚠️ Agente não produziu mudanças. Verifique especificação da issue."
  exit 0
fi

# ── Push ──────────────────────────────────────────────────────────────────────
log "Fazendo push: $BRANCH"
git push origin "$BRANCH"

# ── Verificar BLOCKED.md ──────────────────────────────────────────────────────
if [[ -f "BLOCKED.md" ]]; then
  BLOCKED_REASON=$(cat BLOCKED.md)
  warn "Agente bloqueado."
  gh issue edit "$ISSUE_NUM" --repo "$REPO" \
    --remove-label "ai-processing" \
    --add-label "ai-blocked"
  gh issue comment "$ISSUE_NUM" --repo "$REPO" \
    --body "$(printf '⚠️ **Agente bloqueado.**\n\n**Motivo:**\n%s' "$BLOCKED_REASON")"
  git checkout "$MAIN_BRANCH"
  exit 0
fi

# ── Abrir PR ──────────────────────────────────────────────────────────────────
log "Abrindo Pull Request..."
PR_URL=$(gh pr create \
  --repo "$REPO" \
  --title "feat: #${ISSUE_NUM} ${ISSUE_TITLE}" \
  --head "$BRANCH" \
  --base "$MAIN_BRANCH" \
  --body "$(cat <<PREOF
Closes #${ISSUE_NUM}

## Implementação automática (worker local)

Este PR foi gerado pelo worker local do Froid.app.

### Checklist
- [ ] Revisar código gerado
- [ ] Validar testes
- [ ] Confirmar ausência de regressões

> ⚠️ Sempre revisar PRs automáticos antes do merge.
PREOF
)")

# ── Atualizar issue ───────────────────────────────────────────────────────────
gh issue edit "$ISSUE_NUM" --repo "$REPO" \
  --remove-label "ai-processing" \
  --add-label "needs-review" \
  --add-label "ai-done"

gh issue comment "$ISSUE_NUM" --repo "$REPO" \
  --body "$(printf '✅ **Implementação concluída.**\n\nPR: %s\n\nAguardando revisão humana.' "$PR_URL")"

git checkout "$MAIN_BRANCH"

ok "Worker concluído. PR: $PR_URL"
