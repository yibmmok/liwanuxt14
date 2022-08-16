import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	ssr: false,
    meta: {
        meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        link: [
            { rel: 'icon', type: 'image/png', href: '/static/favicon.png' },
            {rel: 'stylesheet', type: 'text/css', href: '/assets/css/formkit.css'}
        ],
    },
    modules: [
        '@formkit/nuxt',
        '@nuxtjs/tailwindcss',
        '@vueuse/nuxt',
    ],
    css: [
        '~/assets/css/base.css',
    ], 
    server: {
        port: 8000,
    },    
    tailwindcss: {
    	ccsPath: "~/assets/css/base.css",
    	configPath: 'tailwind.config.js',
    	exposeConfig: false,
    	config: {},
    	viewer: true,
    },
    formkit: {
        defaultConfig: true,
        configFile: "formkit.config.ts"
    },    
})
