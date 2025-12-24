/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4B3626', // Dark Brown
          dark: '#3a2a1e',
          light: '#5c4330',
        },
        secondary: {
          DEFAULT: '#B69F85', // Warm Beige
          dark: '#9a8770',
          light: '#d4c2a8',
        },
        background: {
          DEFAULT: '#DDD1C2', // Light Cream
          dark: '#c9bda8',
          light: '#f0e8db',
        },
        text: {
          primary: '#1a1a1a',
          secondary: '#4B3626',
          muted: '#6b6b6b',
          light: '#ffffff',
        },
        dark: {
          DEFAULT: '#000000',
          light: '#1a1a1a',
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        '3d': '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        '3d-hover': '0 15px 35px -5px rgba(0, 0, 0, 0.4), 0 10px 15px -6px rgba(0, 0, 0, 0.3)',
        '3d-active': '0 5px 15px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}

