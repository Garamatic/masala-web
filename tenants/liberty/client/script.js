// Liberty Systems Portal - The Newsroom
// Markdown editor with preview and code highlighting

const __API_BASE = window.__API_BASE__ || 'http://localhost:5000';
const API_ENDPOINT = `${__API_BASE}/api/portal/submit`;

// Tab switching
const tabButtons = document.querySelectorAll('.tab-btn');
const descriptionTextarea = document.getElementById('description');
const previewDiv = document.getElementById('preview');

tabButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        const tab = this.dataset.tab;

        tabButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        if (tab === 'write') {
            descriptionTextarea.style.display = 'block';
            previewDiv.style.display = 'none';
        } else {
            descriptionTextarea.style.display = 'none';
            previewDiv.style.display = 'block';
            updatePreview();
        }
    });
});

// Basic input sanitization (strip HTML tags)
function sanitizeInput(input) {
    if (!input) return '';
    return String(input).replace(/<[^>]*>/g, '');
}

// Basic sanitization for self-rendered preview (not a full sanitizer).
// Parses through an inert <template> so scripts/images do not execute
// during the parse phase, then strips events and dangerous hrefs.
function sanitizePreviewHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const content = template.content;

    // Remove script tags and event handlers
    content.querySelectorAll('script').forEach(el => el.remove());
    content.querySelectorAll('*').forEach(el => {
        const attrs = Array.from(el.attributes);
        attrs.forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });
        // Strip javascript: and data: URLs from href/src
        if (el.tagName === 'A') {
            const href = el.getAttribute('href');
            if (href && (/^javascript:/i.test(href) || /^data:/i.test(href))) {
                el.removeAttribute('href');
            }
        }
    });

    const wrapper = document.createElement('div');
    wrapper.appendChild(content.cloneNode(true));
    return wrapper.innerHTML;
}

// Update markdown preview
function updatePreview() {
    const markdown = descriptionTextarea.value;
    const rawHtml = window.marked.parse(markdown);
    previewDiv.innerHTML = sanitizePreviewHtml(rawHtml);

    // Highlight code blocks
    previewDiv.querySelectorAll('pre code').forEach(block => {
        window.hljs.highlightElement(block);
    });
}

// Auto-update preview on input (debounced)
let previewTimeout;
descriptionTextarea.addEventListener('input', function () {
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(() => {
        if (document.querySelector('.tab-btn[data-tab="preview"]').classList.contains('active')) {
            updatePreview();
        }
    }, 500);
});

// File upload
const fileInput = document.getElementById('screenshot');
const fileNameDisplay = document.getElementById('fileName');

fileInput.addEventListener('change', function (e) {
    const fileName = e.target.files[0]?.name || 'Choose file...';
    fileNameDisplay.textContent = fileName;
});

// Form submission
const form = document.getElementById('issueForm');
const loadingOverlay = document.getElementById('loadingOverlay');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    loadingOverlay.style.display = 'flex';

    try {
        const formData = new FormData();

        formData.append(
            'CustomerName',
            sanitizeInput(document.getElementById('reporterName').value)
        );
        formData.append(
            'CustomerEmail',
            sanitizeInput(document.getElementById('reporterEmail').value)
        );
        formData.append(
            'Description',
            `**${sanitizeInput(document.getElementById('title').value)}**\n\n${sanitizeInput(descriptionTextarea.value)}`
        );
        formData.append('WorkItemType', sanitizeInput(document.getElementById('issueType').value));
        formData.append('PriorityScore', document.getElementById('priority').value);

        // Add environment tag
        const environment = document.getElementById('environment').value;
        if (environment) {
            formData.append('Tags', `Environment:${sanitizeInput(environment)}`);
        }

        // Add file
        const file = fileInput.files[0];
        if (file) {
            formData.append('Attachment', file);
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('submissionResult', JSON.stringify(result));
            window.location.href = 'success.html';
        } else {
            throw new Error(result.message || 'Submission failed');
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('An error occurred while submitting the issue. Please try again.');
        loadingOverlay.style.display = 'none';
    }
});
