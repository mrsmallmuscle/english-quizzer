/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#22c55e',
        danger:  '#ef4444',
        warning: '#f59e0b',
      },
      animation: {
        'bounce-in': 'bounceIn 0.4s ease',
        'shake': 'shake 0.4s ease',
        'pop': 'pop 0.2s ease',
      },
      keyframes: {
        bounceIn: {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%':     { transform: 'translateX(-6px)' },
          '40%':     { transform: 'translateX(6px)' },
          '60%':     { transform: 'translateX(-4px)' },
          '80%':     { transform: 'translateX(4px)' },
        },
        pop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
