/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tg-bg': 'var(--tg-theme-bg-color, #1a1a1a)',
        'tg-text': 'var(--tg-theme-text-color, #ffffff)',
        'tg-hint': 'var(--tg-theme-hint-color, #708499)',
        'tg-link': 'var(--tg-theme-link-color, #248b93)',
        'tg-button': 'var(--tg-theme-button-color, #3390ec)',
        'tg-button-text': 'var(--tg-theme-button-text-color, #ffffff)',
        'tg-secondary': 'var(--tg-theme-secondary-bg-color, #232323)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
