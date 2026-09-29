#!/usr/bin/env bash
# Crea webs/<nombre> a partir de templates/base.
set -euo pipefail
cd "$(dirname "$0")/.."

NAME="${1:-}"
if [[ ! "$NAME" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "✘ Nombre no válido. Usa minúsculas, números y guiones: make new WEB=mi-web"
  exit 1
fi
if [ -e "webs/$NAME" ]; then
  echo "✘ Ya existe webs/$NAME"
  exit 1
fi

cp -r templates/base "webs/$NAME"
sed -i "s/__WEB_NAME__/$NAME/g" "webs/$NAME/package.json" "webs/$NAME/web.json" "webs/$NAME/src/layouts/Layout.astro"
npm install
echo "✔ Creada webs/$NAME. Arráncala con: make dev WEB=$NAME"
