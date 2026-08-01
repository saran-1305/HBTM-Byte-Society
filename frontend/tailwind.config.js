/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          500: '#6366F1',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        emerald: {
          500: '#10B981',
        },
        amber: {
          500: '#F59E0B',
        },
        // Brand palette: dark teal / teal / mint / cream
        ink: {
          500: '#28504A',
          600: '#1F3F3A',
          700: '#17302B',
          800: '#122622',
          900: '#0D1D19',
        },
        brand: {
          50: '#EEF6F2',
          100: '#D7EBE1',
          200: '#AFD7C4',
          300: '#82C0A4',
          400: '#59A886',
          500: '#3E8A70',
          600: '#327361',
          700: '#285D4E',
          800: '#1F4A3F',
          900: '#173A32',
        },
        mint: {
          50: '#EFFBF4',
          100: '#DAF5E5',
          200: '#B3EACB',
          300: '#8FDCB2',
          400: '#66C994',
          500: '#45B27A',
          600: '#359465',
          700: '#2A7853',
        },
        sand: {
          50: '#FEFAF2',
          100: '#FCF1DC',
          200: '#F7E4BE',
          300: '#EFD08F',
        },
        // TIDAL-inspired dark system: true black canvas, elevated grey
        // surfaces, one bright red focal accent.
        surface: {
          DEFAULT: '#121212',
          hover: '#1A1A1A',
        },
        navactive: '#2A2A2A',
        spotlight: {
          DEFAULT: '#E50914',
          dark: '#C40812',
        },
        muted: '#999999',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-in': 'fadeIn 0.25s ease-out',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      spacing: {
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      },
    },
  },
  plugins: [],
}
