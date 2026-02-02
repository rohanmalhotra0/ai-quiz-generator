import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: {
          50: "#f6f5f4",
          100: "#e8e6e3",
          200: "#d4d0cb",
          300: "#b5aea5",
          400: "#948b80",
          500: "#787066",
          600: "#625c54",
          700: "#514c46",
          800: "#45423d",
          900: "#3c3a36",
          950: "#1f1e1c",
        },
        brand: {
          DEFAULT: "#c2410c",
          light: "#ea580c",
          dark: "#9a3412",
        },
      },
    },
  },
  plugins: [],
};

export default config;
