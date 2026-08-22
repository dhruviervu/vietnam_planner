/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#faf3e8',
          deep: '#f0e4d2',
        },
        terracotta: {
          DEFAULT: '#c45c3a',
          deep: '#a3482c',
        },
        sage: '#7a8f72',
        ink: '#3a322c',
        muted: '#6e635a',
        paper: '#fffaf2',
      },
      fontFamily: {
        serif: ['Literata', 'Georgia', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px rgba(58, 50, 44, 0.05)',
        card: '0 10px 28px rgba(58, 50, 44, 0.07)',
        'card-hover': '0 16px 36px rgba(58, 50, 44, 0.12)',
        hero: '0 18px 40px rgba(196, 92, 58, 0.15)',
        nav: '0 8px 24px rgba(58, 50, 44, 0.06)',
      },
      borderRadius: {
        card: '24px',
        fact: '22px',
        hero: '28px',
      },
      maxWidth: {
        content: '1100px',
      },
    },
  },
  plugins: [],
}
