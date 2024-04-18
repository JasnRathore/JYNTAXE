/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        Iosevka: "Iosevka"
      },
      keyframes: {
        ToastOpen: {
          '0%': { transform: "scale(0, 0)" },
          '100%': {transform: "scale(1, 1)" },
        },
        ToastClose: {
          '0%': {  opacity: 1 },
          '100%': { opacity: 0 },
        },
        Toast: {
          '0%': { transform: "scale(0, 0)" },
          '1.6%': { transform: "scale(1, 1)" },
          '90%': {  opacity: 1 },
          '100%': { opacity: 0 },
        }
      },
      // 1s = 1000 ms
      animation: {
        ToastOpen: "ToastOpen 80ms ease-in-out",
        ToastClose: "ToastClose 500s ease-in-out 4500s",
        Toast: "Toast 5100ms ease-in-out",
      },
    },
  },
  plugins: [],
}

