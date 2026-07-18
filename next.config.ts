import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
