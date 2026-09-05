import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Awards & Achievements',
  description:
    'LegalXOnline has been recognised at national competitions and startup platforms for innovation in legal technology.',
}

const AWARDS = [
  {
    n: '01',
    title: 'Winner of Entrepreneurship Expo',
    context: 'Recognised for innovation and impact in the LegalTech space at a national entrepreneurship event.',
  },
  {
    n: '02',
    title: 'Winner of Smart Make-a-Thon',
    context: 'First place in a competitive hackathon focused on technology-driven solutions for real-world problems.',
  },
  {
    n: '03',
    title: "Vice Chancellor's Award for Startup Venture",
    context: 'Awarded by the university for outstanding work in building a scalable and socially relevant startup.',
  },
  {
    n: '04',
    title: 'Top 500 Startup — Eureka! IIT Bombay',
    context: 'Selected among the top 500 startups in India at the Eureka! competition hosted by IIT Bombay.',
  },
  {
    n: '05',
    title: 'Pioneering Digital Legal Services in India',
    context: 'Recognised as an innovator building online legal services infrastructure accessible to every Indian.',
  },
]

export default function AwardsPage() {
  return (
    <main>
      {/* Header */}
      <section className="pt-16 pb-10 bg-white border-b border-hairline">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <span className="text-label-caps text-primary uppercase tracking-widest">Recognition</span>
          <h1
            className="text-ink mt-2"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}
          >
            Awards &amp; Achievements
          </h1>
          <p className="text-body-md text-body-text mt-3 max-w-lg leading-relaxed">
            A record of external validation for our work in legal technology and startup innovation.
          </p>
        </div>
      </section>

      {/* Awards list */}
      <section className="py-14 bg-surface-soft">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="divide-y divide-hairline">
            {AWARDS.map((award) => (
              <div
                key={award.n}
                className="py-7 flex items-start gap-6 sm:gap-10"
              >
                <span
                  className="text-[32px] font-bold text-ink flex-shrink-0 leading-none"
                  aria-hidden="true"
                >
                  {award.n}
                </span>
                <div>
                  <h2 className="text-display-md text-ink mb-1.5">{award.title}</h2>
                  <p className="text-body-sm text-body-text leading-relaxed max-w-xl">{award.context}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
