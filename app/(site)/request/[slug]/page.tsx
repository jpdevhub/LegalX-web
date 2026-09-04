import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDocument, DOCUMENTS } from '@/lib/documents'
import { DocumentRequestFlow } from '@/components/sections/request/DocumentRequestFlow'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return DOCUMENTS.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = getDocument(slug)
  if (!doc) return {}
  return {
    title: `Generate ${doc.title}`,
    description: `Create your ${doc.title} in ${doc.estimatedTime}. ${doc.pricing.total}. Legally compliant, expert reviewed.`,
  }
}

export default async function RequestDocumentPage({ params }: Props) {
  const { slug } = await params
  const doc = getDocument(slug)
  if (!doc) notFound()

  return <DocumentRequestFlow doc={doc} />
}
