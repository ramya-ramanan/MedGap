/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medblue: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38aaf7',
          500: '#0b72c9',
          600: '#0258a5',
          700: '#034785',
          800: '#073d6e',
          900: '#0c345c',
          950: '#07213d',
        },
        medteal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'soft': '0 4px 12px -2px rgba(0,0,0,0.05), 0 2px 6px -2px rgba(0,0,0,0.03)',
        'soft-md': '0 8px 24px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -4px rgba(15, 23, 42, 0.04)',
        'soft-lg': '0 16px 36px -6px rgba(15, 23, 42, 0.08), 0 8px 20px -6px rgba(15, 23, 42, 0.05)',
        'card': '0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
      }
    },
  },
  plugins: [],
}
