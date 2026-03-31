tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#EFF6FF",
        },
        navy: {
          DEFAULT: "#1a202c",
          light: "#2D3748",
        },
        surface: "#F8FAFC",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        "soft-lg": "0 10px 30px -3px rgba(0, 0, 0, 0.08)",
      },
    },
  },
};
