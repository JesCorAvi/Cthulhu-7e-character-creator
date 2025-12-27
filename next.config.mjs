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
}


export default nextConfig