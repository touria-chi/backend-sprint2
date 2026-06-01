/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        azure: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#baddfd',
          300: '#7dc5fc',
          400: '#37a7f9',
          500: '#0d8bea',
          600: '#026ec8',
          700: '#0358a2',
          800: '#074b85',
          900: '#0c3f6e',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        }
      },
      boxShadow: {
        'soft': '0 2px 20px rgba(0,0,0,0.06)',
        'card': '0 4px 24px rgba(13,139,234,0.08)',
        'glow': '0 0 40px rgba(13,139,234,0.15)',
      }
    },
  },
  plugins: [],
}
