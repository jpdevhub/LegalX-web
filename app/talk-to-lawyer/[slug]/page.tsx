import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LAWYERS, getLawyer } from '@/lib/lawyers'
import { LawyerProfile } from '@/components/sections/lawyers/LawyerProfile'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return LAWYERS.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lawyer = getLawyer(slug)
  if (!lawyer) return {}
  return {
    title: `${lawyer.name} — ${lawyer.primarySpec} | LegalX`,
    description: `Consult ${lawyer.name}, a verified ${lawyer.primarySpec} advocate with ${lawyer.experience} years of experience. ${lawyer.rating} rating, ${lawyer.reviewCount} reviews. Chat, Voice Call, and Video Call available via the LegalX app.`,
  }
}

export default async function LawyerPage({ params }: Props) {
  const { slug } = await params
  const lawyer = getLawyer(slug)
  if (!lawyer) notFound()
  return <LawyerProfile slug={slug} />
}
