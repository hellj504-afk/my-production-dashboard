/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Ensure trailing slashes are handled
  trailingSlash: false,
  
  // Redirects for clean URLs
  async redirects() {
    return [
      {
        source: '/',
        destination: '/umair/dashboard',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;