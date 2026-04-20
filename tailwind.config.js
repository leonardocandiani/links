/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        dark: {
          DEFAULT: '#060609',
          deeper: '#030305',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dim: '#D97706',
        },
      },
    },
  },
  plugins: [],
}
