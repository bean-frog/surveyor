/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.jsx'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 500ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require('@catppuccin/tailwindcss')({
      prefix: 'ctp',
      defaultFlavour: 'latte',
    }),
    require('daisyui'),
  ],
  daisyui: {
    themes: false,
    darkTheme: false,
  },
}
