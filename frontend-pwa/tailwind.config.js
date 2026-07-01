/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        poppins: ["Poppins", "system-ui", "sans-serif"],
        "poppins-medium": ["Poppins", "system-ui", "sans-serif"],
        "poppins-semibold": ["Poppins", "system-ui", "sans-serif"],
        "poppins-bold": ["Poppins", "system-ui", "sans-serif"],
      },
      colors: {
        dawasa: {
          blue: "#007AFF",
          cyan: "#4FACFE",
          surface: "#F4F8FC",
          cta: "#007AFF",
          border: "#E2E8F0",
          placeholder: "#94A3B8",
        },
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      spacing: {
        "safe-xs": "4px",
        "safe-sm": "8px",
        "safe-md": "16px",
        "safe-lg": "24px",
        "safe-xl": "32px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
