import colors from 'tailwindcss/colors';

const brandGreen = {
  50: '#edfdf4',
  100: '#d5f8e4',
  200: '#aef0cc',
  300: '#78e2aa',
  400: '#3ccc82',
  500: '#079b4c',
  600: '#068c44',
  700: '#05773a',
  800: '#075f32',
  900: '#064f2c',
  950: '#023019'
};

const brandOrange = {
  50: '#fff7ed',
  100: '#ffebd0',
  200: '#ffd3a1',
  300: '#fcbc68',
  400: '#f6ae45',
  500: '#ed9624',
  600: '#de7b19',
  700: '#b85d18',
  800: '#93491c',
  900: '#773e1b',
  950: '#401d0b'
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '475px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: '#ffffff',
      slate: colors.slate,
      gray: colors.gray,
      zinc: colors.zinc,
      neutral: colors.neutral,
      stone: colors.stone,
      blue: brandGreen,
      sky: brandOrange,
      emerald: brandGreen,
      green: brandGreen,
      teal: brandGreen,
      cyan: brandGreen,
      indigo: brandGreen,
      amber: brandOrange,
      orange: brandOrange,
      yellow: brandOrange,
      red: brandOrange,
      rose: brandOrange,
      pink: brandOrange,
      purple: brandOrange,
    },
    extend: {},
  },
  plugins: [],
}
