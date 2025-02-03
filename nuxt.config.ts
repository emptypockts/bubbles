// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  plugins:[
{src:'~/plugins/websocket.client.js',
  mode:'client'
}
  ],
  vite:{
    server:{
      
      hmr:{
        clientPort:3001,
        host:'0.0.0.0'

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
