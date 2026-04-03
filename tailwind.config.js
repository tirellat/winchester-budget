export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
      extend: {
          "colors": {
              "surface-tint": "#bf0229",
              "secondary-fixed": "#e5e2e1",
              "inverse-primary": "#ffb3b1",
              "on-tertiary": "#ffffff",
              "on-secondary-fixed": "#1b1c1c",
              "on-primary-fixed": "#410007",
              "on-background": "#1a1c1c",
              "on-tertiary-fixed": "#001f28",
              "outline": "#906f6e",
              "surface-container": "#eeeeee",
              "on-primary-fixed-variant": "#92001c",
              "secondary-fixed-dim": "#c8c6c5",
              "surface-variant": "#e2e2e2",
              "on-tertiary-fixed-variant": "#004e60",
              "on-error-container": "#93000a",
              "surface-container-highest": "#e2e2e2",
              "primary-fixed-dim": "#ffb3b1",
              "on-primary-container": "#ffdad8",
              "tertiary-container": "#006e87",
              "on-tertiary-container": "#b6ebff",
              "on-surface-variant": "#5c403f",
              "surface-dim": "#dadada",
              "secondary-container": "#e2dfde",
              "surface-container-lowest": "#ffffff",
              "surface-bright": "#f9f9f9",
              "on-surface": "#1a1c1c",
              "on-error": "#ffffff",
              "inverse-surface": "#2f3131",
              "tertiary-fixed-dim": "#82d1ed",
              "secondary": "#5f5e5e",
              "primary": "#9e001f",
              "primary-fixed": "#ffdad8",
              "tertiary": "#005468",
              "outline-variant": "#e5bdbb",
              "on-secondary-container": "#636262",
              "on-primary": "#ffffff",
              "on-secondary-fixed-variant": "#474746",
              "inverse-on-surface": "#f1f1f1",
              "error-container": "#ffdad6",
              "tertiary-fixed": "#b6ebff",
              "surface": "#f9f9f9",
              "primary-container": "#c8102e",
              "on-secondary": "#ffffff",
              "surface-container-low": "#f3f3f3",
              "error": "#ba1a1a",
              "surface-container-high": "#e8e8e8",
              "background": "#f9f9f9",
              "success": "#2e7d32",
              "on-success": "#ffffff"
          },
          "borderRadius": {
              "DEFAULT": "0.125rem",
              "lg": "0.25rem",
              "xl": "0.5rem",
              "full": "0.75rem"
          },
          "fontFamily": {
              "headline": ["Public Sans", "sans-serif"],
              "body": ["Public Sans", "sans-serif"],
              "label": ["Public Sans", "sans-serif"],
              "sans": ["Public Sans", "sans-serif"]
          }
      },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}

