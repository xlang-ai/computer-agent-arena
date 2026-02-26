/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: { preflight: false },
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          main: '#4B2E83',
          light: '#7C5DB8',
          dark: '#1E0749',
        },
        secondary: {
          main: '#009CD5',
          light: '#6BC3E3',
          dark: '#005D7E',
        },
        error: {
          main: '#E94E7C',
          light: '#F63B73',
          dark: '#D6295D',
        },
        warning: {
          main: '#F79942',
          light: '#FF9040',
          dark: '#DE6B18',
        },
        success: {
          main: '#55C861',
          light: '#36D146',
          dark: '#1EAA2C',
        },
        text: {
          primary: '#00000',
          secondary: '#727272',
          disabled: 'rgba(255, 255, 255, 0.3)',
        },
        action: {
          active: 'rgba(0, 0, 0, 0.54)',
          hover: 'rgba(0, 0, 0, 0.04)',
          selected: 'rgba(0, 0, 0, 0.08)',
          disabled: 'rgba(176, 176, 176, 1)',
          disabledBackground: 'rgba(0, 0, 0, 0.12)',
          focus: 'rgba(0, 0, 0, 0.12)',
        },
        background: {
          main: '#F3F3F3',
          popup: '#FFFFFF',
          sidebar: '#031425',
        },
        header: {
          text: '#003871',
        },
        border: '#D8D8D8',
        divider: '#FFFFFF',
        contrast: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
