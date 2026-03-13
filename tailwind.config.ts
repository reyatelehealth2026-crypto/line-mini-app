import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        line: {
          DEFAULT: '#06C755',
          dark: '#059B42',
          soft: '#e8fff1',
          muted: '#b4f0cd'
        },
        brand: {
          50: '#f0fdf6',
          100: '#dcfce9',
          200: '#bbf7d4',
          300: '#86efad',
          400: '#4ade7f',
          500: '#06C755',
          600: '#059B42',
          700: '#047736',
          800: '#065f2e',
          900: '#064e27'
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9'
        }
      },
      boxShadow: {
        soft: '0 2px 16px rgba(15, 23, 42, 0.06)',
        card: '0 4px 24px rgba(15, 23, 42, 0.08)',
        glow: '0 0 20px rgba(6, 199, 85, 0.15)',
        'inner-soft': 'inset 0 2px 4px rgba(15, 23, 42, 0.04)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-sans-thai)', 'system-ui', 'sans-serif']
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-up': 'slide-up 0.5s ease-out both',
        'scale-in': 'scale-in 0.3s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
}

export default config
