import { describe, it, expect, beforeEach, vi } from 'vitest';
import { t, setLang, translations, getCurrentLang } from '../../src/i18n/index.js';

describe('i18n', () => {
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = `
            <div>
                <span data-i18n="nav_features">Original</span>
                <span id="current-lang">Original</span>
                <span id="current-lang-mobile">Original</span>
            </div>
        `;
        setLang('en');
    });

    it('should translate known keys', () => {
        const enKeys = Object.keys(translations.en);
        if (enKeys.length > 0) {
            const key = enKeys[0];
            expect(t(key)).toBe(translations.en[key]);
        }
    });

    it('should return key if translation missing', () => {
        expect(t('non_existent_key')).toBe('non_existent_key');
    });

    it('should switch language and update DOM', () => {
        // Spy on event dispatch
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

        // Switch to French
        setLang('fr');

        // Check internal state
        expect(getCurrentLang()).toBe('fr');

        // Check DOM update for data-i18n
        const el = document.querySelector('[data-i18n="nav_features"]');
        expect(el.innerText).toBe(translations.fr.nav_features);

        // Check DOM update for language indicators
        const langIndicator = document.getElementById('current-lang');
        expect(langIndicator.innerText).toBe('FR');

        // Check event dispatch
        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'languageChanged',
                detail: { lang: 'fr' },
            })
        );
    });

    it('should leave DOM unchanged when translation key is missing', () => {
        // Mock translations temporarily
        const originalTranslations = { ...translations };
        translations.fr = { ...translations.fr };
        delete translations.fr['nav_features']; // Simulate missing key in FR

        try {
            setLang('fr');

            const el = document.querySelector('[data-i18n="nav_features"]');
            // When key is missing in target language, setLang does not update the element,
            // so it retains the previously applied English text.
            expect(el.innerText).toBe(translations.en.nav_features);
        } finally {
            Object.assign(translations, originalTranslations);
        }
    });
});
