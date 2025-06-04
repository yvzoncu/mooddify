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
    },
  },
  plugins: [
    scrollbar({ nocompatible: true }),
  ],
};

export default config; 