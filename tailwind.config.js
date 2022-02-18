const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    // Example content paths...
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      boxShadow: {
        '3xl': 'box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;',
      }
    },
    colors: {
      'blue': '#1fb6ff',
      'purple': '#7e5bef',
      'pink': '#ff49db',
      'orange': '#ff7849',
      'green': '#13ce66',
      'yellow': '#ffc82c',
      'gray-dark': '#273444',
      'gray': '#8492a6',
      'gray-light': '#d3dce6',
      transparent: 'transparent',
      background: 'var(--theme-background)',
      highlight: 'var(--highlight-color)',
      select: 'var(--select-color)',
      focus: "var(--focus-color)",
      gray: {
        100: "var(--theme-gray-100)",
        200: "var(--theme-gray-200)",
        300: "var(--theme-gray-300)",
        400: "var(--theme-gray-400)",
        500: "var(--theme-gray-500)",
        600: "var(--theme-gray-600)",
        700:"var(--theme-gray-700)",
        800: "var(--theme-gray-800)",
        900: "var(--theme-gray-900)",
      },
      gray2: {
        100: "#F0F3F4",
        200: "#E8EBEC",
        300: "#DDDEDF",
        400: "#B9BCBE",   
        500: "#8B8E92",
        600: "#696A6C",
        700: "#5F6367",
        800: "#414548",
        900: "#202124"
      },
    }
  },
  plugins: [
    plugin(function({ addVariant, addUtilities, addComponents, e, prefix, config }) {
      addVariant("sortable-drag", ".sortable-drag &")
      addVariant("sortable-ghost", ".sortable-ghost &")
      addVariant("sortable-selected", ".sortable-selected &")
      addVariant("sortable-group-drag", ".sortable-selected.sortable-drag &")
      addVariant("sortable-none-dragging", ".sortable-none-dragging &")
    }),
  ],
}
