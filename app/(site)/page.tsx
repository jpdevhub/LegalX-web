import type { Metadata } from 'next'
import { HomeHero } from '@/components/sections/home/HomeHero'
import { HomeTrustBand } from '@/components/sections/home/HomeTrustBand'
import { HomeFeaturesGrid } from '@/components/sections/home/HomeFeaturesGrid'
import { HomeHowItWorks } from '@/components/sections/home/HomeHowItWorks'
import { HomeCTABand } from '@/components/sections/home/HomeCTABand'

export const metadata: Metadata = {
  title: 'LegalX — Legal Services Simplified',
  description:
    'Navigate the complexities of the law with precision. Instant document generation, expert attorneys, and legal services — all on one platform.',
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
