import type { NextConfig } from 'next'

// Backend URL for server-side proxy rewrites
// In production this is the Render URL set via NEXT_PUBLIC_BACKEND_URL env var
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

// Build CSP dynamically so the Render backend host is always in connect-src
const backendHost = backendUrl.startsWith('http')
  ? new URL(backendUrl).origin
  : backendUrl

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://js.stripe.com https://cdn.jsdelivr.net https://vercel.live https://cdn.agora.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data: https://vercel.live",
  "img-src 'self' data: https: blob:",
  `connect-src 'self' ${backendHost} https://api.razorpay.com https://lumberjack.razorpay.com https://*.supabase.co https://*.resend.com wss://*.supabase.co https://vercel.live https://vercel.com https://*.agora.io wss://*.agora.io`,
  "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://js.stripe.com https://vercel.live",
  "media-src 'self' blob:",
  "manifest-src 'self' https://vercel.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspHeader },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Camera and mic allowed for video consultations
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
]

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async rewrites() {
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
      { source: '/business-law', destination: '/documents', permanent: true },
      { source: '/request', destination: '/documents', permanent: false },
      { source: '/consultation', destination: '/talk-to-lawyer', permanent: true },
      { source: '/contact', destination: '/about', permanent: false },
    ]
  },
}

export default nextConfig
