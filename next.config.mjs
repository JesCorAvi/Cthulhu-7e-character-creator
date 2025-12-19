/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Cthulhu-7e-character-creator', // IMPORTANTE: Coincide con tu repo
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig