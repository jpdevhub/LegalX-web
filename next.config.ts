import type { NextConfig } from 'next'

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net https://vercel.live;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data: https://vercel.live;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.razorpay.com https://*.supabase.co https://*.resend.com wss://*.supabase.co https://vercel.live https://vercel.com;
  frame-src 'self' https://api.razorpay.com https://js.stripe.com https://vercel.live;
  manifest-src 'self' https://vercel.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests;
`.replace(/\s+/g, ' ').trim()

const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspHeader },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
  async redirects() {
    return [
      { source: '/legal-documents', destination: '/documents', permanent: true },
      { source: '/legal-documents/:path*', destination: '/documents/:path*', permanent: true },
      { source: '/consultation', destination: '/talk-to-lawyer', permanent: true },
      { source: '/business-law', destination: '/documents', permanent: true },
      { source: '/contact', destination: '/about', permanent: false },
      { source: '/request', destination: '/documents', permanent: false },
    ]
  },
}

export default nextConfig
