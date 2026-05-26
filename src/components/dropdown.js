/**
 * Dropdown - Interactive dropdown menu component
 */

/**
 * Initialize dropdown toggles
 */
export function initDropdowns() {
    if (document.body.dataset.dropdownsInitialized) return;
    document.body.dataset.dropdownsInitialized = 'true';

    document.querySelectorAll('[data-toggle="dropdown"]').forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            let menu = this.nextElementSibling;
            if (!menu?.classList.contains('dropdown-menu')) {
                menu = this.parentNode.querySelector('.dropdown-menu');
            }

            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('show');
                    updateAriaExpanded(m, false);
                }
            });

            const willShow = !menu?.classList.contains('show');
            menu?.classList.toggle('show');
            updateAriaExpanded(menu, willShow);
        });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', e => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                m.classList.remove('show');
                updateAriaExpanded(m, false);
            });
        }
    });
}

/**
 * Update aria-expanded on the toggle button associated with a dropdown menu
 * @param {HTMLElement} menu - The dropdown menu element
 * @param {boolean} expanded - New expanded state
 */
function updateAriaExpanded(menu, expanded) {
    if (!menu) return;
    const toggle =
        menu.previousElementSibling ?? menu.parentNode.querySelector('[data-toggle="dropdown"]');
    if (toggle) {
        toggle.setAttribute('aria-expanded', String(expanded));
    }
}
