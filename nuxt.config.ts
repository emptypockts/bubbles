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
	    port:3001,
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
    public: {
      // These are default values for client-side (browser) and fallback
      apiBase: process.env.NUXT_PUBLIC_EXTERNAL_API_BASE || 'https://bubbles.eacsa.us/api',
      wsUrl: process.env.NUXT_PUBLIC_EXTERNAL_WS_URL || 'wss://wss.eacsa.us',
    },
    // Server-side only variables (not exposed to client).
    // These will be overridden by environment variables in Docker.
    serverApiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api', // Default for SSR in dev, but Docker env will override
    serverWsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:3003',   // Default for SSR in dev, but Docker env will override
  },

});
