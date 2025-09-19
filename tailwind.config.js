/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" // add this line
  ],
  theme: {
    extend: {
      boxShadow: {
        'card': '0 3px 6px -4px rgba(0,0,0,.12),0 6px 16px 0 rgba(0,0,0,.08),0 9px 28px 8px rgba(0,0,0,.05)',
      },
      animation: {
        'bounce': 'bounce 10s linear infinite',
        'bouncefast': 'bounce 5s linear infinite',
      },
    },

  },
  plugins: [
    require('flowbite/plugin')
  ],
}