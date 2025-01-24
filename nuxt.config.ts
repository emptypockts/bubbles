// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite:{
    server:{
      hmr:{
        timeout:30000,
        clientPort:3001
      },
      proxy:{
        '/ws': { target: 'ws://raspberrypi.local:3000', ws: true }, 
      }
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
<<<<<<< HEAD
  runtimeConfig: {
    public: {
      apiBaseURL: 'http://raspberrypi.local:3000', 
    },
  },
});
=======
  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt']
})
>>>>>>> 57fffa746420cda2df1fcc65716fe475503c81d0
