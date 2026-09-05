import type { Metadata } from 'next'
import { AboutHero } from '@/components/sections/about/AboutHero'
import { AboutNarrative } from '@/components/sections/about/AboutNarrative'
import { AboutValues } from '@/components/sections/about/AboutValues'
import { AboutTeam } from '@/components/sections/about/AboutTeam'
import { AboutContact } from '@/components/sections/about/AboutContact'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'LegalXOnline was founded to democratize legal intelligence for modern India. Learn about our mission, values, and the minds behind the platform.',
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutNarrative />
      <AboutValues />
      <AboutTeam />
      <AboutContact />
    </>
  )
}
