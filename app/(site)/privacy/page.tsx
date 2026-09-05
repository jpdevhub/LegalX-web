import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How LegalX Online collects, uses, and protects your personal data.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#060810] text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-10 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-12">Last updated: August 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, submit a legal document request, or contact a lawyer through our platform. This includes your name, email address, phone number, and the details of your legal query.</p>
            <p className="mt-2">For lawyers registering on our platform, we additionally collect Bar Council registration details, enrolment certificate, and government-issued identity documents for verification purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>To connect you with qualified legal professionals</li>
              <li>To process consultation requests and payments</li>
              <li>To verify the credentials of lawyers on our platform</li>
              <li>To send service-related communications</li>
              <li>To improve our platform and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
            <p>All data transmitted between your browser and our servers is encrypted using TLS/HTTPS. Authentication tokens are stored in HttpOnly cookies inaccessible to client-side scripts. Documents uploaded for verification are stored in encrypted cloud storage with access restricted to authorised compliance staff only.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal information to third parties. We share data only with the lawyer you engage, our payment processor (Razorpay), and cloud infrastructure providers (Supabase) under strict data processing agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:privacy@legalxonline.com" className="text-[#C9A227] hover:underline">privacy@legalxonline.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Contact</h2>
            <p>For any privacy-related questions, email us at <a href="mailto:privacy@legalxonline.com" className="text-[#C9A227] hover:underline">privacy@legalxonline.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
