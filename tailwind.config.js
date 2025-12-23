/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,hbs}"],
  theme: {
    extend: {
      colors: {
        // Brand colors mapped to CSS variables
        primary: 'var(--color-primary)',
        'masala-hover': 'var(--color-masala-hover)',
        'masala-surface': 'var(--color-masala-surface)',
        
        // Background colors
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        'surface-elevated': 'var(--bg-surface-elevated)',
        
        // Border colors
        structural: 'var(--border-structural)',
        'border-structural': 'var(--border-structural)',
        'border-subtle': 'var(--border-subtle)',
        
        // Text colors
        'text-primary': 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        'text-secondary': 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',
        
        // Status colors
        success: 'var(--status-success)',
        warning: 'var(--status-warning)',
        error: 'var(--status-error)',
        info: '#0ea5e9',
        accent: 'var(--status-success)',
        
        // Window dots (code window decoration)
        'window-red': '#ff5f56',
        'window-yellow': '#ffbd2e',
        'window-green': '#27c93f',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'component': 'var(--radius-component)',
      },
    },
  },
  plugins: [],
}
