/**
 * Navbar - Scroll effect for sticky navigation
 */

export function initNavbar() {
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (!nav) return;
        
        const navInner = nav.querySelector('.container > div');
        
        if (window.scrollY > 50) {
            nav.classList.add('py-2');
            navInner?.classList.add('shadow-lg');
        } else {
            nav.classList.remove('py-2');
            navInner?.classList.remove('shadow-lg');
        }
    });
}

export default { initNavbar };
