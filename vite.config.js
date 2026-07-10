import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {

      compress: { drop_console: ['debug'], passes: 2 },
    },
  },
});
