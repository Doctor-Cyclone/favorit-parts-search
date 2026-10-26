import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    base: "./",
    server: {
      proxy: {
        "/api/parts": {
          target: "http://api.favorit-parts.ru",
          changeOrigin: true,
          rewrite(path) {
            const url = new URL(path, "http://localhost");
            url.searchParams.set("key", env.FAVORIT_API_KEY || "");
            return `/hs/hsprice/?${url.searchParams}`;
          },
        },
      },
    },
    test: { include: ["src/**/*.test.{js,jsx}"], environment: "jsdom" },
  };
});
