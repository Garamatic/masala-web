/**
 * Offcanvas - Mobile navigation offcanvas component
 */

/**
 * Initialize offcanvas (mobile menu)
 */
export function initOffcanvas() {
    if (document.body.dataset.offcanvasInitialized) return;
    document.body.dataset.offcanvasInitialized = 'true';

    // Open handlers
    document.querySelectorAll('[data-toggle="offcanvas"]').forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.dataset.target);
            if (target) {
                target.classList.add('show');
                document.body.style.overflow = 'hidden';
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Close handlers
    document.querySelectorAll('[data-dismiss="offcanvas"]').forEach(btn => {
        btn.addEventListener('click', function () {
            closeOffcanvas(this.closest('.offcanvas'));
        });
    });

    // Close on any link click inside offcanvas
    document.querySelectorAll('.offcanvas a').forEach(link => {
        link.addEventListener('click', () => {
            closeOffcanvas(link.closest('.offcanvas'));
        });
    });

    // Close on backdrop click
    document.addEventListener('click', (e) => {
        const openOffcanvas = document.querySelector('.offcanvas.show');
        if (openOffcanvas && !openOffcanvas.contains(e.target) && !e.target.closest('[data-toggle="offcanvas"]')) {
            closeOffcanvas(openOffcanvas);
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openOffcanvas = document.querySelector('.offcanvas.show');
            if (openOffcanvas) {
                closeOffcanvas(openOffcanvas);
            }
        }
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
        const toggle = document.querySelector(`[data-target="#${CSS.escape(offcanvas.id)}"]`);
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
    }
}


