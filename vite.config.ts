import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "@nabla/vite-plugin-eslint";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.DEPLOY_TARGET === "gh" ? "/china-uni-rank/" : "/",
  plugins: [
    react(),
    eslintPlugin({ eslintOptions: { cache: false } }),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        display: "standalone",
        name: "中国高校四大排名",
        short_name: "四榜通",
        description: "用于快速查看和检索中国高校在四大排名中的情况",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("echarts")) {
            return "echarts";
          } else if (id.includes("visactor")) {
            return "visactor";
          } else if (id.includes("node_modules")) {
            return "vendor";
          }
          return null;
        },
      },
    },
  },
});
