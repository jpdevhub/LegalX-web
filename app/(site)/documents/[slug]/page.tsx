import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDocument, DOCUMENTS } from '@/lib/documents'
import { DocumentDetail } from '@/components/sections/documents/DocumentDetail'

interface Props {
  params: Promise<{ slug: string }>
}

// Generate static pages for all 5 documents at build time
export function generateStaticParams() {
  return DOCUMENTS.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = getDocument(slug)
  if (!doc) return {}
  return {
    title: doc.title,
    description: `${doc.shortDesc} ${doc.price}. Handled by qualified legal professionals. ${doc.duration}.`,
  }
}

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params
  const doc = getDocument(slug)
  if (!doc) notFound()

  return <DocumentDetail doc={doc} />
}
