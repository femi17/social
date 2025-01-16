module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        'scropoll-primary': '#3B82F6', // blue-500
        'scropoll-secondary': '#60A5FA', // blue-400
        'scropoll-background': '#EFF6FF', // blue-50
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}