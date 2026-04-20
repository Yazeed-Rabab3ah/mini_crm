/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          background: "#F3F4FF",
          text: "#0B1122",
          border: "#E0E1F0",
          primary: "#0B1122",
          muted: "#9899b0",
          sidebarText: "#4b4c6b",
          icon: "#7879a0",
          activeBg: "#E2E3F5",
          danger: "#e05555",
        },
        fontFamily: {
          sans: ["Archivo", "ui-sans-serif", "system-ui"],
        },
      },
    },
    plugins: [],
  };