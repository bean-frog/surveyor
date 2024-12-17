/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.jsx'],
  theme: {
    extend: {},
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
