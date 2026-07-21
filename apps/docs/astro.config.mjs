import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'hueglint',
      description: 'Clarity, not just color.',
      sidebar: [
        { label: 'Getting started', autogenerate: { directory: 'getting-started' } },
        { label: 'Core concepts', autogenerate: { directory: 'core-concepts' } },
      ],
    }),
  ],
});