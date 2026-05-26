/**
 * PortalForm - Reusable form handling for tenant portals
 *
 * This class encapsulates all common form functionality including:
 * - Real-time validation with ARIA attributes
 * - Character counter for description field
 * - File upload handling with PDF validation
 * - API submission with loading overlay
 * - Error handling and success redirection
 */

export class PortalForm {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.formId - ID of the form element
     * @param {string} config.apiEndpoint - API endpoint URL for form submission
     * @param {number} [config.minDescriptionLength] - Minimum description length (default: 10)
     * @param {Object} config.messages - Localized messages
     * @param {string} [config.tenant] - Tenant identifier for backend routing
     * @param {string} [config.customFieldId] - ID of a tenant-specific custom field
     * @param {string} [config.customFieldLabel] - Label for the custom field (used in Tags)
     */
    constructor(config) {
        this.config = {
            minDescriptionLength: 10,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            ...config,
        };

        this.form = document.getElementById(this.config.formId);
        if (!this.form) {
            throw new Error(`Form with id "${this.config.formId}" not found`);
        }

        this.descriptionField = document.getElementById('description');
        this.fileInput = document.getElementById('attachment');
        this.fileNameDisplay = document.getElementById('fileName');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    /**
     * Initialize all form handlers
     */
    init() {
        this.attachAccessibilityValidation();
        this.attachCharacterCounter();
        this.attachFileUploadHandler();
        this.attachSubmitHandler();
        this.attachResetHandler();
    }

    /**
     * Attach real-time accessibility validation to all form inputs
     */
    attachAccessibilityValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                this.setAttribute('aria-invalid', String(!this.checkValidity()));
            });

            input.addEventListener('input', function () {
                if (this.checkValidity()) {
                    this.setAttribute('aria-invalid', 'false');
                }
            });
        });
    }

    /**
     * Attach character counter to description field
     */
    attachCharacterCounter() {
        if (!this.descriptionField) return;

        // Create character counter element
        const counterElement = document.createElement('small');
        counterElement.className = 'char-counter';
        counterElement.style.cssText = 'display: block; margin-top: 0.5rem;';
        this.descriptionField.parentNode.insertBefore(
            counterElement,
            this.descriptionField.nextSibling
        );

        // Update counter on input
        this.descriptionField.addEventListener('input', () => {
            const length = this.descriptionField.value.length;
            const minLength = this.config.minDescriptionLength;

            counterElement.textContent = this.config.messages.charCounter
                .replace('{length}', String(length))
                .replace('{min}', String(minLength));

            if (length >= minLength) {
                counterElement.classList.add('char-counter-valid');
                counterElement.classList.remove('char-counter-invalid');
                this.descriptionField.setCustomValidity('');
            } else {
                counterElement.classList.add('char-counter-invalid');
                counterElement.classList.remove('char-counter-valid');
                this.descriptionField.setCustomValidity(
                    this.config.messages.charCounterError.replace('{min}', minLength)
                );
            }
        });

        // Trigger initial update
        this.descriptionField.dispatchEvent(new Event('input'));
    }

    /**
     * Attach file upload handler with PDF validation
     */
    attachFileUploadHandler() {
        if (!this.fileInput || !this.fileNameDisplay) return;

        this.fileInput.addEventListener('change', e => {
            const file = e.target.files[0];

            if (file) {
                // Validate PDF only (MIME type or extension fallback)
                const isPdf =
                    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                if (!isPdf) {
                    alert(this.config.messages.pdfOnly);
                    this.fileInput.value = '';
                    this.fileNameDisplay.textContent = this.config.messages.chooseFile;
                    return;
                }

                // Validate File Size
                if (file.size > this.config.maxFileSize) {
                    alert(
                        `File size exceeds limit of ${this.config.maxFileSize / (1024 * 1024)}MB`
                    );
                    this.fileInput.value = '';
                    this.fileNameDisplay.textContent = this.config.messages.chooseFile;
                    return;
                }

                this.fileNameDisplay.textContent = file.name;
            } else {
                this.fileNameDisplay.textContent = this.config.messages.chooseFile;
            }
        });
    }

    /**
     * Attach form submit handler
     */
    attachSubmitHandler() {
        this.form.addEventListener('submit', async e => {
            e.preventDefault();

            // Validate form
            if (!this.form.checkValidity()) {
                this.highlightInvalidFields();
                this.form.reportValidity();
                return;
            }

            // Show loading overlay
            if (this.loadingOverlay) {
                this.loadingOverlay.style.display = 'flex';
            }

            try {
                const result = await this.submitForm();

                if (result.success) {
                    // Redirect to success page
                    sessionStorage.setItem('submissionResult', JSON.stringify(result));
                    window.location.href = 'success.html';
                } else {
                    throw new Error(result.message || this.config.messages.submitError);
                }
            } catch (error) {
                console.error('Form submission failed:', error);
                alert(this.config.messages.submitError);
                if (this.loadingOverlay) {
                    this.loadingOverlay.style.display = 'none';
                }
            }
        });
    }

    /**
     * Highlight invalid form fields
     */
    highlightInvalidFields() {
        Array.from(this.form.elements).forEach(field => {
            if (
                field instanceof HTMLInputElement ||
                field instanceof HTMLTextAreaElement ||
                field instanceof HTMLSelectElement
            ) {
                if (!field.checkValidity()) {
                    field.setAttribute('aria-invalid', 'true');
                    field.parentElement?.classList.add('shake');
                    setTimeout(() => field.parentElement?.classList.remove('shake'), 500);
                }
            }
        });
    }

    /**
     * Map numeric priority score to contract enum string.
     * @param {string|number} score
     * @returns {string}
     */
    priorityToString(score) {
        const map = { 5: 'low', 10: 'medium', 15: 'high', 20: 'urgent' };
        return map[score] ?? 'low';
    }

    /**
     * Submit form data to API
     * @returns {Promise<Object>} API response
     */
    async submitForm() {
        const formData = new FormData();

        // Add standard fields with sanitization
        // NOTE: This class expects specific field IDs (customerName, customerEmail,
        // customerPhone, description, requestType, priorite). Tenant forms must match.
        const customerName = document.getElementById('customerName');
        const customerEmail = document.getElementById('customerEmail');
        const customerPhone = document.getElementById('customerPhone');
        const description = document.getElementById('description');
        const requestType = document.getElementById('requestType');

        if (!customerName || !customerEmail || !description || !requestType) {
            throw new Error(
                'Required form field missing. Expected IDs: customerName, customerEmail, description, requestType'
            );
        }

        formData.append('CustomerName', this.sanitizeInput(customerName.value));
        formData.append('CustomerEmail', this.sanitizeInput(customerEmail.value));
        formData.append('CustomerPhone', this.sanitizeInput(customerPhone?.value));
        formData.append('Description', this.sanitizeInput(description.value));
        formData.append('WorkItemType', this.sanitizeInput(requestType.value));
        const prioriteEl = document.getElementById('priorite');
        const rawPriority = prioriteEl?.value || '5';
        formData.append('PriorityScore', rawPriority);
        formData.append('Priority', this.priorityToString(rawPriority));

        // Add custom fields (tenant-specific)
        if (this.config.customFieldId) {
            const customField = document.getElementById(this.config.customFieldId);
            if (customField) {
                const sanitizedValue = this.sanitizeInput(customField.value);
                formData.append('Tags', `${this.config.customFieldLabel}:${sanitizedValue}`);
            }
        }

        // Add file if present
        const file = this.fileInput?.files[0];
        if (file) {
            formData.append('Attachment', file);
        }

        // Prepare headers
        const headers = {};
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }

        // Add tenant header for backend routing
        if (this.config.tenant) {
            headers['X-Tenant'] = this.config.tenant;
        }

        // Submit to API
        const response = await fetch(this.config.apiEndpoint, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Sanitize user input by stripping HTML tags.
     * Uses a regex to remove tag-like sequences, preventing XSS and
     * avoiding the pitfalls of DOM-based parsing (mutation, mXSS).
     * The API is responsible for escaping when rendering.
     * @param {string} input - Raw input string
     * @returns {string} Sanitized string
     */
    sanitizeInput(input) {
        if (!input) return '';
        return String(input).replace(/<[^>]*>/g, '');
    }

    /**
     * Attach form reset handler
     */
    attachResetHandler() {
        this.form.addEventListener('reset', () => {
            if (this.fileNameDisplay) {
                this.fileNameDisplay.textContent = this.config.messages.chooseFile;
            }
            if (this.descriptionField) {
                // The reset event fires before values are cleared, so defer the update.
                requestAnimationFrame(() => {
                    this.descriptionField.dispatchEvent(new Event('input'));
                });
            }
        });
    }
}
