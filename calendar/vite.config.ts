import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [
    tanstackRouter({ 
      autoCodeSplitting: true,
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // Production build optimizations
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: true,
    // Additional optimizations
    outDir: 'dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React and core libraries
          'react-vendor': ['react', 'react-dom'],
          // Router and navigation
          'router': ['@tanstack/react-router'],
          // UI components and styling
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-label', 
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],
          // Calendar libraries
          'calendar': [
            '@fullcalendar/core',
            '@fullcalendar/daygrid',
            '@fullcalendar/react',
            '@fullcalendar/interaction',
            '@fullcalendar/timegrid',
            '@fullcalendar/list'
          ],
          // Form handling
          'forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
        },
        // Consistent chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Build performance
    chunkSizeWarningLimit: 1000, // 1MB chunks are acceptable for calendar app
  },
  server: {
    // Development server configuration
    port: 3000,
    open: true,
    host: true, // Allow network access
  },
  preview: {
    port: 4173,
    open: true,
  },
  // Enable optimized dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@fullcalendar/core',
      '@fullcalendar/daygrid',
      '@fullcalendar/react',
      'lucide-react',
    ],
  },
  // Environment-specific configurations
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __DEV__: command === 'serve',
  },
  // CSS configuration
  css: {
    devSourcemap: mode === 'development',
  },
}));
