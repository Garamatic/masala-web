/**
 * Scroll Reveal - Animates elements as they enter the viewport
 */

const VISIBLE_THRESHOLD = 100;

function revealElements() {
    const reveals = document.querySelectorAll(".reveal");
    const windowHeight = window.innerHeight;
    
    reveals.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - VISIBLE_THRESHOLD) {
            el.classList.add("active");
        }
    });
}

export function initReveal() {
    window.addEventListener("scroll", revealElements);
    window.addEventListener("load", revealElements);
    
    // Initial check
    revealElements();
}

export default { initReveal };
