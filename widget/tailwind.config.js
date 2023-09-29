/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'primary': ['"Gantari"', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '20%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fade-in 1s linear',
      }
    },
    colors: {
      'theme-primary': '#3A3CA9',
      'theme-secondary': '#B0B1D7',
      'background-primary': '#111111',
      'background-secondary': '#333333',
      'background-tertiary': '#30303E',
      'text-primary': '#D9D9D9',
      'text-secondary': '#CCCCCC',
      'accent': '#FFD700',
    },
  },
  plugins: [],
};
