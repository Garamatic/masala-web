import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

function loadJson(relativePath) {
    const fullPath = resolve(__dirname, '..', '..', relativePath);
    const raw = readFileSync(fullPath, 'utf8');
    return JSON.parse(raw);
}

describe('tenant masala_config.json validation', () => {
    const schema = loadJson('src/config/masala-config.schema.json');

    const ajv = new Ajv({
        allErrors: true,
        strict: false,
        validateSchema: false,
    });

    const validate = ajv.compile(schema);

    const tenants = ['desgoffe', 'whitman', 'liberty', 'hennessey'];

    tenants.forEach(tenant => {
        it(`validates masala_config.json for ${tenant}`, () => {
            const config = loadJson(`tenants/${tenant}/config/masala_config.json`);
            const valid = validate(config);

            if (!valid) {
                const messages = (validate.errors || [])
                    .map(e => `${e.instancePath || '(root)'} ${e.message ?? ''}`.trim())
                    .join('; ');
                throw new Error(`Schema validation failed for ${tenant}: ${messages}`);
            }

            expect(valid).toBe(true);
        });
    });
});
