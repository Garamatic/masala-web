// ==========================================
// MASALA-WEB - Main Entry Point
// ==========================================

// CSS (processed by Vite + PostCSS + Tailwind)
import './input.css';

// Components
import { initReveal } from './components/reveal.js';
import { initNavbar } from './components/navbar.js';
import { initInteractions } from './components/interactions.js';
import { setTheme } from './components/theme.js';
import { setLang } from './i18n/index.js';

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initReveal();
    initNavbar();
    initInteractions();
    
    // Set default language
    setLang('en');
});

// ==========================================
// GLOBAL API (for onclick handlers in HTML)
// ==========================================
window.setTheme = setTheme;
window.setLang = setLang;
