// ==========================================
// MASALA-WEB - Main Entry Point
// ==========================================

// CSS (processed by Vite + PostCSS + Tailwind)
import './input.css';

// Components
import { initReveal } from './components/reveal.js';
import { initNavbar } from './components/navbar.js';
import { initDropdowns } from './components/dropdown.js';
import { initOffcanvas } from './components/offcanvas.js';
import { setTheme } from './components/theme.js';
import { setLang, translations } from './i18n/index.js';

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initReveal();
    initNavbar();
    initDropdowns();
    initOffcanvas();

    // Set default language (respect page-level override)
    const pageLang = document.documentElement.getAttribute('lang');
    setLang(pageLang && translations[pageLang] ? pageLang : 'en');

    // Keyboard shortcuts
    initKeyboardShortcuts();
});

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================
const THEMES = ['default', 'desgoffe', 'whitman', 'liberty', 'hennessey'];
const LANGS = ['en', 'nl', 'fr'];

function initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
        // Skip if user is typing in an input or textarea
        if (
            e.target.tagName === 'INPUT' ||
            e.target.tagName === 'TEXTAREA' ||
            e.target.isContentEditable
        ) {
            return;
        }

        // T = cycle themes
        if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const current = document.body.getAttribute('data-theme') || 'default';
            const idx = THEMES.indexOf(current);
            const next = THEMES[(idx + 1) % THEMES.length];
            setTheme(next);
        }

        // L = cycle languages
        if (e.key === 'l' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const current = document.documentElement.getAttribute('lang') || 'en';
            const idx = LANGS.indexOf(current);
            const next = LANGS[(idx + 1) % LANGS.length];
            setLang(next);
        }
    });
}

// ==========================================
// GLOBAL API (for onclick handlers in HTML)
// ==========================================
window.setTheme = setTheme;
window.setLang = setLang;
