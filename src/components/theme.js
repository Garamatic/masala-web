/**
 * Theme Switching - Dynamic theme application with hero content updates
 */

import { t, getCurrentLang } from '../i18n/index.js';

/**
 * Update hero content based on current theme and language
 */
function updateThemeContent() {
    const themeName = document.body.getAttribute('data-theme') || 'default';
    const currentLang = getCurrentLang();

    const heroTitle1 = document.querySelector('[data-i18n="hero_title_1"]');
    const heroTitle2 = document.querySelector('[data-i18n="hero_title_2"]');
    const heroDesc1 = document.querySelector('[data-i18n="hero_desc_1"]');
    const heroDesc2 = document.querySelector('[data-i18n="hero_desc_2"]');
    const heroDesc3 = document.querySelector('[data-i18n="hero_desc_3"]');

    // Helper to update text with fallback
    const update = (el, baseKey, themeKeySuffix) => {
        if (!el) return;
        const themeKey = `theme_${themeName}_${themeKeySuffix}`;
        // Check if theme key exists (returns something other than key)
        const themeText = t(themeKey, currentLang);
        if (themeText !== themeKey) {
            el.innerText = themeText;
        } else {
            // Fallback to base key
            el.innerText = t(baseKey, currentLang);
        }
    };

    update(heroTitle1, 'hero_title_1', 'hero_title_1');
    update(heroTitle2, 'hero_title_2', 'hero_title_2');

    // Special handling for description
    // Themes usually have a single long description (theme_X_hero_desc)
    // while default has 3 parts (hero_desc_1, hero_desc_2, hero_desc_3)
    const themeDescKey = `theme_${themeName}_hero_desc`;
    const themeDescText = t(themeDescKey, currentLang);
    const hasThemeDesc = themeDescText !== themeDescKey;

    if (hasThemeDesc) {
        if (heroDesc1) {
            heroDesc1.innerText = themeDescText;
            heroDesc1.style.display = ''; // Ensure visible
        }
        if (heroDesc2) heroDesc2.style.display = 'none';
        if (heroDesc3) heroDesc3.style.display = 'none';
    } else {
        // Restore default split description
        if (heroDesc1) {
            heroDesc1.innerText = t('hero_desc_1', currentLang);
            heroDesc1.style.display = '';
        }
        if (heroDesc2) {
            heroDesc2.innerText = t('hero_desc_2', currentLang);
            heroDesc2.style.display = '';
        }
        if (heroDesc3) {
            heroDesc3.innerText = t('hero_desc_3', currentLang);
            heroDesc3.style.display = '';
        }
    }
}

/**
 * Set theme and update hero content
 * @param {string} themeName - Theme identifier
 */
export function setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    updateThemeContent();
}

// Listen for language changes to re-apply theme overrides
window.addEventListener('languageChanged', () => {
    updateThemeContent();
});

export default { setTheme };
