/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ms: {
          blue: "#0078D4",
          "blue-hover": "#106EBE",
          "blue-pressed": "#005A9E",
          surface: "#F3F2F1",
          canvas: "#FAF9F8",
          border: "#EDEBE9",
          text: "#323130",
          muted: "#605E5C",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: [
          '"Segoe UI"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
