import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:4322",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "ASTRO_DEV_BACKGROUND=0 npx astro dev --force --host 127.0.0.1 --port 4322",
    url: "http://127.0.0.1:4322/@vite/client",
    reuseExistingServer: false
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Safari"] }
    },
    {
      name: "iPhone 15 Pro",
      use: { ...devices["iPhone 15 Pro"] }
    },
    {
      name: "tablet portrait",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true
      }
    }
  ]
});
