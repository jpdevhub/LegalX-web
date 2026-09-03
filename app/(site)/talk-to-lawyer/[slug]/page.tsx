import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { apiGetLawyer, apiGetLawyers } from '@/lib/api'
import { LawyerProfile } from '@/components/sections/lawyers/LawyerProfile'

interface Props {
  params: Promise<{ slug: string }>
}

/**
 * The listing reads the live API on every visit, so the profile must too.
 *
 * This page previously went through lib/lawyers, which falls back to a set of
 * demo advocates when the backend is slow or empty. That is fine at build time
 * on a laptop and wrong in production: a visitor could open a profile for a
 * lawyer who does not exist and try to book them. It also meant the two pages
 * disagreed — the grid showed real lawyers, the profile showed seed data.
 */
export const revalidate = 60

/** A lawyer approved after the last build still needs a page. */
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const lawyers = await apiGetLawyers()
    return lawyers.map((l) => ({ slug: l.slug }))
  } catch {
    // Backend unavailable at build time. dynamicParams renders on demand
    // instead, which is preferable to baking in placeholder slugs.
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lawyer = await apiGetLawyer(slug)
  if (!lawyer) return { title: 'Lawyer not found' }

  return {
    title: `${lawyer.name} — ${lawyer.primarySpec}`,
    description: `Consult ${lawyer.name}, a verified ${lawyer.primarySpec} advocate with ${lawyer.experience} years of experience. ${lawyer.rating} rating, ${lawyer.reviewCount} reviews. Chat, voice and video consultations available on LegalXOnline.`,
    alternates: { canonical: `/talk-to-lawyer/${slug}` },
    openGraph: {
      type: 'profile',
      title: `${lawyer.name} — ${lawyer.primarySpec}`,
      description: `Verified advocate · ${lawyer.experience} years' experience · ${lawyer.location}`,
      url: `/talk-to-lawyer/${slug}`,
    },
  }
}

export default async function LawyerPage({ params }: Props) {
  const { slug } = await params
  const lawyer = await apiGetLawyer(slug)
  if (!lawyer) notFound()
  return <LawyerProfile lawyer={lawyer} />
}
