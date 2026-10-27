/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1b2333",
        brand: { DEFAULT: "#1d4ed8", dark: "#1e3a8a", light: "#dbeafe" },
      },
    },
  },
  plugins: [],
};
