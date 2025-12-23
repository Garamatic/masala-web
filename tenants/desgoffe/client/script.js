// Desgoffe Portal - Guichet Citoyen
// Form submission and validation logic

// Configuration
const API_BASE_URL = 'https://ticket-masala-api-desgoffe.fly.dev'; // Production URL
const API_ENDPOINT = `${API_BASE_URL}/api/portal/submit`;

// Character counter for description
const descriptionField = document.getElementById('description');
const MIN_DESCRIPTION_LENGTH = 10;

// Accessibility: Real-time validation
document.querySelectorAll('input, select, textarea').forEach(input => {
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

if (descriptionField) {
    // Create character counter element
    const counterElement = document.createElement('small');
    counterElement.className = 'char-counter';
    counterElement.style.cssText = 'display: block; margin-top: 0.5rem; color: #666;';
    descriptionField.parentNode.insertBefore(counterElement, descriptionField.nextSibling);

    // Update counter on input
    descriptionField.addEventListener('input', function () {
        const length = this.value.length;
        counterElement.textContent = `${length} / ${MIN_DESCRIPTION_LENGTH} caractères minimum`;

        if (length >= MIN_DESCRIPTION_LENGTH) {
            counterElement.style.color = '#10b981'; // Green
            this.setCustomValidity('');
        } else {
            counterElement.style.color = '#ef4444'; // Red
            this.setCustomValidity(`Veuillez saisir au moins ${MIN_DESCRIPTION_LENGTH} caractères`);
        }
    });

    // Trigger initial update
    descriptionField.dispatchEvent(new Event('input'));
}

// File upload handling
const fileInput = document.getElementById('attachment');
const fileNameDisplay = document.getElementById('fileName');

if (fileInput) {
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            // Validate PDF only
            if (file.type !== 'application/pdf') {
                alert('Seuls les fichiers PDF sont acceptés.');
                this.value = '';
                fileNameDisplay.textContent = 'Choisir un fichier PDF';
                return;
            }
            fileNameDisplay.textContent = file.name;
        } else {
            fileNameDisplay.textContent = 'Choisir un fichier PDF';
        }
    });
}

// Form submission
const form = document.getElementById('submissionForm');
const loadingOverlay = document.getElementById('loadingOverlay');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validate form
    if (!form.checkValidity()) {
        // Highlight invalid fields
        Array.from(form.elements).forEach(field => {
            if (field.checkValidity && !field.checkValidity()) {
                field.setAttribute('aria-invalid', 'true');
                field.parentElement.classList.add('shake');
                setTimeout(() => field.parentElement.classList.remove('shake'), 500);
            }
        });

        form.reportValidity();
        return;
    }

    // Show loading overlay
    loadingOverlay.style.display = 'flex';

    try {
        // Prepare form data
        const formData = new FormData();

        formData.append('CustomerName', document.getElementById('customerName').value);
        formData.append('CustomerEmail', document.getElementById('customerEmail').value);
        formData.append('CustomerPhone', document.getElementById('customerPhone').value || '');
        formData.append('Description', document.getElementById('description').value);
        formData.append('WorkItemType', document.getElementById('requestType').value);
        formData.append('PriorityScore', document.getElementById('priorite').value);

        // Add custom fields
        const quartier = document.getElementById('quartier').value;
        formData.append('Tags', `Quartier:${quartier}`);

        // Add file if present
        const file = fileInput.files[0];
        if (file) {
            formData.append('Attachment', file);
        }

        // Submit to API
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Redirect to success page
            sessionStorage.setItem('submissionResult', JSON.stringify(result));
            window.location.href = 'success.html';
        } else {
            throw new Error(result.message || 'Erreur lors de la soumission');
        }

    } catch (error) {
        console.error('Submission error:', error);
        alert('Une erreur est survenue lors de la soumission de votre demande. Veuillez réessayer.');
        loadingOverlay.style.display = 'none';
    }
});

// Form reset
form.addEventListener('reset', function () {
    fileNameDisplay.textContent = 'Choisir un fichier PDF';
    if (descriptionField) {
        descriptionField.dispatchEvent(new Event('input'));
    }
});
