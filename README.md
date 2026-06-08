# Ticket Masala Marketing Site

The standalone marketing homepage for Ticket Masala - an intelligent workflow orchestration platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
masala-web/
├── index.html              # Main entry point
├── src/
│   ├── main.js             # JavaScript entry (imports CSS + logic)
│   ├── input.css           # Tailwind CSS with all styles
│   └── partials/           # Handlebars templates
│       ├── nav.hbs
│       ├── hero.hbs
│       ├── features.hbs
│       ├── solutions.hbs
│       ├── architecture.hbs
│       ├── testimonials.hbs
│       └── footer.hbs
├── images/                 # Logos and assets
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

## Tech Stack

- **Build**: Vite 5
- **CSS**: Tailwind CSS 3.4 with custom design tokens
- **Templates**: Handlebars partials
- **Fonts**: Space Grotesk, Inter, JetBrains Mono

## Features

- 🎨 **Multi-theme support**: 5 distinct visual themes (Core, Desgoffe, Whitman, Liberty, Hennessey)
- 🌐 **i18n**: Complete translations for EN, NL, FR
- ♿ **Accessible**: Skip links, ARIA attributes, focus states
- 📱 **Responsive**: Mobile-first design with offcanvas navigation
- ⚡ **Fast**: ~560ms build time, optimized assets

## Deployment

### Fly.io (Current)

```bash
fly deploy
```

### Docker Compose (Full Ecosystem)

When using `docker-compose.ecosystem.yml`, you must set required environment variables:

```bash
# Required for Gatekeeper API authentication
export GATEKEEPER_API_KEY="your-secure-random-key-here"

# Required for Grafana admin access
export GRAFANA_ADMIN_PASSWORD="your-secure-password-here"

# Then run
docker-compose -f docker-compose.ecosystem.yml up
```

**Security Note**: Never commit actual secrets to the repository. Use environment variables or a `.env` file (which is gitignored).

### Static Hosting

Build and deploy `dist/` to:

- Netlify
- Vercel
- GitHub Pages
- Any static host

## Environment

- Node.js 18+
- npm 9+

## Related Projects

- [Ticket Masala Core](https://github.com/garamatic/ticket-masala) - Main application
- [Documentation](https://ticket-masala-docs.fly.dev) - MkDocs site
# test
