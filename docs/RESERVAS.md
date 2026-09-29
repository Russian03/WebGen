# Reservas integradas en las webs (plan)

Objetivo: que la web de cada negocio tenga su propio panel de reservas, con el
diseño de la web, usando el motor de reservas de AJschedule.

## Enfoque

Un paquete compartido, `packages/booking`: un componente React que cualquier web
de `webs/` añade con una línea y que habla con la **misma API pública** que usa
la web de reservas de AJschedule (función `public-booking` de Supabase):

1. Datos del negocio y servicios.
2. Profesionales y huecos libres.
3. Captcha (Turnstile) → código por email → verificación.
4. Reserva y email de confirmación (con el enlace "Cambiar o cancelar").

Toda la seguridad sigue en el servidor (código por email, captcha, límites por
IP y por email). La web solo muestra y envía datos; no guarda ninguna clave
secreta.

## Por qué no un iframe de la app

- La app Flutter pesa varios MB: demasiado para una web de presentación.
- No se adapta al diseño de cada web.
- AJschedule bloquea que la metan en otras webs (`X-Frame-Options: DENY`),
  a propósito.

## Qué hará falta en AJschedule

- **CORS**: permitir las direcciones de las webs (lista de dominios permitidos).
- **Turnstile**: añadir el dominio de cada web al widget.
- **Parámetro de negocio**: cada web se conecta con el *slug* de su negocio.

## Mientras tanto

`webs/pelu` abre la web de reservas de AJschedule en otra pestaña
(`src/lib/booking.js`).
