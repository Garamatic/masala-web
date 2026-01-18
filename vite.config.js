import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
                config_viewer: resolve(__dirname, 'config-viewer.html'),
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
        port: 3000,
    },
});
