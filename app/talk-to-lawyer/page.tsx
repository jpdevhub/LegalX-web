import type { Metadata } from 'next'
import { TalkToLawyer } from '@/components/sections/lawyer/TalkToLawyer'

export const metadata: Metadata = {
  title: 'Talk to a Lawyer — LegalX',
  description:
    'Connect with a verified lawyer at LegalX. Book a consultation for property, family, business, or criminal matters. Fast, confidential, and affordable.',
}

export default function TalkToLawyerPage() {
  return <TalkToLawyer />
}
