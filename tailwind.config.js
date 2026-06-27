//  // tailwind.config.js
// module.exports = {
//   content: ['./src/**/*.{js,jsx,ts,tsx}'],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           DEFAULT: '#6366f1',
//           dark:    '#4f46e5',
//           50:      '#eef2ff',
//           100:     '#e0e7ff',
//           200:     '#c7d2fe',
//           300:     '#a5b4fc',
//           400:     '#818cf8',
//           500:     '#6366f1',
//           600:     '#4f46e5',
//           700:     '#4338ca',
//           800:     '#3730a3',
//           900:     '#312e81',
//         },
//         secondary: {
//           DEFAULT: '#8b5cf6',
//           dark:    '#7c3aed',
//           50:      '#f5f3ff',
//           100:     '#ede9fe',
//         },
//       },
//       boxShadow: {
//         card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
//       },
//     },
//   },
//   plugins: [],
// };
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:      '#EEEDFE',
          100:     '#D4D2FC',
          DEFAULT: '#534AB7',
          dark:    '#3C3489',
        },
        secondary: {
          50:      '#E1F5EE',
          DEFAULT: '#1D9E75',
          dark:    '#0F6E56',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};