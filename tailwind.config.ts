import type { Config } from "tailwindcss";

/**
 * "Wildflower summer" palette — see CLAUDE.md for the full theme brief.
 * Colour names map to the paper invite description.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: { DEFAULT: "#FAF6EA", deep: "#F2EAD6" },
        botanical: { red: "#9E2B22", "red-deep": "#781E17" },
        cornflower: { DEFAULT: "#5C77B8", soft: "#8FB4DE", deep: "#3F578F" },
        buttercup: { DEFAULT: "#ECC23F", deep: "#C99A2E" },
        dusky: { DEFAULT: "#D49AA0", deep: "#B97B83", pale: "#E7C2C6" },
        sage: "#88A06A",
        forest: "#46603F",
        ink: { DEFAULT: "#2A303C", soft: "#535A68" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        body: ["var(--font-body)", "EB Garamond", "Georgia", "serif"],
      },
      maxWidth: {
        prose: "42rem",
      },
    },
  },
  plugins: [],
};

export default config;
