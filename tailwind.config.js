/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Class-based dark mode
  theme: {
    extend: {
      colors: {
        'neon-pink': '#ff2d92',
        'neon-purple': '#9d4edd',
        'neon-cyan': '#00f5ff',
        'neon-blue': '#3b82f6',
        'neon-blue-soft': '#60a5fa',
        'neon-blue-dim': '#1e40af',
        'dark-bg': '#0a0a0f',
      },
      animation: {
        'border-spin': 'border-spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        'border-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px #ff2d92, 0 0 40px #ff2d92',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 40px #9d4edd, 0 0 80px #9d4edd',
            opacity: '0.8'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'typing': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

