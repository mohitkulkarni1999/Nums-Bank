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
        navy: {
          950: '#030712',
          900: '#0A1926',
          800: '#11293e',
          700: '#183a56',
          600: '#1e4b6e',
          500: '#255b85',
          DEFAULT: '#0A1926',
        },
        gold: {
          100: '#fffbeb',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          DEFAULT: '#FFD700',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(255, 215, 0, 0.15)',
        'gold-glow-lg': '0 0 25px rgba(255, 215, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
