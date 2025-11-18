/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'roboto': ['Roboto', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Light theme colors from UI-SPEC
        'bg-primary': '#FFFFFF',
        'bg-surface': '#F7F7F8',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'border-subtle': '#E5E7EB',
        'accent-primary': '#3B82F6',
        'accent-danger': '#EF4444',
        'accent-warning': '#F59E0B',
        'accent-success': '#22C55E',
      },
      fontSize: {
        'xs': ['12px', '1.4'],
        'sm': ['13px', '1.4'],
        'base': ['14px', '1.4'],
        'lg': ['16px', '1.4'],
        'xl': ['18px', '1.4'],
        '2xl': ['20px', '1.3'],
        '3xl': ['24px', '1.25'],
      },
      borderRadius: {
        'button': '10px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
