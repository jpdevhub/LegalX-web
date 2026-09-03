import type { NextConfig } from 'next'

// BACKEND_URL: server-side only (no NEXT_PUBLIC_ prefix)
// Next.js rewrites() run server-side and read this at request-time, not build-time.
// Set this in Vercel → Environment Variables as: BACKEND_URL = https://legalx-backend-gl4b.onrender.com
//
// NEXT_PUBLIC_BACKEND_URL: client-side CSP header generation (build-time)
// Set this in Vercel too, same value.
// Production Render URL — used if env vars are not set on Vercel.
// ALWAYS set BACKEND_URL on Vercel → https://legalx-backend-gl4b.onrender.com
const RENDER_BACKEND = 'https://legalx-backend-gl4b.onrender.com'
const isDev = process.env.NODE_ENV === 'development'

const backendUrl = process.env.BACKEND_URL
  || process.env.NEXT_PUBLIC_BACKEND_URL
  || (isDev ? 'http://localhost:4000' : RENDER_BACKEND)

// Build CSP dynamically so the Render backend host is always in connect-src
const cspBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  || process.env.BACKEND_URL
  || (isDev ? 'http://localhost:4000' : RENDER_BACKEND)
const backendHost = cspBackendUrl.startsWith('http')
  ? new URL(cspBackendUrl).origin
  : cspBackendUrl

// vercel.live is deliberately absent. Allowing it let the Vercel Toolbar inject
// itself into production pages — that is where the Vercel mark in the corner
// came from, and its marketing copy ("Go from idea to live site in minutes")
// was being picked up as page text by Google's crawler.
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://js.stripe.com https://cdn.jsdelivr.net https://cdn.agora.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https: blob:",
  `connect-src 'self' ${backendHost} https://api.razorpay.com https://lumberjack.razorpay.com https://*.supabase.co https://*.resend.com wss://*.supabase.co https://*.agora.io wss://*.agora.io`,
  "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://js.stripe.com",
  "media-src 'self' blob:",
  "manifest-src 'self'",
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

// /shorts was the original path; keep shared links working after the rename.
const shortsRedirects = [
  { source: '/shorts', destination: '/knowledge-center', permanent: true },
  { source: '/shorts/:slug', destination: '/knowledge-center/:slug', permanent: true },
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
      ...shortsRedirects,
    ]
  },
}

export default nextConfig
