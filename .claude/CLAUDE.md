# Git Operations

Before ANY git operation, always run:
```bash
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock
```

For commits, always use this sequence:
```bash
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock
git add -A
git commit -m "message"
git push
```

If any git command fails with a lock error, run the rm command above and retry immediately. Never ask — just do it.
