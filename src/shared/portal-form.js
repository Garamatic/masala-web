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
     * @param {string} config.locale - Locale code (e.g., 'fr', 'en', 'nl')
     * @param {number} config.minDescriptionLength - Minimum description length (default: 10)
     * @param {Object} config.messages - Localized messages
     */
    constructor(config) {
        this.config = {
            minDescriptionLength: 10,
            ...config
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
                if (this.checkValidity && !this.checkValidity()) {
                    this.setAttribute('aria-invalid', 'true');
                } else {
                    this.setAttribute('aria-invalid', 'false');
                }
            });

            input.addEventListener('input', function () {
                if (this.checkValidity && this.checkValidity()) {
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
        counterElement.style.cssText = 'display: block; margin-top: 0.5rem; color: #666;';
        this.descriptionField.parentNode.insertBefore(
            counterElement,
            this.descriptionField.nextSibling
        );

        // Update counter on input
        this.descriptionField.addEventListener('input', () => {
            const length = this.descriptionField.value.length;
            const minLength = this.config.minDescriptionLength;

            counterElement.textContent = this.config.messages.charCounter
                .replace('{length}', length)
                .replace('{min}', minLength);

            if (length >= minLength) {
                counterElement.style.color = '#10b981'; // Green
                this.descriptionField.setCustomValidity('');
            } else {
                counterElement.style.color = '#ef4444'; // Red
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

        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];

            if (file) {
                // Validate PDF only
                if (file.type !== 'application/pdf') {
                    alert(this.config.messages.pdfOnly);
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
        this.form.addEventListener('submit', async (e) => {
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
                console.error('Submission error:', error);
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
            if (field.checkValidity && !field.checkValidity()) {
                field.setAttribute('aria-invalid', 'true');
                field.parentElement.classList.add('shake');
                setTimeout(() => field.parentElement.classList.remove('shake'), 500);
            }
        });
    }

    /**
     * Submit form data to API
     * @returns {Promise<Object>} API response
     */
    async submitForm() {
        const formData = new FormData();

        // Add standard fields
        formData.append('CustomerName', document.getElementById('customerName').value);
        formData.append('CustomerEmail', document.getElementById('customerEmail').value);
        formData.append('CustomerPhone', document.getElementById('customerPhone').value || '');
        formData.append('Description', document.getElementById('description').value);
        formData.append('WorkItemType', document.getElementById('requestType').value);
        formData.append('PriorityScore', document.getElementById('priorite').value);

        // Add custom fields (tenant-specific)
        if (this.config.customFieldId) {
            const customField = document.getElementById(this.config.customFieldId);
            if (customField) {
                formData.append('Tags', `${this.config.customFieldLabel}:${customField.value}`);
            }
        }

        // Add file if present
        const file = this.fileInput?.files[0];
        if (file) {
            formData.append('Attachment', file);
        }

        // Submit to API
        const response = await fetch(this.config.apiEndpoint, {
            method: 'POST',
            body: formData
        });

        return await response.json();
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
                this.descriptionField.dispatchEvent(new Event('input'));
            }
        });
    }
}

export default PortalForm;
