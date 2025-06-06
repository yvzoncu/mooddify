import type { Config } from 'tailwindcss';
import scrollbar from 'tailwind-scrollbar';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        custom: {
          'scrollbar-thumb': '#4A5568',
          'scrollbar-track': '#2D3748',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(1.5)',
            opacity: '0',
          },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        'shake-once': {
          '0%, 100%': { transform: 'rotate(0)' },
          '20%': { transform: 'rotate(-15deg)' },
          '40%': { transform: 'rotate(15deg)' },
          '60%': { transform: 'rotate(-7deg)' },
          '80%': { transform: 'rotate(7deg)' }
        }
      },
      animation: {
        float: 'float 2s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        ping: 'ping 1.5s ease-in-out infinite',
        bounce: 'bounce 1s infinite',
        'shake': 'shake-once 1s ease-in-out infinite'
      },
    },
  },
  plugins: [
    scrollbar({ nocompatible: true }),
  ],
};

export default config; 