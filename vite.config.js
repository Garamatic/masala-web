import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src/partials'),
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        demos: resolve(__dirname, 'tenants/site/demos.html'),
        desgoffe_index: resolve(__dirname, 'tenants/desgoffe/client/index.html'),
        desgoffe_success: resolve(__dirname, 'tenants/desgoffe/client/success.html'),
        whitman_index: resolve(__dirname, 'tenants/whitman/client/index.html'),
        whitman_success: resolve(__dirname, 'tenants/whitman/client/success.html'),
        liberty_index: resolve(__dirname, 'tenants/liberty/client/index.html'),
        liberty_success: resolve(__dirname, 'tenants/liberty/client/success.html'),
        hennessey_index: resolve(__dirname, 'tenants/hennessey/client/index.html'),
        hennessey_success: resolve(__dirname, 'tenants/hennessey/client/success.html'),
      },
    },
  },
  server: {
    port: 3000
  }
});
