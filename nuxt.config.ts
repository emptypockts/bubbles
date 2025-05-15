// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules:['@nuxt/ui'],
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
      target:'http://localhost:3000',
      changeOrigin:true,
      secure:false
    },
    '/ws':{
      target: 'ws://localhost:3003',
      ws:true
    }
  }
},
plugins:[{
  src:'~/plugins/websocket.client.js',
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
        // prod
        protocol: "https",
        host: 'bubbles.dahoncho.com',
        
        // dev
        // clientPort: 3000,
        // port: 3000,
      },
      proxy:{
        '/ws': { 
          target: 'ws://localhost:3003', 
          ws: true }, 
        '/api':{
          target:'http://localhost:3000',
          changeOrigin:true,
          secure:false
        }
      },
      
    }
  },
  compatibilityDate: '2024-11-01',
  runtimeConfig: {
    public: {
      // dev
      // apiBaseURL: 'http://localhost:3000'
      //prod 
      apiBaseURL: 'https://backend.dahoncho.com'
    },
  },

});
