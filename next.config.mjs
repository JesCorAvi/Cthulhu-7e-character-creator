/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <--- ESTA LÍNEA ES LA SOLUCIÓN
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Esto es necesario para 'export' (ya lo tenías, perfecto)
  },
}

export default nextConfig