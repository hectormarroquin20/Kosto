import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static', // Confirmamos que es estático
  build: {
    format: 'directory', // Esto convierte about.html en about/index.html
    //format: 'file',
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      strategy: 'prefix-except-default', // Esto hace que /es sea opcional y /en sea obligatorio o viceversa
    },
  },

  // site: 'https://insummi.com' // Replace with your actual domain
  // site: 'http://localhost:4321',
  site: 'https://d123456789.cloudfront.net',

  integrations: [tailwind()]
});