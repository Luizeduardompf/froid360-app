/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel gerencia o output automaticamente — sem 'standalone'
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Robots-Tag', value: 'noindex' }, // demo — não indexar
        ],
      },
    ];
  },
};

export default nextConfig;
