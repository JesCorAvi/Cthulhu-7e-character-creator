/** @type {import('next').NextConfig} */
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Inicializa los bindings de Cloudflare para el entorno local
initOpenNextCloudflareForDev();

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // IMPORTANTE: Esto debe estar en la raíz, NO dentro de 'experimental'
  outputFileTracingExcludes: {
    "*": [
      // 1. Excluir librerías de generación de imágenes (OG Image)
      // Estas incluyen archivos .wasm muy pesados (resvg.wasm, yoga.wasm)
      "node_modules/@vercel/og/**/*",
      "node_modules/next/dist/compiled/@vercel/og/**/*",
      "**/*.wasm",
      
      // 2. Excluir librerías 3D (Three.js, React Three Fiber)
      // Estas deben ejecutarse solo en el cliente ("use client"), no en el server
      "node_modules/three/**/*",
      "node_modules/@react-three/**/*",
      "node_modules/@3d-dice/**/*",
      "node_modules/cannon/**/*",
      "node_modules/yoga-wasm-web/**/*",

      // 3. Excluir drivers de base de datos locales (usarás D1, no sqlite local)
      "node_modules/better-sqlite3/**/*",
      
      // 4. Excluir mapas de fuente y otros archivos pesados innecesarios
      "**/*.map",
      "**/*.jpg", 
      "**/*.png"
    ],
  },
};

export default nextConfig;