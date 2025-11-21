import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Disable PWA Service Worker in dev to avoid stale caches and SW MIME errors
      devOptions: {
        enabled: false,
      },
      manifest: {
        name: 'Rentacloud - Ijara Boshqaruv Tizimi',
        short_name: 'Rentacloud',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#5b8cff',
        background_color: '#ffffff',
        description: 'Asbob-uskunalarni ijaraga berish va daromadni hisoblash tizimi',
        icons: [
          // Note: For full installability, add 192x192 and 512x512 PNGs under /public/icons/ and update src below.
          // { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          // { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  
  // Development server configuration
  server: {
    port: 5173,
    host: true, // Allow external connections
    strictPort: true,
    cors: true,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    }
  },

  // Build configuration for production
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for debugging (disable in production for smaller builds)
    sourcemap: false,
    
    // Minify the output
    minify: 'esbuild',
    
    // Target modern browsers for smaller bundles
    target: 'es2015',
    
    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000,
    
    // Rollup options for advanced bundling
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunk for third-party libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Icons chunk
          icons: ['react-icons', 'lucide-react'],
          // Utils chunk
          utils: ['date-fns']
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
    
    // Asset handling
    assetsDir: 'assets',
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed file sizes
    reportCompressedSize: true,
    
    // Emit manifest for deployment tools
    manifest: true,
  },

  // CSS configuration
  css: {
    // CSS modules configuration
    modules: {
      localsConvention: 'camelCase'
    },
    
    // PostCSS configuration
    postcss: {
      plugins: []
    }
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-icons',
      'lucide-react',
      'date-fns'
    ]
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // Preview server configuration (for production preview)
  preview: {
    port: 5173,
    host: true
  }
});



