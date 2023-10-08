const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        serif: ["Times", "serif"]
      },
      borderWidth: {
        DEFAULT: "0.0625rem",
        0: "0",
        2: "0.125rem",
        3: "0.1875rem",
        4: "0.25rem",
        6: "0.375rem",
        8: "0.5rem",
      },
      ringWidth: {
        0: "0",
        1: "0.0625rem",
        2: "0.125rem",
        3: "0.1875rem",
        4: "0.25rem",
        6: "0.375rem",
        8: "0.5rem",
      },
      ringOffsetWidth: {
        0: "0",
        1: "0.0625rem",
        2: "0.125rem",
        3: "0.1875rem",
        4: "0.25rem",
        6: "0.375rem",
        8: "0.5rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT:
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "	0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "	0 8px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "	0 8px 25px -5px rgb(0 0 0 / 0.35), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 12px 50px -16px rgb(0 0 0 / 0.55), 0 8px 80px -10px rgb(0 0 0 / 0.1)",
        "3xl": "rgba(0, 0, 0, 0.35) 0px 5px 15px;",
        inner: "	inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        none: "	0 0 #0000",
      },
      keyframes: {
        // enter="transition ease-out duration-200"
        //                 enterFrom="transform opacity-0 scale-95"
        //                 enterTo="transform opacity-100 scale-100"
        //                 leave="transition ease-in duration-75"
        //                 leaveFrom="transform opacity-100 scale-100"
        //                 leaveTo="transform opacity-0 scale-95"
        pulseCursor: {
          "0%": { transform: "scaleX(2.5) scaleY(1.2)" },
          "100%": { transform: "scaleX(1.0) scaleY(1.0)" },
        },
        pulseOnce: {
          "0%": { transform: "scaleX(1.6) scaleY(1.6)" },
          "100%": { transform: "scaleX(1.0) scaleY(1.0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        dialogIn: {
          "0%": { opacity: 0, transform: "scale(.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        dialogOut: {
          "0%": { opacity: 1, transform: "scale(1)" },
          "100%": { opacity: 1, transform: "scale(.95)" },
        },
      },
      animation: {
        pulseOnce: "pulseOnce 0.2s ease-out",
        fadeIn: "fadeIn .15s",
        fadeInSlow: "fadeIn 0.15s linear forwards .2s",
        fadeOut: "fadeOut .15s",
        dialogIn: "dialogIn .07s ease-out",
        dialogOut: "dialogOut .05s ease-in",
        hoverCardIn: "hoverCardIn 0.15s ease-out",
        hoverCardOut: "hoverCardOut 0.15s ease-out",
      },
      
    },
    colors: {
      highlightFaint: "var(--highlight-faint-color)",
      highlight: "var(--highlight-color)",
      select: "var(--select-color)",
      focus: "var(--focus-color)",

      ramp: {
        0: "var(--ramp-0)",
        50: "var(--ramp-50)",
        100: "var(--ramp-100)",
        200: "var(--ramp-200)",
        300: "var(--ramp-300)",
        400: "var(--ramp-400)",
        500: "var(--ramp-500)",
        600: "var(--ramp-600)",
        700: "var(--ramp-700)",
        800: "var(--ramp-800)",
        900: "var(--ramp-900)",
      },

      white: "#ffffff",
      black: "#000000",
      transparent: "transparent",
      current: "currentColor"
    },
    fontSize: {
      xxs: "0.625rem", 
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.563rem",
      "3xl": "1.953rem",
      "4xl": "2.441rem",
      "5xl": "3.052rem",
      "6xl": "4rem",
    },
  },
  plugins: [
    plugin(function (helpers) {
      let { addVariant, addUtilities, addComponents, e, prefix, config } =
        helpers;
        addVariant("theme-wide", '.theme-wide');
        addVariant("theme-narrow", '.theme-narrow');
        addVariant("theme-top", '.theme-top');
        addVariant("theme-center", '.theme-center');
      // addVariant("aria-checked", '[aria-checked="true"] &');
      // addVariant("aria-selected", '[aria-selected="true"] &');
      // addVariant("drop-animation-active", ".drop-animation-active &");
      
      dataVariant("active", helpers);
      dataVariant("active-item", helpers);
      dataVariant("enter", helpers);
      dataVariant("leave", helpers);
      dataStateVariant("open", helpers);
      dataStateVariant("delayed-open", helpers);
      dataStateVariant("closed", helpers);
      dataStateVariant("on", helpers);
      dataStateVariant("checked", helpers);
      dataStateVariant("unchecked", helpers);

      // dataVariant("highlighted", helpers);
      // dataVariant("disabled", helpers);
    }),
  ],
};

function dataStateVariant(
  state,
  {
    addVariant, // for registering custom variants
    e, // for manually escaping strings meant to be used in class names
  }
) {
  addVariant(`data-state-${state}`, ({ modifySelectors, separator }) => {
    modifySelectors(({ className }) => {
      return `.${e(
        `data-state-${state}${separator}${className}`
      )}[data-state='${state}']`;
    });
  });

  addVariant(`group-data-state-${state}`, ({ modifySelectors, separator }) => {
    modifySelectors(({ className }) => {
      return `.group[data-state='${state}'] .${e(
        `group-data-state-${state}${separator}${className}`
      )}`;
    });
  });

  addVariant(`peer-data-state-${state}`, ({ modifySelectors, separator }) => {
    modifySelectors(({ className }) => {
      return `.peer[data-state='${state}'] ~ .${e(
        `peer-data-state-${state}${separator}${className}`
      )}`;
    });
  });
}

function dataVariant(
  state,
  {
    addVariant, // for registering custom variants
    e, // for manually escaping strings meant to be used in class names
  }
) {
  addVariant(`data-${state}`, ({ modifySelectors, separator }) => {
    modifySelectors(({ className }) => {
      return `.${e(`data-${state}${separator}${className}`)}[data-${state}]`;
    });
  });

  addVariant(`group-data-${state}`, ({ modifySelectors, separator }) => {
    modifySelectors(({ className }) => {
      return `.group[data-${state}] .${e(
        `group-data-${state}${separator}${className}`
      )}`;
    });
  });

  addVariant(`peer-data-${state}`, ({ modifySelectors, separator }) => {
    modifySelectors(({ className }) => {
      return `.peer[data-${state}] ~ .${e(
        `peer-data-${state}${separator}${className}`
      )}`;
    });
  });
}
