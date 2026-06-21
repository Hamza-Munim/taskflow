/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        taskflow: {
          bg: '#F8F9FB',
          primary: '#6366F1',
          text: '#111827',
          muted: '#6B7280',
          border: '#E5E7EB',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17, 24, 39, 0.06)',
      },
    },
  },
  plugins: [],
}
