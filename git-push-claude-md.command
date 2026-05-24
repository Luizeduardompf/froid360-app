#!/bin/bash
cd ~/Documents/Claude/Projects/Froid.app
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock
git add .claude/CLAUDE.md
git commit -m "chore: expandir CLAUDE.md com contexto do projeto e instrucoes de git via Terminal" 2>&1 || echo "Nada para commitar"
git push origin HEAD:main 2>&1
echo ""
echo "Pronto! Pressione Enter para fechar."
read
