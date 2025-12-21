# Ticket Masala Marketing Site

This is the standalone marketing homepage for Ticket Masala.

## Purpose

Separate commercial/marketing site that showcases Ticket Masala features without being part of tenant deployments.

## Structure

```
marketing-site/
├── index.html          # Main homepage
├── css/                # Copied from main app
├── images/             # Logos and assets
└── README.md           # This file
```

## Deployment

This can be deployed separately as a static site to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting

## Development

```bash
# Serve locally
python -m http.server 8000

# Or use any static file server
npx serve .
```

## Links

- **Live Demos**: Links to `tenants/site/demos.html`
- **Documentation**: Links to MkDocs site
- **GitHub**: Repository link

## vs. Tenant Apps

The tenant applications (`government`, `software-dev`, `rail-infrastructure`, `science`) redirect their root routes directly to login pages and do NOT show this marketing content.

This keeps commercial messaging separate from production deployments.
