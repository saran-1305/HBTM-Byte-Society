/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--accent-primary)",
        background: "var(--bg-main)",
        surface: "var(--bg-surface)",
        muted: "var(--text-muted)",
        border: "var(--border-subtle)",
      }
    },
  },
  plugins: [],
}

