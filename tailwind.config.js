/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gunma-bg': '#1a1a1a',
        'gunma-accent': '#39ff14', // Keeping accent for compat, adding lime
        'gunma-lime': '#39ff14',
        'gunma-text': '#f5f5f0',
        'gunma-konnyaku': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'pixel': ['monospace'],
        'dotgothic': ['DotGothic16', 'sans-serif'],
      },
    },
  },
  plugins: [],
}



