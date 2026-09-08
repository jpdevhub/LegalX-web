'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus'
import { PushToggle } from '@/components/lawyer-portal/PushToggle'
import Link from 'next/link'
import { apiGetLawyerMe, apiGetPortalConsultations, apiGetLawyerStats, type LawyerMe, type LawyerStats, type PortalConsultation } from '@/lib/api'

function StatCard({ label, value, sub, color = '#C9A227' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-[#0E1220] border border-white/8 rounded-2xl p-5">
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-white text-3xl font-bold mt-2" style={{ color }}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function ConsultRow({ c }: { c: PortalConsultation }) {
  const time = c.scheduledAt ? new Date(c.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'On demand'
  const typeColor = { chat: 'bg-blue-500/15 text-blue-300', voice: 'bg-purple-500/15 text-purple-300', video: 'bg-emerald-500/15 text-emerald-300' }[c.type]
  const statusColor = { upcoming: 'text-[#C9A227]', active: 'text-emerald-400', pending: 'text-slate-400' }[c.status as string] ?? 'text-slate-400'

  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="text-center min-w-[52px]">
        <p className="text-white font-semibold text-sm">{time}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{c.clientName}</p>
        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${typeColor}`}>
          {c.type.toUpperCase()}
        </span>
      </div>
      <div className="text-right">
        <p className={`text-xs font-semibold capitalize ${statusColor}`}>{c.status}</p>
        <p className="text-slate-500 text-xs mt-0.5">₹{c.fee}</p>
      </div>
      {c.status === 'active' && (
        <Link href={`/consultation/${c.id}`} className="px-3 py-1.5 rounded-lg bg-[#C9A227] text-[#0A0D14] text-xs font-bold hover:bg-[#D4B840] transition-colors whitespace-nowrap">
          Join Now
        </Link>
      )}
    </div>
  )
}

export default function LawyerDashboardPage() {
  const [lm, setLm]     = useState<LawyerMe | null>(null)
  const [calls, setCalls] = useState<PortalConsultation[]>([])
  const [stats, setStats] = useState<LawyerStats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [l, c, st] = await Promise.all([
      apiGetLawyerMe(),
      apiGetPortalConsultations('upcoming'),
      apiGetLawyerStats(),
    ])
    setLm(l)
    setCalls(c.slice(0, 6))
    setStats(st)
    setLoading(false)
  }, [])

  // Guarded async inside the effect, so nothing is set synchronously as it runs
  // and nothing is set after unmount. `load` stays for the focus refresh below.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [l, c, st] = await Promise.all([
        apiGetLawyerMe(),
        apiGetPortalConsultations('upcoming'),
        apiGetLawyerStats(),
      ])
      if (cancelled) return
      setLm(l)
      setCalls(c.slice(0, 6))
      setStats(st)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  // The dashboard fetched once on mount, so a lawyer returning from a call was
  // shown the counts from before it — the consultation was recorded, the page
  // simply never asked again.
  useRefreshOnFocus(load)

  // Verification gate
  if (!loading && lm && lm.verification_status !== 'verified') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {lm.verification_status === 'rejected' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round"/><line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round"/></svg>
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">Application Rejected</h2>
              <p className="text-slate-400 text-sm mb-2">Reason: {lm.rejection_reason ?? 'No reason provided'}</p>
              <p className="text-slate-500 text-sm mb-6">Please correct the issues and resubmit your profile.</p>
              <Link href="/onboarding/lawyer" className="inline-block px-6 py-3 rounded-xl bg-[#C9A227] text-[#0A0D14] font-bold text-sm hover:bg-[#D4B840] transition-colors">Resubmit Application</Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">Verification Pending</h2>
              <p className="text-slate-400 text-sm mb-6">
                {lm.onboarding_complete
                  ? 'Your documents are under review. Our compliance team will verify your Bar Council credentials within 24-48 hours. You\'ll receive an email once approved.'
                  : 'Please complete your profile and submit your credentials for verification.'}
              </p>
              {!lm.onboarding_complete && (
                <Link href="/onboarding/lawyer" className="inline-block px-6 py-3 rounded-xl bg-[#C9A227] text-[#0A0D14] font-bold text-sm hover:bg-[#D4B840] transition-colors">Complete Profile</Link>
              )}
              {lm.onboarding_complete && (
                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
                  Under review — no action needed
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  const profile = lm?.profile

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm mb-1">{today}</p>
        <h1 className="text-white text-2xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {profile?.name?.split(' ')[0] ?? 'Advocate'}</h1>
        <p className="text-slate-400 text-sm mt-1">Here's your practice overview for today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Consultations this month"
          value={stats?.consultationsThisMonth ?? 0}
          sub={`${stats?.totalHandled ?? 0} handled in total`}
        />
        <StatCard
          label="Avg Rating"
          value={stats?.avgRating ? `${stats.avgRating}★` : '—'}
          sub={`${stats?.reviewCount ?? 0} review${stats?.reviewCount === 1 ? '' : 's'}`}
          color="#C9A227"
        />
        <StatCard
          label="Earned this month"
          value={stats ? `₹${stats.earnedThisMonth}` : '—'}
          sub="Before commission"
          color="#34d399"
        />
        <StatCard
          label="Minutes this month"
          value={stats?.minutesThisMonth ?? 0}
          sub="Across all consultations"
          color="#a78bfa"
        />
      </div>

      {/* Today's consultations */}
      {/* Sits above the fold on the page a lawyer lands on, because a lawyer who
          never sees this can only be reached with a tab open. */}
      <div className="mb-6">
        <PushToggle />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0E1220] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Today's Consultations</h2>
            <Link href="/lawyer-dashboard/consultations" className="text-[#C9A227] text-xs hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : calls.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500 text-sm">No consultations scheduled</p>
              <p className="text-slate-600 text-xs mt-1">Go online to start accepting clients</p>
            </div>
          ) : (
            <div>{calls.map(c => <ConsultRow key={c.id} c={c} />)}</div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-[#0E1220] border border-white/8 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { label: 'View Document Requests', href: '/lawyer-dashboard/documents', desc: 'Drafting & verification queue' },
                { label: 'Update Profile & Services', href: '/lawyer-dashboard/settings', desc: 'Bio, rates, availability' },
                { label: 'Check Earnings', href: '/lawyer-dashboard/payouts', desc: 'Payouts & transaction history' },
              ].map(a => (
                <Link key={a.href} href={a.href} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 hover:border-[#C9A227]/30 transition-all group">
                  <div>
                    <p className="text-white text-sm font-medium group-hover:text-[#C9A227] transition-colors">{a.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{a.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-600 group-hover:text-[#C9A227] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Profile completeness */}
          {profile && (
            <div className="bg-[#0E1220] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-semibold">Profile Strength</h3>
                <span className="text-[#C9A227] text-xs font-bold">
                  {[profile.bio, profile.avatarUrl, profile.barNumber].filter(Boolean).length * 33}%
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#C9A227] rounded-full" style={{ width: `${[profile.bio, profile.avatarUrl, profile.barNumber].filter(Boolean).length * 33}%` }} />
              </div>
              <p className="text-slate-500 text-xs mt-2">Complete bio and photo to attract more clients</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
