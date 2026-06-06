/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#f0f4fa",
          100: "#d9e3f2",
          200: "#b3c7e5",
          300: "#7da0cf",
          400: "#3e92cc",
          500: "#1a6fb0",
          600: "#0f5690",
          700: "#0a2463",
          800: "#081d4f",
          900: "#061539",
        },
        accent: {
          teal: "#2ec4b6",
          orange: "#e63946",
          yellow: "#ffbe0b",
        },
        surface: {
          dark: "#0b1220",
          darker: "#070c17",
          light: "#f8f9fa",
        },
      },
      fontFamily: {
        display: ['"Source Han Serif SC"', '"Noto Serif SC"', "serif"],
        sans: ['"Source Han Sans SC"', '"Noto Sans SC"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 4s linear infinite",
        "flip": "flip 0.6s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flip: {
          "0%": { transform: "rotateX(90deg)", opacity: 0 },
          "100%": { transform: "rotateX(0)", opacity: 1 },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(62,146,204,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(62,146,204,0.06) 1px, transparent 1px)",
        "gradient-primary":
          "linear-gradient(135deg, #0a2463 0%, #1a6fb0 50%, #3e92cc 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(62,146,204,0.25)",
        "glow-lg": "0 0 40px rgba(62,146,204,0.35)",
        card: "0 4px 24px rgba(10,36,99,0.08)",
        "card-hover": "0 12px 40px rgba(10,36,99,0.16)",
      },
    },
  },
  plugins: [],
};
