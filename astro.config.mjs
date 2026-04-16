// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// TODO: Update 'site' to your production URL before deploying
export default defineConfig({
  site: 'https://shendurelab.gs.washington.edu',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});