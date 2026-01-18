import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tenants = ['desgoffe', 'whitman', 'liberty', 'hennessey'];

console.log('Starting post-build config copy...');

tenants.forEach(tenant => {
    const srcDir = path.resolve(__dirname, `../tenants/${tenant}/config`);
    const destDir = path.resolve(__dirname, `../dist/tenants/${tenant}/config`);

    if (fs.existsSync(srcDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.readdirSync(srcDir).forEach(file => {
            fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
        });
        console.log(`✓ Copied config for ${tenant}`);
    } else {
        console.warn(`! Config dir not found for ${tenant}`);
    }
});

console.log('Post-build copy complete.');
