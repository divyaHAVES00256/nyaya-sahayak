/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        govBlue: {
          DEFAULT: "#185FA5",
          light: "#E6F1FB",
          dark: "#0C447C",
        },
        govGreen: {
          DEFAULT: "#27500A",
          light: "#EAF3DE",
        },
        govAmber: {
          DEFAULT: "#BA7517",
          light: "#FAEEDA",
        },
        muted: "#6B7280",
      },
    },
  },
  plugins: [],
};