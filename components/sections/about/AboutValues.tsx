'use client'

import type React from 'react'
import { FadeUp, StaggerParent, FadeUpChild } from '@/components/motion/MotionWrappers'

const VALUES = [
  {
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Transparency',
    desc: 'Clear pricing and honest legal services. No hidden fees, no surprises — every step of the process is visible to you.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Trust',
    desc: 'Building long-term relationships through reliability and professionalism. We treat every legal matter with the seriousness it deserves.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Innovation',
    desc: 'Using AI and modern technology to improve legal experiences — continuously evolving our platform to solve real-world legal challenges.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="2" y1="12" x2="22" y2="12" strokeLinecap="round" />
        <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Accessibility',
    desc: 'Making legal help available to everyone regardless of location, background, or financial capability. Legal protection is a right, not a luxury.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Security',
    desc: 'Protecting user data with strong privacy and security standards. Your legal documents and personal information are always safe with us.',
  },
]

export function AboutValues() {
  return (
    <section className="py-20 md:py-28 bg-surface-soft" aria-labelledby="values-heading">
      <div className="max-w-[1400px] mx-auto px-5 md:px-16">
        <FadeUp className="mb-12">
          <span className="text-label-caps text-primary uppercase tracking-widest">Core Values</span>
          <h2
            id="values-heading"
            className="text-ink mt-2 text-balance"
            style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, lineHeight: 1.2 }}
          >
            Built on Unwavering Principles
          </h2>
        </FadeUp>

        <StaggerParent
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5"
          style={{ gridAutoRows: '1fr' } as React.CSSProperties}
        >
          {VALUES.map((value) => (
            <FadeUpChild key={value.title}>
              <div className="flex flex-col gap-4 p-6 bg-surface-soft rounded-md h-full transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover cursor-default">
                <div className="w-12 h-12 rounded-sm bg-primary/8 flex items-center justify-center flex-shrink-0">
                  {value.icon}
                </div>
                <h3 className="text-display-md text-ink">{value.title}</h3>
                <p className="text-body-sm text-body-text leading-relaxed flex-1">{value.desc}</p>
              </div>
            </FadeUpChild>
          ))}
        </StaggerParent>
      </div>
    </section>
  )
}
