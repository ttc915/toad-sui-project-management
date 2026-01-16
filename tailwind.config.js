/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        teal: {
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
        light: {
          bg: '#F7F5F0',
          card: '#FFFFFF',
          border: '#E5E7EB',
        },
        dark: {
          bg: '#050509',
          card: '#15151F',
          border: '#1F2933',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 20px 30px rgba(15, 23, 42, 0.08)',
        'card-dark': '0 20px 30px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
