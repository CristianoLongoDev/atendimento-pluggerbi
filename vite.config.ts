import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      ...Object.fromEntries(
        ['/auth', '/bots', '/channels', '/users', '/accounts', '/integrations', '/api', '/conversations'].map(
          (p) => [
            p,
            { target: 'https://pluggyapi.pluggerbi.com', changeOrigin: true, secure: false },
          ],
        ),
      ),
      '/ws': {
        target: 'wss://pluggyapi.pluggerbi.com',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
