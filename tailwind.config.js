/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        critical: 'var(--critical)',
        high: 'var(--high)',
        moderate: 'var(--moderate)',
        low: 'var(--low)',
        info: 'var(--info)',
        // seqoy Official Brand Palette: Pulse Crimson, Deep Navy, Pure White
        scarlet: {
          DEFAULT: '#A61C26',
          deep: '#87151E',
          bright: '#BE2324',
          soft: '#FDF2F3',
        },
        crimson: {
          DEFAULT: '#A61C26',
          deep: '#87151E',
          bright: '#BE2324',
          soft: '#FDF2F3',
          border: '#F3D0D3',
        },
        navy: {
          DEFAULT: '#1F274B',
          deep: '#111828',
          muted: '#475569',
          soft: '#EEF1F7',
          border: '#D4DBE8',
        },
        // Alias mapped to Deep Navy so no legacy green leaks anywhere
        jungle: {
          DEFAULT: '#1F274B',
          deep: '#111828',
          muted: '#475569',
          soft: '#EEF1F7',
          border: '#D4DBE8',
        },
        // Legacy / clinical app tokens aligned to brand palette
        brand: '#A61C26',
        'brand-deep': '#87151E',
        ink: '#1F274B',
        'ink-soft': '#475569',
        lilac: '#eeeafe',
        mint: '#EEF1F7',
        peach: '#feebdf',
        blush: '#FDF2F3',
        butter: '#fbf3d6',
        canvas: '#F8FAFC',
        'emerald-soft': '#1F274B',
        'amber-soft': '#d97706',
        'rose-soft': '#A61C26',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        manrope: ['var(--font-manrope)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        floaty2: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(12px)' },
        },
        floatyCard: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseTravel: {
          '0%': { strokeDashoffset: '520' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        floaty: 'floaty 9s ease-in-out infinite',
        'floaty-2': 'floaty2 11s ease-in-out infinite',
        'floaty-card': 'floatyCard 7s ease-in-out infinite',
        'pulse-travel': 'pulseTravel 5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
