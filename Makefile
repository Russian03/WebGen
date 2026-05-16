help:
	@echo "Comandos disponibles:"
	@echo "  make new NAME=mi_web"
	@echo "  make run NAME=mi_web"

new:
	mkdir -p webs
	docker compose run --rm astro bash -c "\
	cd /app/webs && \
	npm create astro@latest $(NAME) -- --template basics --yes --no-install && \
	cd $(NAME) && \
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
	bash -c "npm install && npm run dev -- --host"