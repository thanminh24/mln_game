import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        vietnamese: ["Be Vietnam Pro", "sans-serif"],
      },
      colors: {
        surface: "#1a1a1a",
        border: "#2a2a2a",
        muted: "#888888",
        keyword: "#dc2626",
        gold: "#f59e0b",
      },
      fontSize: {
        // Projector-compensated scale (+15-20% over standard)
        "game-xl": ["4.5rem", { lineHeight: "1.1" }],
        "game-lg": ["2.7rem", { lineHeight: "1.2" }],
        "game-md": ["2.2rem", { lineHeight: "1.3" }],
        "game-sm": ["1.8rem", { lineHeight: "1.4" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
