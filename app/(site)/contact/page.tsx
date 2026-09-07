import type { Metadata } from 'next'
import { ContactPage as ContactPageContent } from '@/components/sections/contact/ContactPage'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Reach LegalX on WhatsApp or by email for questions about the platform, an order, or a document. Registered office in Bhagalpur, Bihar.',
}

export default function ContactPage() {
  return <ContactPageContent />
}
