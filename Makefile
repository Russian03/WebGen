help:
	@echo "Comandos disponibles:"
	@echo "  make new NAME=mi_web"
	@echo "  make run NAME=mi_web"
	@echo "  make install NAME=mi_web PKG=gsap"
	@echo "  make install NAME=mi_web PKG=framer-motion"
	@echo "  make install NAME=mi_web PKG="motion clsx tailwind-merge"

new:
	mkdir -p webs
	docker compose run --rm astro bash -c "\
	cd /app/webs && \
	npm create astro@latest $(NAME) -- --template basics --yes --no-install && \
	cd $(NAME) && \
	npm pkg set dependencies.astro=latest && \
	npm install && \
	npx astro add react --yes && \
	npx astro add tailwind --yes \
	"
	sudo chown -R $(USER):$(USER) webs/$(NAME)
	@echo "Proyecto $(NAME) creado correctamente"

run:
	docker compose run --rm \
	-p 4321:4321 \
	-v $(PWD)/webs/$(NAME):/app \
	-w /app \
	astro \
	bash -c "npm install && rm -f .astro/dev.json && npm run dev -- --host"

install:
	docker compose run --rm \
	-v $(PWD)/webs/$(NAME):/app \
	-w /app \
	astro \
	bash -c "npm install $(PKG)"
	sudo chown -R $(USER):$(USER) webs/$(NAME)
	@echo "Paquete $(PKG) instalado en $(NAME)"