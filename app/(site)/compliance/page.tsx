import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Compliance',
  description: 'Regulatory compliance and our lawyer verification process.',
}

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-[#060810] text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-10 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Compliance</h1>
        <p className="text-slate-400 text-sm mb-12">Our commitment to legal and regulatory standards</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Lawyer Verification Process</h2>
            <p>Every lawyer on LegalX Online undergoes a mandatory verification process before being approved to take client consultations. This includes:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
              <li>Verification of Bar Council of India enrolment number and state bar registration</li>
              <li>Review of the Sanad (enrolment certificate)</li>
              <li>Government-issued photo identity verification (Aadhaar/PAN)</li>
              <li>Cross-check with the Bar Council of India online portal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Protection</h2>
            <p>LegalX Online processes personal data in accordance with applicable Indian data protection laws. All documents submitted for verification are encrypted at rest and in transit, and are only accessible to authorised compliance personnel.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Payment Compliance</h2>
            <p>All payments are processed through Razorpay, which is compliant with PCI-DSS standards. LegalX Online does not store card details. Lawyers receive payouts after platform fees are deducted, in compliance with applicable GST regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Report a Concern</h2>
            <p>If you believe a lawyer on our platform is misrepresenting their credentials, or if you have a compliance concern, please email our compliance team at <a href="mailto:compliance@legalxonline.com" className="text-[#C9A227] hover:underline">compliance@legalxonline.com</a>. We take all reports seriously and respond within 48 hours.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
