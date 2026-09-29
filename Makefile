# WebGen · atajos. Uso: make <orden> WEB=<carpeta de webs/>
.PHONY: help install dev build build-all new deploy check-web

help:
	@echo "make install              Instala las dependencias de todas las webs"
	@echo "make dev WEB=bien         Servidor local en http://localhost:4321"
	@echo "make build WEB=bien       Compila una web en webs/bien/dist"
	@echo "make build-all            Compila todas las webs (lo mismo que el CI)"
	@echo "make new WEB=mi-web       Crea una web nueva desde templates/base"
	@echo "make deploy WEB=bien      Publica una web en Cloudflare Pages (desde main)"

install:
	npm install

check-web:
	@test -n "$(WEB)" || (echo "Falta WEB=<nombre>"; exit 1)
	@test -d "webs/$(WEB)" || (echo "No existe webs/$(WEB)"; exit 1)

dev: check-web
	npm run dev -w webs/$(WEB) -- --host

build: check-web
	npm run build -w webs/$(WEB)

build-all:
	npm run build:all

new:
	@bash scripts/new-web.sh "$(WEB)"

deploy: check-web
	@bash scripts/deploy.sh "$(WEB)"
