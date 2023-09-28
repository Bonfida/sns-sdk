/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'primary': ['"Gantari"', 'sans-serif'],
      },
    },
    colors: {
      'theme-primary': '#3A3CA9',
      'theme-secondary': '#B0B1D7',
      'bg-primary': '#111111',
      'bg-secondary': '#333333',
      'bg-tertiary': '#30303E',
      'text-primary': '#D9D9D9',
      'text-secondary': '#CCCCCC',
      'accent': '#FFD700',
    },
  },
  plugins: [],
};
