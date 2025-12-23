/**
 * Theme Switching - Dynamic theme application with hero content updates
 */

import { setLang, getCurrentLang } from '../i18n/index.js';

const themeHeroContent = {
    desgoffe: {
        title1: "Governing The",
        title2: "Municipality",
        desc: "Efficient bureaucracy compliant with protocol v3.0. Digital sovereignty for the modern state."
    },
    whitman: {
        title1: "Maintaining The",
        title2: "Tracks",
        desc: "Heavy infrastructure management with zero latency. Safety signals and scheduling in real-time."
    },
    liberty: {
        title1: "Deploying The",
        title2: "Future",
        desc: "Agile workflows for high-velocity dev teams. CI/CD pipelines compliant with your caffeine intake."
    },
    hennessey: {
        title1: "Securing The",
        title2: "Grant",
        desc: "Research proposals, budget reviews, and peer-reviewed workflow automation."
    }
};

/**
 * Set theme and update hero content
 * @param {string} themeName - Theme identifier
 */
export function setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);

    const heroTitle1 = document.querySelector('[data-i18n="hero_title_1"]');
    const heroTitle2 = document.querySelector('[data-i18n="hero_title_2"]');
    const heroDesc1 = document.querySelector('[data-i18n="hero_desc_1"]');

    if (themeHeroContent[themeName]) {
        const content = themeHeroContent[themeName];
        if (heroTitle1) heroTitle1.innerText = content.title1;
        if (heroTitle2) heroTitle2.innerText = content.title2;
        if (heroDesc1) heroDesc1.innerText = content.desc;
    } else {
        // Reset to current language
        setLang(getCurrentLang());
    }
}

export default { setTheme };
