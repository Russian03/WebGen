#!/usr/bin/env bash
# Publica webs/<nombre> en su proyecto de Cloudflare Pages (webs/<nombre>/web.json).
# Solo desde main y sin cambios pendientes: lo publicado es lo que está en GitHub.
set -euo pipefail
cd "$(dirname "$0")/.."

NAME="${1:-}"
DIR="webs/$NAME"
if [ -z "$NAME" ] || [ ! -f "$DIR/web.json" ]; then
  echo "✘ Uso: make deploy WEB=<nombre> (y debe existir webs/<nombre>/web.json)"
  exit 1
fi
if [ "$(git branch --show-current)" != "main" ]; then
  echo "✘ Publica siempre desde main (ahora estás en $(git branch --show-current))."
  exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "✘ Hay cambios sin guardar en Git:"
  git status --short
  exit 1
fi

PROJECT=$(node -e "console.log(require('./$DIR/web.json').cloudflareProject || '')")
if [ -z "$PROJECT" ]; then
  echo "✘ Falta \"cloudflareProject\" en $DIR/web.json"
  exit 1
fi

git pull --ff-only
npm install
echo "▶ Compilando $NAME ($(git log -1 --pretty='%h %s'))…"
npm run build -w "$DIR"

echo "▶ Publicando en Cloudflare Pages ($PROJECT)…"
npx wrangler pages deploy "$DIR/dist" \
  --project-name "$PROJECT" \
  --branch main \
  --commit-hash "$(git rev-parse HEAD)" \
  --commit-message "$(git log -1 --pretty=%s)"
echo "✔ Publicada $NAME."
