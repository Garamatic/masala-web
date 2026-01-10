/**
 * Scroll Reveal - Animates elements as they enter the viewport
 * Uses IntersectionObserver for performance.
 */

const OBSERVER_OPTIONS = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

export function initReveal() {
    const reveals = document.querySelectorAll(".reveal");

    if (!('IntersectionObserver' in window)) {
        // Fallback for very old browsers
        reveals.forEach(el => el.classList.add("active"));
        return;
    }

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, OBSERVER_OPTIONS);

    reveals.forEach(el => observer.observe(el));
}

export default { initReveal };
