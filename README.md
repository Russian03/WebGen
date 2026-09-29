# WebGen

Webs de negocios locales. Cada web vive en su carpeta de `webs/` (Astro + React
+ Tailwind) y se publica como un proyecto propio de Cloudflare Pages.

| Carpeta | Qué es | Cloudflare Pages |
|---|---|---|
| `webs/bien` | Bien Kebab (carta y presentación) | `web-bien` |
| `webs/pelu` | HairStudio, demo de peluquería con reservas | `web-pelu` |
| `templates/base` | Plantilla para webs nuevas | — |

## Requisitos

Node.js 22 (el mismo de AJschedule). Docker ya no hace falta.

## Uso

```bash
make install              # una vez: dependencias de todas las webs
make dev WEB=bien         # http://localhost:4321
make build WEB=bien       # compila en webs/bien/dist
make build-all            # compila todas (lo mismo que el CI)
make new WEB=mi-web       # nueva web desde templates/base
make deploy WEB=bien      # publica en Cloudflare Pages (solo desde main)
```

Un solo `package-lock.json` en la raíz (npm workspaces): las webs comparten
versiones y Dependabot abre un único PR para todas.

## Flujo de trabajo

- Una **carpeta por web**, no una rama por web.
- Una **rama corta por tarea** (`feat/`, `fix/`, `chore/`, `docs/`) → Pull Request
  → CI en verde (compilación de todas las webs + gitleaks) → *Squash and merge*.
- Después de unir: `make deploy WEB=<la web que ha cambiado>`.

Las ramas antiguas (una web por rama) están archivadas como etiquetas
`archive/*`: `git show archive/tennis:webs/pelu/...` para consultarlas.

## Reglas

- **Repositorio público**: nada de secretos. Solo claves públicas por diseño
  (la *publishable* de Supabase, la *site key* de Turnstile). Todo lo demás
  va en el servidor (AJschedule).
- Fuentes alojadas en la propia web (paquetes `@fontsource`), no Google Fonts.
- Cada web tiene `web.json` (nombre y proyecto de Cloudflare) y
  `public/_headers` (cabeceras de seguridad).

Reservas integradas en las webs: ver `docs/RESERVAS.md`.
