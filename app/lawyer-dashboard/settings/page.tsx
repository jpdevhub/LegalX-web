'use client'

import { useEffect, useState } from 'react'
import { apiGetLawyerSettings, apiUpdateLawyerSettings, type LawyerSettings } from '@/lib/api'

const COURTS = ['Supreme Court', 'High Court', 'District Court', 'Family Court', 'Consumer Forum', 'Tribunal', 'Sessions Court']
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0E1220] border border-white/8 rounded-2xl p-5 sm:p-6">
      <h2 className="text-white font-semibold text-base mb-5 pb-4 border-b border-white/8">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full h-10 px-3.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#C9A227]/60 transition-all'

function Toggle({ enabled, onToggle, label, desc }: { enabled: boolean; onToggle: () => void; label: string; desc: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full shrink-0 mt-0.5 transition-colors duration-300 ${enabled ? 'bg-[#C9A227]' : 'bg-slate-700'} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${enabled ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [form,    setForm]    = useState<Partial<LawyerSettings>>({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    apiGetLawyerSettings().then(s => {
      if (s) setForm(s)
      setLoading(false)
    })
  }, [])

  function set<K extends keyof LawyerSettings>(key: K, val: LawyerSettings[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function toggleArray<T extends string>(key: keyof LawyerSettings, val: T) {
    const arr = (form[key] as T[] | undefined) ?? []
    set(key as any, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  async function handleSave() {
    setSaving(true)
    try {
      await apiUpdateLawyerSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  const consultFeeInvalid = form.consultationEnabled && (form.consultationFeePerMin ?? 0) < 25

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-40 bg-[#0E1220] border border-white/8 rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your professional profile and service configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !!consultFeeInvalid}
          className="px-5 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B840] text-[#0A0D14] text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saved ? (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Saved</>
          ) : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-5">
        {/* Professional Bio */}
        <Section title="Professional Profile">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" required>
              <input className={inputCls} value={form.firstName ?? ''} onChange={e => set('firstName', e.target.value)} placeholder="Advocate's first name" />
            </Field>
            <Field label="Last Name" required>
              <input className={inputCls} value={form.lastName ?? ''} onChange={e => set('lastName', e.target.value)} placeholder="Last name" />
            </Field>
            <Field label="Firm Name">
              <input className={inputCls} value={form.firmName ?? ''} onChange={e => set('firmName', e.target.value)} placeholder="Your firm or chamber name" />
            </Field>
            <Field label="LinkedIn Profile">
              <input className={inputCls} value={form.linkedinUrl ?? ''} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/…" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Professional Bio">
                <textarea
                  value={form.bio ?? ''}
                  onChange={e => set('bio', e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Describe your practice in 100–150 words. Mention your specialisation, notable cases, and experience…"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#C9A227]/60 transition-all resize-none"
                />
                <p className="text-slate-600 text-xs text-right mt-1">{(form.bio ?? '').length}/500</p>
              </Field>
            </div>
          </div>

          {/* Courts */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Practicing Courts</p>
            <div className="flex flex-wrap gap-2">
              {COURTS.map(c => {
                const active = (form.courtsPracticed ?? []).includes(c)
                return (
                  <button key={c} onClick={() => toggleArray('courtsPracticed', c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${active ? 'bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/30' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Languages */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Languages</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => {
                const active = (form.languages ?? []).includes(l)
                return (
                  <button key={l} onClick={() => toggleArray('languages', l)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${active ? 'bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/30' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
                    {l}
                  </button>
                )
              })}
            </div>
          </div>
        </Section>

        {/* Services */}
        <Section title="Service Configuration">
          <Toggle
            enabled={form.draftingEnabled ?? false}
            onToggle={() => set('draftingEnabled', !form.draftingEnabled)}
            label="Document Drafting"
            desc="Clients can request custom legal documents from you"
          />
          <Toggle
            enabled={form.verificationEnabled ?? false}
            onToggle={() => set('verificationEnabled', !form.verificationEnabled)}
            label="Document Verification"
            desc="Review and certify client documents (platform-fixed pricing)"
          />
          <Toggle
            enabled={form.consultationEnabled ?? false}
            onToggle={() => set('consultationEnabled', !form.consultationEnabled)}
            label="Video / Voice / Chat Consultations"
            desc="Receive real-time consultation requests from clients"
          />

          {form.consultationEnabled && (
            <div className="mt-5 space-y-4 pt-4 border-t border-white/8">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Consultation Types</p>
                <div className="flex gap-3 flex-wrap">
                  {(['chat', 'voice', 'video'] as const).map(t => {
                    const active = (form.consultationTypes ?? []).includes(t)
                    return (
                      <button key={t} onClick={() => toggleArray('consultationTypes', t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all border ${active ? 'bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                        {t === 'chat' ? 'Text Chat' : t === 'voice' ? 'Voice Call' : 'Video Call'}
                      </button>
                    )
                  })}
                </div>
              </div>
              <Field label="Per-minute Consultation Rate (INR)">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min={25}
                    value={form.consultationFeePerMin ?? ''}
                    onChange={e => set('consultationFeePerMin', parseFloat(e.target.value))}
                    placeholder="25"
                    className={`${inputCls} pl-8 ${consultFeeInvalid ? 'border-red-500/50' : ''}`}
                  />
                </div>
                {consultFeeInvalid && <p className="text-red-400 text-xs mt-1">Minimum rate is ₹25/min as per platform policy</p>}
              </Field>
            </div>
          )}
        </Section>

        {/* Payout details */}
        <Section title="Payout & Tax Details">
          {/* PAN warning banner */}
          {!form.panNumber && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/40 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <div>
                <p className="text-red-300 font-semibold text-sm">PAN Required to Avoid Higher TDS</p>
                <p className="text-red-400/80 text-xs mt-1">Without PAN, TDS is deducted at 20% on all payouts instead of the standard 10%. Add your PAN below to save on tax deductions.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bank Account Holder Name">
              <input className={inputCls} value={form.bankAccountName ?? ''} onChange={e => set('bankAccountName', e.target.value)} placeholder="Name as on bank account" />
            </Field>
            <Field label="Account Number">
              <input className={inputCls} value={form.bankAccountNumber ?? ''} onChange={e => set('bankAccountNumber', e.target.value)} placeholder="Bank account number" />
            </Field>
            <Field label="IFSC Code">
              <input className={inputCls} value={form.bankIfsc ?? ''} onChange={e => set('bankIfsc', e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" maxLength={11} />
            </Field>
            <Field label="UPI ID (Optional)">
              <input className={inputCls} value={form.upiId ?? ''} onChange={e => set('upiId', e.target.value)} placeholder="yourname@upi" />
            </Field>
            <Field label="GST Number">
              <input className={inputCls} value={form.gstNumber ?? ''} onChange={e => set('gstNumber', e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} />
            </Field>
            <Field label="PAN Number">
              <input
                className={`${inputCls} ${form.panNumber ? 'border-emerald-500/30' : 'border-red-500/30'}`}
                value={form.panNumber ?? ''}
                onChange={e => set('panNumber', e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              {form.panNumber && <p className="text-emerald-400 text-xs mt-1">Standard 10% TDS applies</p>}
            </Field>
          </div>
        </Section>
      </div>

      {/* Sticky save on mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#080B12]/90 backdrop-blur-md border-t border-white/8 lg:hidden">
        <button
          onClick={handleSave}
          disabled={saving || !!consultFeeInvalid}
          className="w-full py-3 rounded-xl bg-[#C9A227] hover:bg-[#D4B840] text-[#0A0D14] text-sm font-bold transition-all disabled:opacity-50"
        >
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
      <div className="h-20 lg:hidden" /> {/* spacer for sticky bar */}
    </div>
  )
}
