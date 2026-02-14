import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f4f7f4",
          100: "#e0e8df",
          200: "#c2d1c0",
          300: "#9ab498",
          400: "#739471",
          500: "#567854",
          600: "#436042",
          700: "#374d36",
          800: "#2e3f2d",
          900: "#263427",
          950: "#131c13",
        },
        bark: {
          50: "#faf6f2",
          100: "#f2ebe0",
          200: "#e4d4bf",
          300: "#d3b897",
          400: "#c19a6f",
          500: "#b58455",
          600: "#a8714a",
          700: "#8c5a3f",
          800: "#724a38",
          900: "#5d3e30",
          950: "#321f18",
        },
        ember: {
          50: "#fff8ed",
          100: "#fff0d4",
          200: "#ffdda8",
          300: "#ffc471",
          400: "#ffa038",
          500: "#fe8511",
          600: "#ef6a07",
          700: "#c64f08",
          800: "#9d3e0f",
          900: "#7e3510",
          950: "#441806",
        },
        void: {
          50: "#f5f6f6",
          100: "#e5e7e8",
          200: "#ced1d3",
          300: "#abb0b4",
          400: "#81888d",
          500: "#666d72",
          600: "#575c61",
          700: "#4a4e52",
          800: "#414447",
          900: "#393b3e",
          950: "#1a1c1e",
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
