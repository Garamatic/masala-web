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
                not_found: resolve(__dirname, '404.html'),
                config_viewer: resolve(__dirname, 'config-viewer.html'),
            },
        },
    },
    server: {
        port: 3000,
    },
});
