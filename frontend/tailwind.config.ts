import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vox: {
          bg: {
            base: 'var(--vox-bg-base)',
            'base-light': '#F8FAFC',
          },
          surface: {
            1: 'var(--vox-surface-1)',
            2: 'var(--vox-surface-2)',
            3: 'var(--vox-surface-3)',
            4: 'var(--vox-surface-4)',
          },
          border: {
            subtle: 'var(--vox-border-subtle)',
            medium: 'var(--vox-border-medium)',
            strong: 'var(--vox-border-strong)',
            active: 'var(--vox-border-active)',
          },
          text: {
            primary: 'var(--vox-text-primary)',
            secondary: 'var(--vox-text-secondary)',
            muted: 'var(--vox-text-muted)',
            disabled: 'var(--vox-text-disabled)',
          },
          accent: {
            gold: 'var(--vox-accent-gold)',
            'gold-hover': 'var(--vox-accent-gold-hover)',
            'gold-glow': 'var(--vox-accent-gold-glow)',
          },
          state: {
            success: 'var(--vox-state-success)',
            'success-bg': 'var(--vox-state-success-bg)',
            warning: 'var(--vox-state-warning)',
            'warning-bg': 'var(--vox-state-warning-bg)',
            danger: 'var(--vox-state-danger)',
            'danger-bg': 'var(--vox-state-danger-bg)',
            info: 'var(--vox-state-info)',
            'info-bg': 'var(--vox-state-info-bg)',
          },
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'vox-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'vox-active': '0 0 0 1px var(--vox-border-active), 0 8px 30px -4px rgba(245, 158, 11, 0.15)',
        'vox-modal': '0 24px 60px -12px rgba(0, 0, 0, 0.8)',
      },
      transitionTimingFunction: {
        'vox-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'vox-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        instant: '75ms',
        fast: '150ms',
        normal: '250ms',
        complex: '450ms',
        ceremony: '800ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
