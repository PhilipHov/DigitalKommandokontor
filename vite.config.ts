import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env.NODE_ENV === "production" ? "/DigitalKommandokontor/" : "/";

export default defineConfig({
  plugins: [react()],
  base,
  server: { port: 5173, host: "127.0.0.1" },
});
