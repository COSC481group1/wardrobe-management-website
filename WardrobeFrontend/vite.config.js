import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import http from 'node:http'
import https from 'node:https'

function backendProxy() {
  const ports = [5146, 7163]

  return {
    name: 'backend-port-fallback',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
      if (!req.url?.startsWith('/User') && !req.url?.startsWith('/Wardrobe') && !req.url?.startsWith('/ClothingImages')) {
        return next()
      }
        const bodyChunks = []

        req.on('data', chunk => bodyChunks.push(chunk))

        req.on('end', () => {
          const body = Buffer.concat(bodyChunks)

          function tryPort(index) {
            if (index >= ports.length) {
              res.statusCode = 502
              res.end('Neither backend port (5146 nor 7163) is reachable.')
              return
            }

          const port = ports[index]

          const protocol = port === 5146 ? http : https

          const proxyReq = protocol.request(
            {
              hostname: 'localhost',
              port,
              path: req.url,
              method: req.method,
              headers: {
                ...req.headers,
                host: `localhost:${port}`,
                'content-length': body.length
              },
              ...(port === 7163 ? { rejectUnauthorized: false } : {})
            },
            proxyRes => {
              res.writeHead(proxyRes.statusCode, proxyRes.headers)
              proxyRes.pipe(res)
            }
          )

            proxyReq.on('error', () => {
              tryPort(index + 1)
            })

            proxyReq.end(body)
          }

          tryPort(0)
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    backendProxy()
  ],

  server: {
    watch: {
      usePolling: true,
      interval: 1000
    }
  },

  build: {
    outDir: '../WardrobeBackend/wwwroot',
    emptyOutDir: true
  }
})