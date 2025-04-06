/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000',
    BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://backend:8000'
  },
  images: {
    domains: ['127.0.0.1', 'localhost', 'backend'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/static/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '8000',
        pathname: '/static/**',
      },
    ],
  }
}

module.exports = nextConfig