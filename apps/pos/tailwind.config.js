/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Verdant" green accent + calm neutral surfaces
        verdant: {
          50: "#eefbf3",
          100: "#d6f5e0",
          200: "#afeac6",
          300: "#79d8a4",
          400: "#41bd7e",
          500: "#1ea463",
          600: "#12834f",
          700: "#106842",
          800: "#105337",
          900: "#0f442f",
          950: "#06281b",
        },
        surface: {
          DEFAULT: "#0f1a14",
          raised: "#16241c",
          panel: "#1c2e24",
          border: "#2a4034",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
