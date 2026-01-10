import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLang, translations } from '../../src/i18n/index.js';

describe('i18n', () => {
    beforeEach(() => {
        setLang('en');
    });

    it('should translate known keys', () => {
        // Assuming 'welcome' or similar exists, or we check object availability
        // Since we import real translations, let's check a standard key if we know one,
        // or mock the translations object if possible.
        // But `translations` is exported.
        
        // Let's rely on the fact that we can check `translations.en` keys.
        const enKeys = Object.keys(translations.en);
        if (enKeys.length > 0) {
            const key = enKeys[0];
            expect(t(key)).toBe(translations.en[key]);
        }
    });

    it('should return key if translation missing', () => {
        expect(t('non_existent_key')).toBe('non_existent_key');
    });

    it('should switch language', () => {
        setLang('fr');
        const frKeys = Object.keys(translations.fr);
         if (frKeys.length > 0) {
            const key = frKeys[0];
            expect(t(key)).toBe(translations.fr[key]);
        }
    });
});
