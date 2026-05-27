import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        bark: 'rgb(var(--color-frontier-bark) / <alpha-value>)',
        trail: 'rgb(var(--color-frontier-trail) / <alpha-value>)',
        parchment: 'rgb(var(--color-parchment) / <alpha-value>)',
        'parchment-dark': 'rgb(var(--color-parchment-dark) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        'muted-ui': 'rgb(var(--color-muted-ui) / <alpha-value>)',
        highlight: 'rgb(var(--color-highlight) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        'success-deep': 'rgb(var(--color-success-deep) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        'danger-deep': 'rgb(var(--color-danger-deep) / <alpha-value>)',
        cta: 'rgb(var(--color-cta) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Hack-ZeroSlash', 'Fira Mono', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
