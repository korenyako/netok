/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        background: {
          DEFAULT: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
          hover: 'var(--color-background-hover)',
        },
        foreground: {
          DEFAULT: 'var(--color-foreground)',
          secondary: 'var(--color-foreground-secondary)',
          tertiary: 'var(--color-foreground-tertiary)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        },
      },
    },
  },
  plugins: [],
}
