/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins_400Regular"],
        poppins: ["Poppins_400Regular"],
        "poppins-medium": ["Poppins_500Medium"],
        "poppins-semibold": ["Poppins_600SemiBold"],
        "poppins-bold": ["Poppins_700Bold"],
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
      },
      spacing: {
        "safe-xs": "4px",
        "safe-sm": "8px",
        "safe-md": "16px",
        "safe-lg": "24px",
        "safe-xl": "32px",
      },
    },
  },
  plugins: [],
};
