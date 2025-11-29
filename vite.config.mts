import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { apiPlugin } from "./vite-api-plugin";

export default defineConfig({
  plugins: [
    // Add API plugin first to handle /api routes in development (can read .dev.vars file)
    apiPlugin(),
    cloudflare({
      viteEnvironment: {
        name: "worker",
        devEnvironment: {
          enabled: true,
        }
      },
      configPath: "./wrangler.jsonc",
      persistState: true,
    }),
    redwood(),
  ],
  resolve: {
    alias: {
      // Polyfill Node.js modules for browser
      'node:worker_threads': 'worker_threads',
    },
  },
  optimizeDeps: {
    exclude: ['cloudflare:workers', 'async_hooks'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
