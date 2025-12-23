/**
 * Interactive Components - Dropdowns and Offcanvas
 */

/**
 * Initialize dropdown toggles
 */
function initDropdowns() {
    document.querySelectorAll('[data-toggle="dropdown"]').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            let menu = this.nextElementSibling;
            if (!menu?.classList.contains('dropdown-menu')) {
                menu = this.parentNode.querySelector('.dropdown-menu');
            }
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                if (m !== menu) m.classList.remove('show');
            });
            
            menu?.classList.toggle('show');
        });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
        }
    });
}

/**
 * Initialize offcanvas (mobile menu)
 */
function initOffcanvas() {
    // Open handlers
    document.querySelectorAll('[data-toggle="offcanvas"]').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
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
        btn.addEventListener('click', function() {
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
 */
function closeOffcanvas(offcanvas) {
    if (offcanvas) {
        offcanvas.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/**
 * Initialize all interactive components
 */
export function initInteractions() {
    initDropdowns();
    initOffcanvas();
}

export default { initInteractions };
