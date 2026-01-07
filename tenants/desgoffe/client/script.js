// Desgoffe Portal - Guichet Citoyen
// Form submission and validation logic

import { PortalForm } from '../../../src/shared/portal-form.js';

// Configuration for Desgoffe tenant
const config = {
    formId: 'submissionForm',
    apiEndpoint: 'https://ticket-masala-api-desgoffe.fly.dev/api/portal/submit',
    locale: 'fr',
    minDescriptionLength: 10,
    customFieldId: 'quartier',
    customFieldLabel: 'Quartier',
    messages: {
        charCounter: '{length} / {min} caractères minimum',
        charCounterError: 'Veuillez saisir au moins {min} caractères',
        pdfOnly: 'Seuls les fichiers PDF sont acceptés.',
        chooseFile: 'Choisir un fichier PDF',
        submitError: 'Une erreur est survenue lors de la soumission de votre demande. Veuillez réessayer.'
    }
};

// Initialize form
const portalForm = new PortalForm(config);
portalForm.init();
