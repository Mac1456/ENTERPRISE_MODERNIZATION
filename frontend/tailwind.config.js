/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CRMHUB Brand Colors (matching the screenshots)
        primary: {
          50: '#eef8ff',
          100: '#d9edff',
          200: '#bce1ff',
          300: '#8eccff',
          400: '#59aeff',
          500: '#3b82f6', // Main brand blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Custom CRMHUB palette
        crmhub: {
          blue: '#3b82f6',
          lightBlue: '#e0f2fe',
          darkBlue: '#1e40af',
          accent: '#06b6d4',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          purple: '#8b5cf6',
        },
        // Exact grays from screenshots
        gray: {
          50: '#fafbfc',
          100: '#f4f5f7',
          200: '#e1e5e9',
          300: '#c7d2da',
          400: '#9aa5b1',
          500: '#7b8794',
          600: '#616e7c',
          700: '#52606d',
          800: '#3e4c59',
          900: '#323f4b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
