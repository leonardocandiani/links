import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://leonardocandiani.com.br",
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "pt-br",
        locales: {
          "pt-br": "pt-BR",
          en: "en"
        }
      }
    })
  ],
  i18n: {
    defaultLocale: "pt-br",
    locales: ["pt-br", "en"],
    routing: {
      prefixDefaultLocale: false
    }
  },
  output: "static",
  devToolbar: {
    enabled: false
  },
  build: {
    format: "directory"
  }
});
