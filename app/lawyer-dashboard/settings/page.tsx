'use client'

import { useEffect, useState } from 'react'
import { apiGetLawyerSettings, apiUpdateLawyerSettings, apiUploadLawyerDoc, apiGetMe, type LawyerSettings } from '@/lib/api'

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

  const [accountId, setAccountId] = useState<string | null>(null)
  // Bumped after an upload so the browser re-requests the photo instead of
  // serving the cached redirect for the picture that was just replaced.
  const [photoVersion, setPhotoVersion] = useState(0)

  useEffect(() => {
    apiGetLawyerSettings().then(s => {
      if (s) setForm(s)
      setLoading(false)
    })
    apiGetMe().then(me => { if (me) setAccountId(me.id) })
  }, [])

  function set<K extends keyof LawyerSettings>(key: K, val: LawyerSettings[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function toggleArray<T extends string>(key: keyof LawyerSettings, val: T) {
    const arr = (form[key] as T[] | undefined) ?? []
    set(key as any, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    // Validated here rather than by disabling the button. A dimmed button with
    // no message is indistinguishable from a broken one — which is exactly how
    // this read when a rate below the floor silently disabled it.
    if (consultFeeInvalid) {
      setSaveError('Every consultation rate must be at least ₹25/min. Fix the highlighted rates below.')
      document.getElementById('consult-rates')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSaving(true)
    setSaveError(null)
    try {
      await apiUpdateLawyerSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      // Previously a bare finally, so a rejected save just stopped the spinner
      // and looked identical to a successful one.
      setSaveError(err?.message || 'Could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Each channel is priced separately, so each is validated separately —
  // a valid chat rate must not mask a video rate below the floor.
  const FEE_FIELDS = [
    { key: 'feeChat'  as const, label: 'Chat',  hint: 'Text consultation' },
    { key: 'feeVoice' as const, label: 'Voice', hint: 'Audio call' },
    { key: 'feeVideo' as const, label: 'Video', hint: 'Video call' },
  ]
  const feeInvalid = (k: 'feeChat' | 'feeVoice' | 'feeVideo') =>
    !!form.consultationEnabled && (form[k] ?? 0) < 25
  const consultFeeInvalid = FEE_FIELDS.some(f => feeInvalid(f.key))

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
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#D4B840] text-[#0A0D14] text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saved ? (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Saved</>
          ) : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {saveError && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-300">
          {saveError}
        </div>
      )}

      <div className="space-y-5">
        {/* Professional Bio */}
        <Section title="Professional Profile">
          <PhotoField
            url={form.profilePhotoUrl ?? null}
            name={`${form.firstName ?? ''} ${form.lastName ?? ''}`.trim()}
            photoEndpoint={accountId ? `/api/lawyers/${accountId}/photo?v=${photoVersion}` : ''}
            onUploaded={path => { set('profilePhotoUrl', path); setPhotoVersion(v => v + 1) }}
          />
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
              <div id="consult-rates" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {FEE_FIELDS.map(f => (
                  <Field key={f.key} label={`${f.label} — ₹/min`}>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                      <input
                        type="number"
                        min={25}
                        value={form[f.key] ?? ''}
                        onChange={e => set(f.key, parseFloat(e.target.value))}
                        placeholder="25"
                        className={`${inputCls} pl-8 ${feeInvalid(f.key) ? 'border-red-500/50' : ''}`}
                      />
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">{f.hint}</p>
                  </Field>
                ))}
              </div>
              {consultFeeInvalid && (
                <p className="text-red-400 text-xs mt-2">Minimum rate is ₹25/min as per platform policy</p>
              )}
              <p className="text-slate-500 text-xs mt-2">
                Saved rates appear immediately on your public profile and in the admin portal —
                they are read from the same record, not copied.
              </p>
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
            <Field label="Bank Name">
              <input className={inputCls} value={form.bankName ?? ''} readOnly disabled placeholder="Set during verification" />
              {/*
                The account number is stored encrypted (account_number_enc) and
                there is no encryption helper in this codebase yet, so this form
                cannot write one without putting it in the clear. It is captured
                during onboarding; changing it is a support request until that
                exists. Showing a field that silently discards what you type
                would be worse than not showing one.
              */}
              <p className="text-slate-500 text-[11px] mt-1">
                To change your account number, contact support — it is stored encrypted
                and cannot be edited here.
              </p>
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
          disabled={saving}
          className="w-full py-3 rounded-xl bg-[#C9A227] hover:bg-[#D4B840] text-[#0A0D14] text-sm font-bold transition-all disabled:opacity-50"
        >
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
      <div className="h-20 lg:hidden" /> {/* spacer for sticky bar */}
    </div>
  )
}

/**
 * Profile photo.
 *
 * Uploads through the same endpoint onboarding uses, then writes the returned
 * storage path into the form so it is saved with everything else. The photo is
 * read from lawyer_profiles.profile_photo_url, which is the column the public
 * directory and the admin portal already read — so changing it here changes it
 * everywhere, with nothing to copy across.
 */
function PhotoField({
  url, name, photoEndpoint, onUploaded,
}: { url: string | null; name: string; photoEndpoint: string; onUploaded: (path: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const initials = name
    .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'LX'

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/^image\/(jpeg|png)$/.test(file.type)) {
      setError('Use a JPEG or PNG image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('That image is over 5 MB. Please use a smaller one.')
      return
    }

    setBusy(true)
    setError(null)
    // Shown straight away from the local file: the stored path is not publicly
    // readable, so waiting on a round trip would leave the frame empty after a
    // successful upload and look like it had failed.
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    try {
      const { path } = await apiUploadLawyerDoc(file, 'profile_photo')
      onUploaded(path)
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Please try again.')
      setPreview(null)
      URL.revokeObjectURL(localUrl)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  // profile_photo_url holds a storage path in a private bucket, so it cannot be
  // rendered directly. The backend signs it on demand at this endpoint.
  const shown = preview ?? (url ? (/^https?:\/\//.test(url) ? url : photoEndpoint) : null)

  return (
    <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/8">
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        {shown
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={shown} alt="" className="w-full h-full object-cover" />
          : <span className="text-xl font-bold text-[#C9A227]">{initials}</span>}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-white mb-1">Profile photo</p>
        <p className="text-xs text-slate-500 mb-2.5">
          JPEG or PNG, up to 5&nbsp;MB. Shown on your public profile and to clients before they call.
        </p>
        <label className="inline-flex items-center gap-2 px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
          <input type="file" accept="image/jpeg,image/png" onChange={handleFile} disabled={busy} className="hidden" />
          {busy ? 'Uploading…' : url || preview ? 'Replace photo' : 'Upload photo'}
        </label>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        {(url || preview) && !error && !busy && (
          <p className="text-emerald-400 text-xs mt-2">Photo attached — press Save Changes to apply.</p>
        )}
      </div>
    </div>
  )
}
