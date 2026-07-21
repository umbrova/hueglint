import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [
    starlight({
      title: 'hueglint',
      description: 'Clarity, not just color.',
      sidebar: [
        { label: 'Getting started', autogenerate: { directory: 'docs/getting-started' } },
        { label: 'Core concepts', autogenerate: { directory: 'docs/core-concepts' } },
      ],
    }),
    react(),
  ],
});