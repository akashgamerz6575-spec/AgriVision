/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables 'dark' class on HTML tag for theme switching
  theme: {
    extend: {
      colors: {
        // Modern Sustainable Agriculture Palette
        agri: {
          // Forest Greens (Light Theme)
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            950: '#052e16',
          },
          // Terracotta / Earth Tones
          earth: {
            50: '#fdf8f2',
            100: '#fef3c7', // warm sand
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309', // rich clay
            950: '#451a03',
          },
          // Dark Mode Premium Palette
          dark: {
            obsidian: '#0b1612',   // Deepest dark charcoal green
            moss: '#12251e',       // Card background for dark mode
            sprout: '#22c55e',     // Accent green
            clay: '#f59e0b',       // Accent warm sand
            border: '#1f3a31',     // Elegant border green
            text: {
              primary: '#f1f5f9',  // Off white text
              secondary: '#94a3b8' // Slate gray text
            }
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(20, 83, 45, 0.05), 0 2px 8px -1px rgba(20, 83, 45, 0.03)',
        'premium-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.3), 0 2px 8px -1px rgba(0, 0, 0, 0.2)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
