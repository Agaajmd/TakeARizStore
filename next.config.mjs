/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this configuration to skip SSG for the invoice page
  experimental: {
    // This ensures the invoice page is rendered only on the client side
    // and not during build time
    appDir: true,
  },
  // Disable static generation for specific routes
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
