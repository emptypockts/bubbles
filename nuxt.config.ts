// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite:{
    server:{
      
      hmr:{
        clientPort:3002
      },
      proxy:{
        '/ws': { target: 'ws://raspberrypi.local:3000', ws: true }, 
      },
      
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBaseURL: 'http://raspberrypi.local:3000', 
    },
  },
});
