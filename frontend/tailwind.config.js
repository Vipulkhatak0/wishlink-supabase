/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rose: { 50:'#fff0f3', 100:'#ffe0e8', 200:'#ffc2d1', 300:'#ff94a9', 400:'#ff6080', 500:'#FF4D6D', 600:'#e02355', 700:'#be1847', 800:'#9f1641', 900:'#87143c' },
        plum: { 50:'#f5f0fb', 100:'#ece1f7', 200:'#d8c3ef', 300:'#bb99e3', 400:'#9b67d1', 500:'#6B2D8B', 600:'#5e2779', 700:'#4f2065', 800:'#421a54', 900:'#371547' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'heart-beat': 'heartBeat 1.5s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        heartBeat: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' } },
        sparkle: { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.5', transform: 'scale(0.8)' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
