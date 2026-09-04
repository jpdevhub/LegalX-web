import type { Metadata } from 'next'
import { HomeHero } from '@/components/sections/home/HomeHero'
import { HomeTrustBand } from '@/components/sections/home/HomeTrustBand'
import { HomeFeaturesGrid } from '@/components/sections/home/HomeFeaturesGrid'
import { HomeHowItWorks } from '@/components/sections/home/HomeHowItWorks'
import { HomeCTABand } from '@/components/sections/home/HomeCTABand'

/**
 * `absolute` on purpose.
 *
 * The root layout appends "| LegalXOnline" to every page title. Left to the
 * template this would read "LegalXOnline — … | LegalXOnline", and the previous
 * title said "LegalX" — a name shared with several unrelated companies, which
 * is why Google answers "legalxonline" with "Did you mean: legal online" and
 * attributes the brand to a third-party site.
 */
export const metadata: Metadata = {
  title: { absolute: 'LegalXOnline — Legal Services Simplified for India' },
  description:
    'LegalXOnline is an Indian legal technology platform for document drafting, business registration and consultations with verified advocates — all online.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeTrustBand />
      <HomeFeaturesGrid />
      <HomeHowItWorks />
      <HomeCTABand />
    </>
  )
}
