/**
 * Navbar - Scroll effect for sticky navigation
 */

const SCROLL_THRESHOLD = 50;

export function initNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    
    const navInner = nav.querySelector('.container > div');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > SCROLL_THRESHOLD) {
                    nav.classList.add('py-2');
                    navInner?.classList.add('shadow-lg');
                } else {
                    nav.classList.remove('py-2');
                    navInner?.classList.remove('shadow-lg');
                }
                ticking = false;
            });

            ticking = true;
        }
    });
}

export default { initNavbar };
