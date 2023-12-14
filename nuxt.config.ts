// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr:false,
  modules: ['@formkit/nuxt', '@nuxtjs/tailwindcss'],
  css:["@/assets/css/base.css"],
  formkit: {
    defaultConfig: true,
    configFile: "formkit.config.ts"
  }
})
