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
        // SEQOY Pastel Clinical Tokens (from care-connect-network)
        brand: '#7c89f2',
        'brand-deep': '#5b6be0',
        ink: '#232838',
        'ink-soft': '#5a6379',
        lilac: '#eeeafe',
        mint: '#dff5ec',
        peach: '#feebdf',
        blush: '#f7dde6',
        butter: '#fbf3d6',
        canvas: '#fcfbf9',
        'emerald-soft': '#34d399',
        'amber-soft': '#f59e0b',
        'rose-soft': '#f43f5e',
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
      },
      animation: {
        floaty: 'floaty 9s ease-in-out infinite',
        'floaty-2': 'floaty2 11s ease-in-out infinite',
        'floaty-card': 'floatyCard 7s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
