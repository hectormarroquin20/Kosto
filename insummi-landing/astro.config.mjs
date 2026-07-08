import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',

  // site: 'https://insummi.com' // Replace with your actual domain
  site: 'http://localhost:4321',

  integrations: [tailwind()]
});