# Froid.app — Sistema de Automação AI

Sistema de desenvolvimento assistido por IA baseado em GitHub Issues para o Froid.app.

---

## Fluxo de automação

```
Issue criada
     │
     ▼
[ai-triage.yml]
  Adiciona label 'ai-processing'
  Comenta na issue
     │
     ▼
[ai-agent.yml] ← dispara quando 'ai-processing' é adicionado
  1. Cria branch (feat/issue-N-titulo)
  2. Executa Claude Code com contexto da issue
  3. Claude implementa, commita
  4. Push do branch
  5. Abre PR linkado à issue
  6. Atualiza labels: ai-processing → needs-review + ai-done
     │
     ▼
  Revisão humana do PR
     │
     ▼
  Merge → issue fechada automaticamente
```

---

## Labels

| Label | Significado |
|---|---|
| `ai-processing` | Issue sendo processada pelo agente |
| `ai-done` | Implementação concluída, aguarda revisão |
| `ai-blocked` | Agente bloqueado — requer intervenção humana |
| `needs-review` | PR aberto, aguardando revisão |

---

## Configuração inicial

### Pré-requisitos

- [GitHub CLI](https://cli.github.com/) (`gh`)
- [Claude Code](https://github.com/anthropics/claude-code) (`claude`) — para worker local
- Repositório criado no GitHub

### Setup

```bash
# 1. Autenticar no GitHub
gh auth login

# 2. Criar repositório (se ainda não criou)
gh repo create froid.app --private

# 3. Executar setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# 4. Configurar secret ANTHROPIC_API_KEY
gh secret set ANTHROPIC_API_KEY --repo SEU_ORG/froid.app

# 5. Push inicial
git add .
git commit -m "feat: fase-0 ai automation setup"
git push -u origin main
```

---

## Modos de operação

### Modo Automático (GitHub Actions)

Após o push, qualquer nova issue dispara o pipeline automaticamente.

```
Você abre a issue → GitHub Actions processa → PR criado
```

**Requisitos:**
- Secret `ANTHROPIC_API_KEY` configurada no repositório
- Actions habilitadas no repositório

### Modo Local (worker script)

Para processar issues manualmente a partir da sua máquina:

```bash
# Processar próxima issue pendente
./scripts/worker.sh

# Processar issue específica
./scripts/worker.sh --issue 42

# Simular sem fazer mudanças
./scripts/worker.sh --dry-run

# Usar branch base diferente
./scripts/worker.sh --branch develop
```

**Requisitos:**
- `gh auth login` feito
- `claude` CLI instalado e configurado
- Estar no diretório raiz do projeto

---

## Estrutura de agentes

Os agentes são definidos por prompts em `agents/`:

| Arquivo | Papel |
|---|---|
| `agents/planner.md` | Analisa issues e produz `PLAN.md` |
| `agents/coder.md` | Implementa o plano com commits semânticos |
| `agents/reviewer.md` | Revisa PRs e produz relatório estruturado |

### Sequência de execução

```
Issue → Planner (PLAN.md) → Coder (implementação) → Reviewer (comentário no PR) → Humano (merge)
```

No modo automático (Actions), os três agentes são invocados sequencialmente pelo `ai-agent.yml`.

---

## Escrevendo boas issues

Para que o agente produza boas implementações, as issues devem conter:

```markdown
## Contexto
O que existe hoje e por que precisa mudar.

## O que fazer
Descrição clara do que deve ser implementado.

## Critérios de aceite
- [ ] Comportamento esperado 1
- [ ] Comportamento esperado 2

## Restrições
- Não quebrar X
- Usar Y ao invés de Z
```

**Evite:**
- Issues com uma linha sem contexto
- Issues que descrevem implementação técnica sem o objetivo
- Issues com múltiplos objetivos não relacionados (prefira dividir)

---

## Resolução de bloqueios

Se uma issue receber a label `ai-blocked`:

1. Leia o comentário do agente explicando o bloqueio
2. Esclareça a issue (edite o corpo ou adicione comentário)
3. Remova a label `ai-blocked`
4. Adicione `ai-processing` para re-disparar

---

## Segurança

- PRs automáticos **nunca** fazem merge direto em `main`
- Toda implementação requer revisão humana antes do merge
- O agente não tem acesso a secrets de produção
- Dados de pacientes (se houver) não são enviados ao agente sem anonimização explícita

---

## Observabilidade

- **Actions:** GitHub → Actions → selecione o workflow
- **Issues:** filtre por label `ai-processing`, `ai-blocked`, `needs-review`
- **PRs:** todos os PRs automáticos têm prefixo `feat: #N` no título

---

## Limitações conhecidas (Fase 0)

- O agente não tem memória entre issues — cada run começa do zero
- Issues muito grandes podem exceder o contexto do modelo
- O agente pode produzir código funcional mas não idiomático — sempre revise
- Sem suporte a issues com dependências entre si (precisa de Fase 1)
