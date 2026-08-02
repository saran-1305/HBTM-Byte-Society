/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: "#3A2E27",
        accent: "var(--accent-primary)",
        background: "var(--bg-main)",
        surface: "var(--bg-surface)",
        muted: "var(--text-muted)",
        border: "var(--border-subtle)",
        brandgreen: "#1D9E75",
        textprimary: "#3A2E27",
      },
      keyframes: {
        'blob-drift': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'blob-drift': 'blob-drift 25s infinite alternate ease-in-out',
        'fade-in-up': 'fade-in-up 400ms ease-out both',
      }
    },
  },
  plugins: [],
}


