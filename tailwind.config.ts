import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "primary": "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "background-light": "#fbfbfb",
        "background-dark": "#000000",
        "surface-dark": "#111111",
        "border-dark": "#222222",
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'brand-beige': '#F5F2EB',
        'brand-dark': '#1A1A1A',
        'brand-accent': '#047857', // Emerald
        'lens-hazel': '#8D7B68',
        'lens-blue': '#60A5FA',
        'lens-gray': '#9CA3AF',
        'lens-green': '#34D399',
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      fontFamily: {
        display: ["MyCustomFont", "sans-serif"],
        body: ["MyCustomFont", "sans-serif"],
        arabic: ["MyCustomFont", "sans-serif"],
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        'palestine': ['"Noto Kufi Arabic"', 'Palestine', 'sans-serif'],
        'bebas': ['"Bebas Neue"', 'sans-serif'],
      },
       animation: {
          'float': 'float 15s ease-in-out infinite',
          'fade-in-up': 'fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          'fade-in': 'fadeInAnimation 1s ease-out forwards',
          'blink-top': 'blink-top 5s infinite',
          'blink-bottom': 'blink-bottom 5s infinite',
      },
      keyframes: {
          float: {
              '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
              '33%': { transform: 'translate(30px, -50px) rotate(10deg)' },
              '66%': { transform: 'translate(-20px, 20px) rotate(-5deg)' },
          },
          fadeInUp: {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          fadeInAnimation: {
            'from': { opacity: '0', transform: 'translateY(20px)' },
            'to': { opacity: '1', transform: 'translateY(0)' },
          },
          'blink-top': {
            '0%, 90%, 100%': { transform: 'translateY(-100%)' },
            '95%': { transform: 'translateY(0%)' },
          },
          'blink-bottom': {
            '0%, 90%, 100%': { transform: 'translateY(100%)' },
            '95%': { transform: 'translateY(0%)' },
          }
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
