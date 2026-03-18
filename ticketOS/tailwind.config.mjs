/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <-- AÑADE ESTA LÍNEA
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [],
}