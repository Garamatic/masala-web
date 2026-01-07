/**
 * Offcanvas - Mobile navigation offcanvas component
 */

/**
 * Initialize offcanvas (mobile menu)
 */
export function initOffcanvas() {
    // Open handlers
    document.querySelectorAll('[data-toggle="offcanvas"]').forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.dataset.target);
            if (target) {
                target.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close handlers
    document.querySelectorAll('[data-dismiss="offcanvas"]').forEach(btn => {
        btn.addEventListener('click', function () {
            closeOffcanvas(this.closest('.offcanvas'));
        });
    });

    // Close on link click
    document.querySelectorAll('.offcanvas a[href^="#"]').forEach(link => {
        link.addEventListener('click', () => {
            closeOffcanvas(link.closest('.offcanvas'));
        });
    });
}

/**
 * Close offcanvas menu
 * @param {HTMLElement} offcanvas - The offcanvas element to close
 */
export function closeOffcanvas(offcanvas) {
    if (offcanvas) {
        offcanvas.classList.remove('show');
        document.body.style.overflow = '';
    }
}

export default { initOffcanvas, closeOffcanvas };
