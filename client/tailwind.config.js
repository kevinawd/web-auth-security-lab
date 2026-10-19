/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand': '#EA6D23',
        'brand-dark': '#1F1F1F'
      }
    }
  },
  plugins: []
};
