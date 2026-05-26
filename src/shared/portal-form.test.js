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
                charCounterError: 'Min {min} chars',
            },
        };

        portalForm = new PortalForm(config);
    });

    describe('sanitizeInput', () => {
        it('should strip script tags', () => {
            const input = '<script>alert("xss")</script>Hello';
            expect(portalForm.sanitizeInput(input)).toBe('alert("xss")Hello');
        });

        it('should strip HTML tags while preserving text', () => {
            const input = '<b>Bold</b> & "Quote"';
            expect(portalForm.sanitizeInput(input)).toBe('Bold & "Quote"');
        });

        it('should handle empty input', () => {
            expect(portalForm.sanitizeInput(null)).toBe('');
            expect(portalForm.sanitizeInput(undefined)).toBe('');
            expect(portalForm.sanitizeInput('')).toBe('');
        });
    });

    describe('File Validation', () => {
        it('should validate PDF type via file upload handler', () => {
            globalThis.alert = vi.fn();
            portalForm.init();

            const fileInput = document.getElementById('attachment');
            const badFile = new File(['content'], 'test.txt', { type: 'text/plain' });
            Object.defineProperty(fileInput, 'files', { value: [badFile] });

            fileInput.dispatchEvent(new Event('change'));

            expect(globalThis.alert).toHaveBeenCalledWith(config.messages.pdfOnly);
            expect(fileInput.value).toBe('');
        });

        it('should reject files larger than 5MB', () => {
            globalThis.alert = vi.fn();
            portalForm.init();

            const fileInput = document.getElementById('attachment');
            const largeFile = {
                name: 'large.pdf',
                type: 'application/pdf',
                size: 6 * 1024 * 1024, // 6MB
            };

            Object.defineProperty(fileInput, 'files', { value: [largeFile] });
            fileInput.dispatchEvent(new Event('change'));

            expect(globalThis.alert).toHaveBeenCalled();
            expect(globalThis.alert.mock.calls[0][0]).toContain('File size exceeds');
        });

        it('should accept PDF by extension when MIME type is missing', () => {
            globalThis.alert = vi.fn();
            portalForm.init();

            const fileInput = document.getElementById('attachment');
            const fileNameDisplay = document.getElementById('fileName');
            const fileWithBadMime = {
                name: 'report.pdf',
                type: '', // Some systems report empty MIME type for PDFs
                size: 1024,
            };

            Object.defineProperty(fileInput, 'files', { value: [fileWithBadMime] });
            fileInput.dispatchEvent(new Event('change'));

            expect(globalThis.alert).not.toHaveBeenCalled();
            expect(fileNameDisplay.textContent).toBe('report.pdf');
        });
    });
});
