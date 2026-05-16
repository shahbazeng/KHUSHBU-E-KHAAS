/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light Theme Palette
        gold: {
          DEFAULT: "#B8860B", // Thora deep gold jo light bg par nazar aaye
          soft: "#D4AF37",
        },
        ivory: "#FAFAFA",
        softGrey: "#F2F2F2",
        brandDark: "#1A1A1A", // Text ke liye professional dark grey
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};