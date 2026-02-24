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
    // Only use devProxy in development
    ...(process.env.NODE_ENV === 'development' && {
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
    })
  },
  plugins:[{
    src:'~/plugins/websocket.client.js',
    mode:'client'
  }],
  vite:{
    server:{
      watch:{
        usePolling:true,
        interval:1000,
      },
      // Only use proxies in dev mode
      ...(process.env.NODE_ENV === 'development' && {
        proxy:{
          '/ws': { 
            target: 'ws://localhost:3003', 
            ws: true 
          }, 
          '/api':{
            target:'http://localhost:3000',
            changeOrigin:true,
            secure:false
          }
        }
      })
    }
  },
  compatibilityDate: '2024-11-01',
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_EXTERNAL_API_BASE || 'https://bubbles.eacsa.us/api',
      wsUrl: process.env.NUXT_PUBLIC_EXTERNAL_WS_URL || 'wss://bubbles.eacsa.us/ws',
    },
    serverApiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
    serverWsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://ws:3003',
  },
});