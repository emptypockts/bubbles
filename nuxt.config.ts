// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules:[
    '@pinia/nuxt'
  ],
  css:[
    '@/assets/main.css'
  ],
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
  routeRules:{
    '/_nuxt/**':{
      headers:{
        'Cache-Control': 'public, max-age=10, must-revalidate',
      }
    }
  },
  devProxy:{
    '/api':{
      target:'http://localhost:3000',
      changeOrigin:true,
      secure:false,
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
    public:{
		apiBase: process.env.API_BASE_URL || 'http://localhost:3000',
      		wsUrl: process.env.WS_URL || 'ws://localhost:3003',
    },
  },

});
