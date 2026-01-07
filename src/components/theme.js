/**
 * Theme Switching - Dynamic theme application with hero content updates
 */

import { t, getCurrentLang } from '../i18n/index.js';

/**
 * Set theme and update hero content
 * @param {string} themeName - Theme identifier
 */
export function setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);

    const heroTitle1 = document.querySelector('[data-i18n="hero_title_1"]');
    const heroTitle2 = document.querySelector('[data-i18n="hero_title_2"]');
    const heroDesc1 = document.querySelector('[data-i18n="hero_desc_1"]');

    // Check if theme has custom content
    const currentLang = getCurrentLang();
    const themeKey = `theme_${themeName}_hero_title_1`;

    if (t(themeKey, currentLang) !== themeKey) {
        // Theme-specific content exists in i18n
        if (heroTitle1) heroTitle1.innerText = t(`theme_${themeName}_hero_title_1`, currentLang);
        if (heroTitle2) heroTitle2.innerText = t(`theme_${themeName}_hero_title_2`, currentLang);
        if (heroDesc1) heroDesc1.innerText = t(`theme_${themeName}_hero_desc`, currentLang);
    } else {
        // No theme-specific content, emit event to reset to default language content
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeName }
        }));
    }
}

export default { setTheme };
