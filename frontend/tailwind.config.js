/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // BUEA ONLINE SHOP brand tokens - deep navy, electric blue, cyan accent
        navy: {
          950: '#050B1A',
          900: '#0A1230',
          800: '#101B44',
          700: '#172759',
        },
        electric: {
          600: '#1755F5',
          500: '#2C6BFF',
          400: '#4C86FF',
        },
        cyan: {
          400: '#22D3EE',
          300: '#67E8F9',
        },
        promo: {
          DEFAULT: '#F5533D',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
