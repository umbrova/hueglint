import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [
    starlight({
      title: 'hueglint',
      description: 'Clarity, not just color.',
      customCss: ['./src/styles/starlight-custom.css'],
      sidebar: [
        { label: 'Getting started', autogenerate: { directory: 'docs/getting-started' } },
        { label: 'Core concepts', autogenerate: { directory: 'docs/core-concepts' } },
      ],
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});