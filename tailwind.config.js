/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        verde: {
          50:  '#f0fdf0',
          100: '#dcfce7',
          200: '#c8e6c9',
          300: '#86efac',
          400: '#4ade80',
          500: '#2e8b57',
          600: '#1a5c2a',
          700: '#14532d',
          800: '#0f3d1f',
          900: '#052e10',
        },
        limone: {
          100: '#fefde8',
          200: '#fef9c3',
          300: '#fef08a',
          400: '#fde047',
          500: '#f9a825',
          600: '#d97706',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
