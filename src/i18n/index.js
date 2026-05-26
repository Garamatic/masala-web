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
    currentLang = translations[lang] ? lang : 'en';
    const dict = translations[currentLang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key in dict) {
            el.textContent = dict[key];
        }
    });

    // Update language indicators
    const langLabel = currentLang.toUpperCase();
    const desktopLang = document.getElementById('current-lang');
    const mobileLang = document.getElementById('current-lang-mobile');
    if (desktopLang) desktopLang.textContent = langLabel;
    if (mobileLang) mobileLang.textContent = langLabel;

    // Update document language for screen readers
    document.documentElement.setAttribute('lang', currentLang);

    // Dispatch event to notify other components (like Theme switcher)
    window.dispatchEvent(
        new CustomEvent('languageChanged', {
            detail: { lang: currentLang },
        })
    );
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
