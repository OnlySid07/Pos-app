/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? ['localhost:3000', '*.vusercontent.net'] : [],
}

export default nextConfig
