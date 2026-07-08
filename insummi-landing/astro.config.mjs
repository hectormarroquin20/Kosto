import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static', // Confirmamos que es estático
  build: {
    //format: 'directory', // Esto convierte about.html en about/index.html
    format: 'file',
  },

  // site: 'https://insummi.com' // Replace with your actual domain
  // site: 'http://localhost:4321',
  site: 'https://d123456789.cloudfront.net',

  integrations: [tailwind()]
});