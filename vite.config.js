import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import fs from "node:fs";
/** @type {import('vite').UserConfig} */
export default defineConfig({
  server: {
    allowedHosts: true,
    https: {
      key: fs.readFileSync("./certs/localhost-key.pem"),
      cert: fs.readFileSync("./certs/localhost.pem"),
    },
  },
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        // caches the assets/icons mentioned (assets/* includes all the assets present in your src/ directory)
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "assets/*"],
        name: "Simplifying Progressive Web App (PWA) Development with Vite: A Beginners Guide",
        short_name: "PWA Guide",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/images/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // defining cached files formats
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      },
    }),
  ],
});
