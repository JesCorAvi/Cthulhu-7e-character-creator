/** @type {import('next').NextConfig} */
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Inicializa los bindings de Cloudflare para el entorno local
initOpenNextCloudflareForDev();

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Mover esto FUERA de 'experimental' a la raíz:
  outputFileTracingExcludes: {
    "*": [
      // Excluir el generador de imágenes pesadas (ahorra ~1.4MB)
      "node_modules/@vercel/og/**/*",
      
      // Excluir librería nativa de sqlite (ahorra espacio y evita errores)
      "node_modules/better-sqlite3/**/*",
      
      // Excluir librerías 3D del servidor (solo deben cargar en el cliente)
      "node_modules/three/**/*",
      "node_modules/@react-three/fiber/**/*",
      "node_modules/@react-three/drei/**/*",
      "node_modules/@react-three/cannon/**/*",
      "node_modules/@3d-dice/dice-box/**/*",
      "node_modules/yoga-wasm-web/**/*"
    ],
  },
  // Puedes dejar 'experimental' si tienes otras opciones, si no, puedes quitarlo
  experimental: {
  },
}

export default nextConfig;