import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./models/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ---- Color System ---- */
      colors: {
        brand: {
          primary: "var(--primary)",
          "primary-hover": "var(--primary-hover)",
          "primary-muted": "var(--primary-muted)",
          secondary: "var(--secondary)",
          "secondary-hover": "var(--secondary-hover)",
          "secondary-muted": "var(--secondary-muted)",
          gold: "var(--gold)",
          "gold-muted": "var(--gold-muted)",
        },
        surface: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          glass: "var(--glass-bg)",
        },
        semantic: {
          success: "var(--success)",
          "success-muted": "var(--success-muted)",
          error: "var(--error)",
          "error-muted": "var(--error-muted)",
          warning: "var(--warning)",
          "warning-muted": "var(--warning-muted)",
          info: "var(--info)",
          "info-muted": "var(--info-muted)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          hover: "var(--border-hover)",
          active: "var(--border-active)",
        },
      },

      /* ---- Font Families ---- */
      fontFamily: {
        sora: ["Sora", "system-ui", "-apple-system", "sans-serif"],
        "dm-sans": ["DM Sans", "system-ui", "-apple-system", "sans-serif"],
        jetbrains: [
          "JetBrains Mono",
          "ui-monospace",
          "Cascadia Code",
          "Fira Code",
          "monospace",
        ],
      },

      /* ---- Font Sizes (banking-optimised scale) ---- */
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "display-lg": ["2.75rem", { lineHeight: "1.15", fontWeight: "700" }],
        "display-md": ["2rem", { lineHeight: "1.2", fontWeight: "600" }],
        "heading-lg": ["1.5rem", { lineHeight: "1.25", fontWeight: "600" }],
        "heading-md": ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
        "heading-sm": ["1.0625rem", { lineHeight: "1.35", fontWeight: "600" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["0.9375rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
      },

      /* ---- Border Radius ---- */
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },

      /* ---- Backdrop Blur ---- */
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "12px",
        md: "16px",
        lg: "20px",
        xl: "30px",
        "2xl": "40px",
        "3xl": "64px",
      },

      /* ---- Box Shadow ---- */
      boxShadow: {
        glass: "var(--glass-shadow)",
        "glass-lg":
          "0 8px 32px rgba(0, 0, 0, 0.4), 0 16px 48px rgba(0, 0, 0, 0.2)",
        glow: "0 0 20px var(--primary-muted)",
        "glow-lg": "0 0 40px var(--primary-muted)",
        "glow-gold": "0 0 20px var(--gold-muted)",
      },

      /* ---- Animations ---- */
      animation: {
        "orb-float": "orb-float 12s ease-in-out infinite",
        "orb-gradient": "orb-gradient 8s ease-in-out infinite",
        "orb-pulse": "orb-pulse 4s ease-in-out infinite",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-up": "slide-up 0.5s ease-out both",
        "pulse-ring":
          "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "spin-slow": "spin-slow 3s linear infinite",
      },
      keyframes: {
        "orb-float": {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
            opacity: "0.4",
          },
          "25%": {
            transform: "translate(30px, -50px) scale(1.1)",
            opacity: "0.6",
          },
          "50%": {
            transform: "translate(-20px, -80px) scale(1.05)",
            opacity: "0.5",
          },
          "75%": {
            transform: "translate(-40px, -30px) scale(0.95)",
            opacity: "0.45",
          },
        },
        "orb-gradient": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "orb-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.3" },
          "50%": { transform: "scale(1.15)", opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },

      /* ---- Transitions ---- */
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        "ease-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      /* ---- Spacing & Sizing ---- */
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "120": "30rem",
      },
    },
  },
  plugins: [],
};

export default config;
