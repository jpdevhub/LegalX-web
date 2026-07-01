import type { Metadata } from 'next'
import { RequestFlow } from '@/components/sections/request/RequestFlow'

export const metadata: Metadata = {
  title: 'Request a Document',
  description:
    'Request a professionally drafted legal document in 3 simple steps. Select your document type, provide details, and confirm payment.',
}

export default function RequestPage() {
  return (
    <div className="bg-surface-soft dark:bg-surface-soft-dark min-h-screen py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <RequestFlow />
      </div>
    </div>
  )
}
