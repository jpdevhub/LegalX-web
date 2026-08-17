import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getLawyers, getLawyer } from '@/lib/lawyers'
import { LawyerProfile } from '@/components/sections/lawyers/LawyerProfile'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const lawyers = await getLawyers()
  return lawyers.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lawyer = await getLawyer(slug)
  if (!lawyer) return {}
  return {
    title: `${lawyer.name} — ${lawyer.primarySpec} | LegalX`,
    description: `Consult ${lawyer.name}, a verified ${lawyer.primarySpec} advocate with ${lawyer.experience} years of experience. ${lawyer.rating} rating, ${lawyer.reviewCount} reviews. Chat, Voice Call, and Video Call available via the LegalX app.`,
  }
}

export default async function LawyerPage({ params }: Props) {
  const { slug } = await params
  const lawyer = await getLawyer(slug)
  if (!lawyer) notFound()
  return <LawyerProfile lawyer={lawyer} />
}
