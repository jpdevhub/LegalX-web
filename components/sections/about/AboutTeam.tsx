'use client'

import Image from 'next/image'
import { FadeUp } from '@/components/motion/MotionWrappers'

const FOUNDERS = [
  {
    name: 'Prince Kumar',
    role: 'Co-Founder & CEO',
    photo: '/PrinceKumar.png',
    objectPosition: 'center top',
    bio: 'Passionate technology entrepreneur committed to solving real-world legal challenges through innovation. Prince built LegalX from the ground up with a vision to make professional legal services accessible and affordable to every Indian.',
    achievements: [
      {
        label: 'Entrepreneurship Expo',
        detail: 'Winner — Best Legal-Tech Innovation',
      },
      {
        label: 'Smart Make-a-Thon',
        detail: 'Winner — National Level Competition',
      },
      {
        label: "Vice Chancellor's Award",
        detail: 'Outstanding Startup Venture Award',
      },
      {
        label: 'Eureka! IIT Bombay',
        detail: 'Top 500 Startup — India',
      },
    ],
    experiences: ['IIT Bombay Ecosystem', 'Legal-Tech Innovation', 'Startup India'],
  },
  {
    name: 'Raj Priya Singh',
    role: 'Co-Founder & CTO',
    photo: '/RajPriya.png',
    objectPosition: '50% 25%',
    bio: 'Technology leader driving the engineering vision behind LegalX. Raj focuses on building secure, scalable systems that make complex legal workflows simple and accessible for individuals and businesses across India.',
    achievements: [
      {
        label: 'Smart Make-a-Thon',
        detail: 'Winner — Technology & Innovation Track',
      },
      {
        label: 'Startup India',
        detail: 'Registered Startup — DPIIT Recognised',
      },
      {
        label: 'Legal-Tech Pioneer',
        detail: 'Innovating Digital Legal Infrastructure',
      },
      {
        label: 'Build for Bharat',
        detail: 'Accessible Legal Services for All Indians',
      },
    ],
    experiences: ['Full-Stack Engineering', 'Legal-Tech Systems', 'Digital India'],
  },
]

export function AboutTeam() {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-surface-dark" aria-labelledby="team-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">

        {/* Section heading */}
        <FadeUp className="text-center mb-16">
          <span className="text-label-caps text-primary uppercase tracking-widest">Meet the Founders</span>
          <h2
            id="team-heading"
            className="text-ink dark:text-white mt-2 text-balance"
            style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, lineHeight: 1.2 }}
          >
            The Minds Behind LegalX
          </h2>
          <p className="text-body-md text-body-text dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            LegalX was founded by passionate entrepreneurs from Bihar who dared to simplify India's legal system.
          </p>
        </FadeUp>

        {/* Founder cards */}
        <div className="space-y-20">
          {FOUNDERS.map((founder, idx) => (
            <FadeUp key={founder.name}>
              <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 lg:gap-16 items-start">

                {/* Photo + name column */}
                <div className="flex flex-col items-center lg:items-start">
                  {/* Photo */}
                  <div className="relative w-64 h-80 lg:w-full lg:h-[420px] rounded-xl overflow-hidden shadow-lg mb-6 flex-shrink-0">
                    <Image
                      src={founder.photo}
                      alt={`${founder.name}, ${founder.role} at LegalX`}
                      fill
                      className="object-cover"
                      style={{ objectPosition: founder.objectPosition }}
                      sizes="(max-width: 1024px) 256px, 340px"
                      priority={idx === 0}
                    />
                  </div>
                  {/* Name + role below photo */}
                  <div className="text-center lg:text-left w-full">
                    <h3
                      className="text-ink dark:text-white font-bold"
                      style={{ fontSize: 'clamp(20px, 2.5vw, 26px)' }}
                    >
                      {founder.name}
                    </h3>
                    <p className="text-primary font-semibold text-body-sm mt-1">{founder.role}</p>
                    <p className="text-body-sm text-body-text dark:text-slate-400 mt-3 leading-relaxed max-w-xs mx-auto lg:mx-0">
                      {founder.bio}
                    </p>
                  </div>
                </div>

                {/* Achievement cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {founder.achievements.map((ach) => (
                    <div
                      key={ach.label}
                      className="bg-surface-soft dark:bg-surface-soft-dark rounded-md p-5"
                    >
                      <p className="text-[13px] font-bold text-primary uppercase tracking-wide mb-1">
                        {ach.label}
                      </p>
                      <p className="text-body-sm text-body-text dark:text-slate-400 leading-snug">
                        {ach.detail}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            </FadeUp>
          ))}
        </div>

      </div>
    </section>
  )
}
