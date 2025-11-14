/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spot-dark': '#101827',
        'spot-darker': '#0c121e',
        'spot-blue': '#1f4068',
        'spot-light': '#e0f4f4',
        'spot-cyan': '#00f0ff',
        'spot-cyan-dark': '#00aabf',
      },
      fontFamily: {
        'sans': ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(0, 240, 255, 0.3), 0 0 5px rgba(0, 240, 255, 0.2)',
        'cyan-glow-lg': '0 0 40px rgba(0, 240, 255, 0.6), 0 0 15px rgba(0, 240, 255, 0.4)',
      }
    },
  },
  plugins: [],
}