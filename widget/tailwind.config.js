/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        primary: ['"Gantari"', "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "20%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "width-to-zero": {
          from: { width: "100%" },
          to: { width: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 1s linear",
        "modal-fade-in": "fade-in 200ms linear",
        "width-to-zero": "width-to-zero 4s forwards",
      },
      boxShadow: {
        "3xl": "0px 16px 32px rgba(215, 221, 225, 0.25)",
        domain: "0px 20px 40px 0px rgba(179, 179, 179, 0.25)",
      },
    },
    colors: {
      "theme-primary": "rgba(var(--theme-primary), <alpha-value>)",
      "theme-secondary": "rgba(var(--theme-secondary), <alpha-value>)",
      "background-primary": "rgba(var(--background-primary), <alpha-value>)",
      "background-secondary": "rgba(var(--background-secondary), <alpha-value>)",
      "background-tertiary": "rgba(var(--background-tertiary), <alpha-value>)",
      "background-skeleton": "rgba(var(--background-skeleton), <alpha-value>)",
      "background-interactive": "rgba(var(--background-interactive), <alpha-value>)",
      "interactive-border": "rgba(var(--interactive-border), <alpha-value>)",
      "field-border": "rgba(var(--field-border), <alpha-value>)",
      "text-primary": "rgba(var(--text-primary), <alpha-value>)",
      "text-secondary": "rgba(var(--text-secondary), <alpha-value>)",
      accent: "rgba(var(--accent), <alpha-value>)",
      error: "rgba(var(--error), <alpha-value>)",
      success: "rgba(var(--success), <alpha-value>)",

      // components
      "modal-overlay-bg": "rgba(var(--modal-overlay-bg), <alpha-value>)",
      "base-button-content": "rgba(var(--base-button-content), <alpha-value>)",
    },
  },
  plugins: [],
};
