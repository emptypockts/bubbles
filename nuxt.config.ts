// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  plugins:[
{src:'~/plugins/websocket.client.js',
  mode:'client'
}
  ],
  vite:{
    server:{
      watch:{
        usePolling:true,
        interval:1000,
      },
      allowedHosts:['bubbles.dahoncho.com'],
      hmr:{
        clientPort:3001,
        host:'0.0.0.0'

      },
      proxy:{
        '/ws': { target: 'ws://localhost:3003', ws: true }, 
        '/api':{
          target:'http://localhost:3000',
          changeOrigin:true,
          secure:false
        }
      },
      
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBaseURL: 'http://localhost:3000'//dev
      // apiBaseURL: 'https://bubbles.dahoncho.com'//prod 
    },
  },
});
