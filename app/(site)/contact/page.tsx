import type { Metadata } from 'next'
import { ContactPage as ContactPageContent } from '@/components/sections/contact/ContactPage'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with LegalX for personalized consultations, document reviews, or business law inquiries. Offices in New Delhi.',
}

export default function ContactPage() {
  return <ContactPageContent />
}
