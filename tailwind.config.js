/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dhanDark: "#0B0E14",
        dhanCard: "#151922",
        dhanBorder: "#232936",
        dhanGreen: "#00D09C",
        dhanRed: "#EB5757",
        dhanBlue: "#3B82F6",
        dhanMuted: "#8E9AA8",
      },
    },
  },
  plugins: [],
}