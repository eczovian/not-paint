import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
/** @type {import('vite').UserConfig} */
export default defineConfig({
  server: {
    allowedHosts: true,
  },
  plugins: [tailwindcss(), VitePWA({ registerType: "autoUpdate" })],
});
