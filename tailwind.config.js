module.exports = {
  content: [
    `components/**/*.{vue,js}`,
    `layouts/**/*.vue`,
    `pages/**/*.vue`,
    `plugins/**/*.{js,ts}`,
    // `nuxt.config.{js,ts}`
  ],
  theme: {
    extend: {
      lineClamp: {
        10: "10",
        12: "12",
      }
    },
  },
  variants: {
    extend: {}
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
