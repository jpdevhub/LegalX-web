'use client'

import { FadeUp, StaggerParent, FadeUpChild } from '@/components/motion/MotionWrappers'

const TEAM = [
  {
    name: 'Prince Kumar',
    role: 'Co-Founder & CEO',
    bio: 'Passionate technology entrepreneur committed to solving real-world legal challenges through innovation. Combining expertise in technology with a vision for accessible legal services to empower individuals, professionals, and businesses.',
    initials: 'PK',
  },
  {
    name: 'Raj Priya Singh',
    role: 'Co-Founder & CTO',
    bio: 'Technology leader driving the engineering vision behind LegalX. Focused on building robust, scalable AI systems that make complex legal workflows simple, secure, and accessible for everyone.',
    initials: 'RS',
  },
]

const MILESTONES = [
  { label: 'Winner of Entrepreneurship Expo' },
  { label: 'Winner of Smart Make-a-Thon' },
  { label: "Vice Chancellor's Award for Startup Venture" },
  { label: 'Top 500 Startup — Eureka! IIT Bombay' },
  { label: 'Building the next generation of AI-powered LegalTech' },
]

function AvatarPlaceholder({ initials }: { initials: string }) {
  return (
    <div
      className="w-28 h-28 rounded-full bg-surface-soft border-2 border-hairline flex items-center justify-center flex-shrink-0"
      aria-hidden
    >
      <span className="text-[28px] font-bold text-primary select-none">{initials}</span>
    </div>
  )
}

export function AboutTeam() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-labelledby="team-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">

        {/* Founders */}
        <FadeUp className="text-center mb-14">
          <span className="text-label-caps text-primary uppercase tracking-widest">Meet the Founders</span>
          <h2
            id="team-heading"
            className="text-ink mt-2 text-balance"
            style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, lineHeight: 1.2 }}
          >
            The Minds Behind LegalX
          </h2>
          <p className="text-body-md text-body-text mt-3 max-w-2xl mx-auto leading-relaxed">
            LegalX was founded by passionate technology entrepreneurs committed to solving real-world legal challenges through innovation. By combining expertise in technology with a vision for accessible legal services, the founders are building a platform that empowers individuals, professionals, and businesses to navigate legal processes with confidence.
          </p>
        </FadeUp>

        <StaggerParent className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">
          {TEAM.map((member) => (
            <FadeUpChild key={member.name}>
              <div className="flex flex-col items-center text-center p-8 bg-surface-soft rounded-md border border-hairline h-full">
                <AvatarPlaceholder initials={member.initials} />
                <div className="mt-6">
                  <h3 className="text-display-md text-ink">{member.name}</h3>
                  <p className="text-label-caps text-primary uppercase tracking-widest mt-1">{member.role}</p>
                  <p className="text-body-sm text-body-text mt-3 leading-relaxed max-w-xs mx-auto">{member.bio}</p>
                </div>
              </div>
            </FadeUpChild>
          ))}
        </StaggerParent>

        {/* Journey / Awards */}
        <FadeUp>
          <div className="border-t border-hairline pt-16">
            <span className="text-label-caps text-primary uppercase tracking-widest">Our Journey</span>
            <h2
              className="text-ink mt-2 text-balance mb-8"
              style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Recognition &amp; Milestones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MILESTONES.map((m, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-5 bg-surface-soft rounded-md border border-hairline"
                >
                  <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-body-sm text-body-text leading-relaxed">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

      </div>
    </section>
  )
}
