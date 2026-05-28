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
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        dark: {
          DEFAULT: '#060609',
          deeper: '#030305',
          warm: '#0b0a08',
          card: '#0d0c0a',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dim: '#D97706',
          bright: '#FBBF24',
          soft: '#FCD34D',
        },
      },
      boxShadow: {
        'amber-sm': '0 4px 20px -6px rgba(245,158,11,0.25)',
        'amber-md': '0 8px 32px -8px rgba(245,158,11,0.4)',
        'amber-lg': '0 16px 50px -12px rgba(245,158,11,0.5)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 6s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
      },
    },
  },
  plugins: [],
}
