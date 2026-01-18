import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PortalForm } from './portal-form.js';

describe('PortalForm', () => {
    let config;
    let portalForm;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <form id="testForm">
                <input id="customerName" value="Test User" />
                <input id="customerEmail" value="test@example.com" />
                <input id="customerPhone" value="" />
                <textarea id="description">Test Description</textarea>
                <select id="requestType"><option value="Bug">Bug</option></select>
                <select id="priorite"><option value="1">1</option></select>
                <input type="file" id="attachment" />
                <div id="fileName"></div>
                <div id="loadingOverlay"></div>
            </form>
        `;

        config = {
            formId: 'testForm',
            apiEndpoint: '/api/submit',
            messages: {
                pdfOnly: 'PDF only!',
                chooseFile: 'Choose file',
                submitError: 'Error',
                charCounter: '{length}/{min}',
                charCounterError: 'Min {min} chars'
            }
        };

        portalForm = new PortalForm(config);
    });

    describe('sanitizeInput', () => {
        it('should strip script tags', () => {
            const input = '<script>alert("xss")</script>Hello';
            // Tags stripped, then distinct characters escaped
            expect(portalForm.sanitizeInput(input)).toBe('alert(&quot;xss&quot;)Hello');
        });

        it('should escape HTML characters', () => {
            const input = '<b>Bold</b> & "Quote"';
            // Tags stripped, then characters escaped
            expect(portalForm.sanitizeInput(input)).toBe('Bold &amp; &quot;Quote&quot;');
        });

        it('should handle empty input', () => {
            expect(portalForm.sanitizeInput(null)).toBe('');
            expect(portalForm.sanitizeInput(undefined)).toBe('');
        });
    });

    describe('File Validation', () => {
        it('should validate PDF type via file upload handler (simulation)', () => {
            // Since we can't easily trigger the change event and check alert without more mocking,
            // we'll check the logic if we could isolate it, but given strictly "Vanilla JS" class structure,
            // we will simulate the check manually or mock alert.
            globalThis.alert = vi.fn();
            
            const fileInput = document.getElementById('attachment');
            const badFile = new File(['content'], 'test.txt', { type: 'text/plain' });
            
            // Dispatch change event
            // Note: DataTransfer is needed to set files in jsdom usually, or Object.defineProperty
            Object.defineProperty(fileInput, 'files', { value: [badFile] });
            
            // Re-attach listener because we re-created DOM but PortalForm attached to old DOM? 
            // No, beforeEach runs before every test.
            // We need to call init() to attach listeners.
            portalForm.init();

            fileInput.dispatchEvent(new Event('change'));

            expect(globalThis.alert).toHaveBeenCalledWith(config.messages.pdfOnly);
            expect(fileInput.value).toBe(''); 
        });

        it('should reject files larger than 5MB', () => {
            globalThis.alert = vi.fn();
            portalForm.init();
            
            const fileInput = document.getElementById('attachment');
            // Mock a large file
            const largeFile = { 
                name: 'large.pdf', 
                type: 'application/pdf', 
                size: 6 * 1024 * 1024 // 6MB
            };
            
            Object.defineProperty(fileInput, 'files', { value: [largeFile] });
            fileInput.dispatchEvent(new Event('change'));

            // Check if alert was called with size message
            expect(globalThis.alert).toHaveBeenCalled();
            expect(globalThis.alert.mock.calls[0][0]).toContain('File size exceeds');
        });
    });
});
