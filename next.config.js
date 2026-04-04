/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.sandbox.paypal.com https://www.paypal.com https://www.paypalobjects.com",
              "frame-src 'self' https://www.sandbox.paypal.com https://www.paypal.com",
              "img-src 'self' data: https://www.sandbox.paypal.com https://www.paypal.com https://www.paypalobjects.com",
              "style-src 'self' 'unsafe-inline' https://www.paypalobjects.com",
              "connect-src 'self' https://www.sandbox.paypal.com https://api-m.sandbox.paypal.com https://www.paypal.com https://api-m.paypal.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
