import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ReviewFlow brand colors (v0 design: teal primary + light theme)
        brand: {
          blue: "#0D9488",    // teal-600 — primary CTAs / links
          yellow: "#F59E0B",  // amber-500 — stars / accents (key kept for compat)
          soft: "#F8FAFC",    // slate-50 — light backgrounds
          muted: "#64748B",   // slate-500 — body text
          dark: "#0F172A",    // slate-900 — headings
        },
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        sans: ["Inter", "Noto Sans SC", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(15,23,42,0.06)",
        "glow-green": "0 0 40px rgba(16,185,129,0.25)",
        "glow-green-sm": "0 0 20px rgba(16,185,129,0.15)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
