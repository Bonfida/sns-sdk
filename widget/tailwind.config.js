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
      },
      boxShadow: {
        '3xl': '0px 16px 32px rgba(215, 221, 225, 0.25)',
        'domain': '0px 20px 40px 0px rgba(179, 179, 179, 0.25)',
      },
    },
    colors: {
      'theme-primary': '#5A5DDC',
      'theme-secondary': '#E1E2FF',
      'background-primary': '#FFFFFF',
      'background-secondary': '#FFFFFF',
      'background-tertiary': '#F5F7FF',
      'field-border': '#D7DDE1',
      'text-primary': '#090A21',
      'text-secondary': '#585858',
      'accent': '#E7AA71',
      // 'theme-primary': '#3A3CA9',
      // 'theme-secondary': '#B0B1D7',
      // 'background-primary': '#111111',
      // 'background-secondary': '#333333',
      // 'background-tertiary': '#30303E',
      // 'text-primary': '#D9D9D9',
      // 'text-secondary': '#CCCCCC',
      // 'accent': '#FFD700',
    },
  },
  plugins: [],
};
