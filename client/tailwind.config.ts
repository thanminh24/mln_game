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
        black: "#000000",
        surface: "#111111",
        border: "#222222",
        muted: "#A3A3A3",
        yellow: "#FFD700",
        "yellow-dim": "#B8960C",
        correct: "#22C55E",
        "correct-dim": "#14532D",
        wrong: "#DC2626",
        "wrong-dim": "#7F1D1D",
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
