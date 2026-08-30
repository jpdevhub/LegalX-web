import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | LegalX Online',
  description: 'Terms and conditions for using the LegalX Online platform.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#060810] text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-10 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-12">Last updated: August 2026</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using LegalX Online ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Nature of the Service</h2>
            <p>LegalX Online is a technology platform that connects clients with independent legal professionals. We are not a law firm. The lawyers on our platform practice independently. Any legal advice received through the platform is from the individual lawyer, not from LegalX Online.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. Accounts are personal and may not be transferred or shared.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Lawyer Verification</h2>
            <p>All lawyers on the platform are required to submit their Bar Council enrolment number and supporting documents. LegalX Online conducts a verification review but does not guarantee the accuracy of information provided by lawyers. Users should conduct their own due diligence.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Payments and Refunds</h2>
            <p>Consultation fees are charged at the time of booking. Refunds may be requested within 24 hours if a consultation did not take place. Disputes are handled on a case-by-case basis by our support team.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Prohibited Conduct</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Misrepresenting your identity or credentials</li>
              <li>Using the platform for any unlawful purpose</li>
              <li>Harassing or threatening other users</li>
              <li>Attempting to circumvent the platform to contact lawyers directly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@legalxonline.com" className="text-[#C9A227] hover:underline">legal@legalxonline.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
