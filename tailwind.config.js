export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#edfaf4',
          100: '#d3f3e3',
          200: '#a9e6ca',
          300: '#72d3ac',
          400: '#3dba8c',
          500: '#1a9e74',
          600: '#0e7f5c',
          700: '#0c6347',
          800: '#0b513c',
          900: '#0a4332',
        },
        sage: {
          50:  '#f4f7f5',
          100: '#e6ede9',
          200: '#cdddd4',
          300: '#adc4b8',
        },
      },
    }
  },
  plugins: []
}
