// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: 'ca',
    locales: ['ca', 'es'],
    routing: {
      prefixDefaultLocale: false // La versió en català serà la principal (ex: /) i la de castellà serà /es
    }
  }
});