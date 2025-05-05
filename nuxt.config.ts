// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app:{
    head:{
      link:[
        {
          rel:'icon',
          type: 'image/x-icon',
          href:'bubbles.ico'
        }
      ]
    }
  },
nitro:{
  devProxy:{
    '/api':{
      target:'http://raspberrypi:3000',
      changeOrigin:true,
      secure:false
    },
    '/ws':{
      target: 'ws://localhost:3003',
      ws:true
    }
  }
},
  plugins:[
{src:'~/plugins/websocket.client.js',
  mode:'client'
}
  ],
  vite:{
    server:{
      proxy:{
        '/ws':{
          target:'ws://localhost:3003',
          ws:true
        },
        '/api':{
          target:'http://raspberry:3000',
          changeOrigin:true,
          secure:false
        }
      }
    }
  },
  compatibilityDate: '2024-11-01',
  runtimeConfig: {
    public: {
      // dev
      // apiBaseURL: 'http://localhost:3000'
      //prod 
      apiBaseURL: process.env.API_BASE_URL||'http://raspberrypi:3000'
    },
  },

});
