/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.tsx',
    './components/**/*.tsx',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins','sans-serif'],
        lora: ['Lora','serif'],
      },
      colors: {
        slaOnTime: '#28a745',
        slaBreached: '#dc3545',
        atRisk: '#ffc107',
      }
    }
  },
  plugins: []
};
