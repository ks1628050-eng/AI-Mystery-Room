/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        noir: {
          950: '#09090b',
          900: '#111113',
          850: '#18181b',
          800: '#202024',
          700: '#2e2e33',
          600: '#45454d',
        },
        detective: {
          amber: '#f59e0b',
          amberGlow: '#d97706',
          crimson: '#e11d48',
          blood: '#9f1239',
          cork: '#92613d',
          corkDark: '#704828',
          paper: '#fef3c7',
          tape: '#fde047',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"Courier Prime"', '"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'noir-glow': '0 0 25px rgba(245, 158, 11, 0.15)',
        'crimson-glow': '0 0 25px rgba(225, 29, 72, 0.25)',
        'cork-inner': 'inset 0 0 40px rgba(0, 0, 0, 0.75)',
      },
      backgroundImage: {
        'vignette': 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,7,0.9) 100%)',
      },
    },
  },
  plugins: [],
}
