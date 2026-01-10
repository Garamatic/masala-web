# Contributing to Masala-Web

Welcome to the **Masala-Web** project! This guide will help you understand our multi-tenant architecture and development standards.

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- NPM

### Installation

```bash
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

### Testing

Run the automated test suite (Vitest):

```bash
npm test
```

## 🏗 Architecture Overview

**Masala-Web** is a static, multi-tenant web application built with **Vite**, **Tailwind CSS**, and **Vanilla JavaScript**.

### Key Directories

- **`tenants/`**: Contains all tenant-specific configurations and pages.
  - Each tenant has its own subfolder (e.g., `tenants/desgoffe/`).
  - **`config/masala_config.json`**: Controls tenant-specific features and text.
  - **`index.html`**: The tenant's entry point.
- **`src/`**: Shared source code.
  - **`components/`**: UI logic (Navbar, Reveal, etc.).
  - **`shared/`**: Business logic (PortalForm).
  - **`i18n/`**: Translation files.
- **`public/`**: Static assets.

### Design System

We use **Tailwind CSS** for styling.

- **Do not** use external CSS frameworks like Bootstrap.
- **Do not** write extensive custom CSS unless absolutely necessary (e.g., complex animations).
- The design system relies on a consistent usage of Tailwind utility classes.

## ➕ Adding a New Tenant

1. **Duplicate** an existing tenant folder (e.g., `tenants/demos/` or `tenants/desgoffe/`).
2. **Rename** the folder to your new tenant ID.
3. **Update `config/masala_config.json`**:
    - Change `appName`, `subtitle`, and `locale`.
4. **Update `index.html`**:
    - Adjust the title and specific layout if needed.
    - Ensure it imports the shared CSS and JS correctly.

## 🛡 Development Standards

### JavaScript

- Use **ES Modules** (`import`/`export`).
- Keep components focused and small (Single Responsibility).
- Avoid heavy external dependencies (KISS).

### Security

- **PortalForm**: Always use the shared `PortalForm` class for form submissions.
  - It handles **Input Sanitization** automatically.
  - It enforces **File Size Limits** (5MB) and Type Checks.
- **CSRF**: The app supports `X-CSRF-Token` headers. Ensure your HTML includes the meta tag if the backend requires it.

### Testing

- We use **Vitest** for unit testing.
- Always run `npm test` before pushing changes.
- Add tests for any new logic in `src/shared/` or `src/i18n/`.

## 🤝 Code of Conduct

Keep code clean, comment complex logic, and respect the "Vanilla" approach.
