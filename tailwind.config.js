/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a0a1a',
        secondary: '#0d0d2b',
        accent: '#1a0a2e',
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        emerald: {
          400: '#34d399',
        },
        rose: {
          400: '#fb7185',
        },
      },
    },
  },
  plugins: [],
}