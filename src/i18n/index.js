import en from './en.js';
import nl from './nl.js';
import fr from './fr.js';

export const translations = { en, nl, fr };
let currentLang = 'en';

/**
 * Set the current language and update all i18n elements
 * @param {string} lang - Language code (en, nl, fr)
 */
export function setLang(lang) {
    currentLang = lang;
    const t = translations[lang] || translations.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.innerText = t[key];
        }
    });

    // Update language indicators
    const langLabel = lang.toUpperCase();
    const desktopLang = document.getElementById('current-lang');
    const mobileLang = document.getElementById('current-lang-mobile');
    if (desktopLang) desktopLang.innerText = langLabel;
    if (mobileLang) mobileLang.innerText = langLabel;
}

/**
 * Get current language
 * @returns {string} Current language code
 */
export function getCurrentLang() {
    return currentLang;
}

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {string} [lang] - Optional language override
 * @returns {string} Translated string
 */
export function t(key, lang = currentLang) {
    const dict = translations[lang] || translations.en;
    return dict[key] || key;
}

// Listen for theme changes to update content
window.addEventListener('themeChanged', (event) => {
    // When theme changes, refresh content with current language
    setLang(currentLang);
});

// Export for global access
export default { setLang, getCurrentLang, t, translations };
