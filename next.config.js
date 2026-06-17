/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  output: 'standalone',
}

module.exports = nextConfig