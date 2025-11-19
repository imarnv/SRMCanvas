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
        burgundy: {
          500: "#991b1b",
          600: "#7f1d1d",
        },
        maroon: {
          700: "#7f1d1d",
        },
      },
    },
  },
  plugins: [],
}