/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lol: {
          gold: '#C89B3C',
          'gold-light': '#F0D78C',
          'gold-dark': '#A67F28',
          blue: '#0AC8B9',
          'blue-light': '#2DD9CA',
          'blue-dark': '#08A093',
          dark: '#0a0e17',
          'dark-secondary': '#111827',
          'dark-tertiary': '#1a2332',
          'dark-elevated': '#1f2937',
          'dark-hover': '#374151',
        },
        hextech: {
          DEFAULT: '#0AC8B9',
          light: '#2DD9CA',
          dark: '#08A093',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'gold': '0 0 20px rgba(200, 155, 60, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
