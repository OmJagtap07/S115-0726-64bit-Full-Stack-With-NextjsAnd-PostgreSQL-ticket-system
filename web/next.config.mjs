/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL 
          ? `${process.env.BACKEND_URL}/api/v1/:path*` 
          : 'http://127.0.0.1:5001/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
