import type { NextConfig } from 'next'

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https: blob:;
  connect-src 'self' http://localhost:4000 https://legalx-backend-gl4b.onrender.com https://api.razorpay.com https://*.supabase.co https://*.resend.com wss://*.supabase.co;
  frame-src 'self' https://api.razorpay.com https://js.stripe.com;
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
  // Silence the Turbopack/webpack mismatch warning
  turbopack: {},
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return [
      { source: '/legal-documents', destination: '/documents', permanent: true },
      { source: '/legal-documents/:path*', destination: '/documents/:path*', permanent: true },
      { source: '/consultation', destination: '/talk-to-lawyer', permanent: true },
      { source: '/business-law', destination: '/documents', permanent: true },
      { source: '/contact', destination: '/about', permanent: false },
      // Old generic request selector now redirects to services hub
      { source: '/request', destination: '/documents', permanent: false },
    ]
  },
}

export default nextConfig
