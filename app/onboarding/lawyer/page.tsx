'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { apiUploadLawyerDoc, apiSubmitLawyerOnboarding } from '@/lib/api'

// ── Constants ──────────────────────────────────────────────────────────────────
const BAR_COUNCILS = [
  'Bar Council of Delhi','Bar Council of Maharashtra & Goa','Bar Council of Uttar Pradesh',
  'Bar Council of Tamil Nadu','Bar Council of Karnataka','Bar Council of West Bengal',
  'Bar Council of Rajasthan','Bar Council of Gujarat','Bar Council of Kerala',
  'Bar Council of Andhra Pradesh','Bar Council of Telangana','Bar Council of Punjab & Haryana',
  'Bar Council of Bihar','Bar Council of Madhya Pradesh','Bar Council of Odisha',
  'Bar Council of Assam, Nagaland, Meghalaya, Manipur, Tripura, Mizoram & Arunachal Pradesh',
  'Bar Council of Chhattisgarh','Bar Council of Jharkhand','Bar Council of Uttarakhand',
  'Bar Council of Himachal Pradesh','Bar Council of Jammu & Kashmir',
  'Bar Council of Goa','Bar Council of Sikkim','Bar Council of Chandigarh',
  'Supreme Court Bar Association',
]

const PRACTICE_AREAS = [
  'Criminal','Family & Matrimonial','Property & Real Estate','Corporate & Commercial',
  'Labour & Employment','Intellectual Property','Taxation','Civil Litigation',
  'Consumer Protection','Constitutional','Arbitration & Mediation','Startup & Venture',
  'Immigration','Insolvency & Bankruptcy','Banking & Finance','Cyber Law',
]

const COURTS = [
  'Supreme Court of India','Delhi High Court','Bombay High Court','Madras High Court',
  'Calcutta High Court','Karnataka High Court','Allahabad High Court','Kerala High Court',
  'Gujarat High Court','Rajasthan High Court','Punjab & Haryana High Court',
  'District Courts','Sessions Courts','Family Courts','NCLT','NCLAT',
  'Consumer Forum','Labour Tribunal','Debt Recovery Tribunal',
]

const LANGUAGES = [
  'English','Hindi','Tamil','Telugu','Bengali','Marathi',
  'Gujarati','Kannada','Malayalam','Punjabi','Odia','Urdu',
]

const DOC_SERVICES = [
  { slug: 'gst-registration', label: 'GST Registration' },
  { slug: 'company-registration', label: 'Company Registration' },
  { slug: 'trademark-registration', label: 'Trademark Registration' },
  { slug: 'rent-agreement', label: 'Rent Agreement Drafting' },
  { slug: 'legal-notice', label: 'Legal Notice' },
  { slug: 'partnership-deed', label: 'Partnership Deed' },
  { slug: 'will-drafting', label: 'Will Drafting' },
  { slug: 'nda', label: 'Non-Disclosure Agreement' },
]

const TOTAL_PAGES = 4

// ── Animations ────────────────────────────────────────────────────────────────
const pageVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}
const pageTransition = { duration: 0.3, ease: 'easeOut' as const }

// ── Sub-components ────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function TextInput({ id, value, onChange, placeholder, type = 'text', disabled }: {
  id: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <input
      id={id} type={type} value={value} placeholder={placeholder} disabled={disabled}
      onChange={e => onChange(e.target.value)}
      className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500
        focus:outline-none focus:border-[#C9A227]/60 focus:bg-white/10 transition-all disabled:opacity-50"
    />
  )
}

function Textarea({ id, value, onChange, placeholder, rows = 4 }: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      id={id} value={value} rows={rows} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500
        focus:outline-none focus:border-[#C9A227]/60 focus:bg-white/10 transition-all resize-none"
    />
  )
}

function Select({ id, value, onChange, options, placeholder }: {
  id: string; value: string; onChange: (v: string) => void
  options: string[]; placeholder?: string
}) {
  return (
    <select
      id={id} value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-11 px-3.5 rounded-lg bg-[#0E1220] border border-white/15 text-white text-sm
        focus:outline-none focus:border-[#C9A227]/60 transition-all appearance-none"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function ChipSelect({ options, selected, onChange, max }: {
  options: string[]; selected: string[]
  onChange: (v: string[]) => void; max?: number
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt))
    } else if (!max || selected.length < max) {
      onChange([...selected, opt])
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt} type="button" onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              active
                ? 'bg-[#C9A227] border-[#C9A227] text-[#080B12]'
                : 'bg-white/5 border-white/15 text-slate-300 hover:border-[#C9A227]/50'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function FileUploadField({ label, docType, path, onUploaded, accept = 'image/jpeg,image/png,application/pdf' }: {
  label: string
  docType: 'profile_photo' | 'enrolment_cert' | 'bar_id_front' | 'bar_id_back' | 'govt_id'
  path: string
  onUploaded: (path: string) => void
  accept?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [filename, setFilename] = useState('')

  const handleFile = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { setError('Maximum file size is 5 MB'); return }
    setError(''); setUploading(true)
    try {
      const res = await apiUploadLawyerDoc(file, docType)
      onUploaded(res.path)
      setFilename(file.name)
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [docType, onUploaded])

  return (
    <div>
      <FieldLabel required>{label}</FieldLabel>
      <label
        htmlFor={`upload-${docType}`}
        className={`flex items-center gap-3 h-12 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-all
          ${path ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 bg-white/3 hover:border-[#C9A227]/50 hover:bg-[#C9A227]/5'}`}
      >
        {uploading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
        ) : path ? (
          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
        <span className={`text-sm truncate ${path ? 'text-emerald-300' : 'text-slate-400'}`}>
          {uploading ? 'Uploading…' : path ? (filename || 'Uploaded') : 'Click to upload or drag and drop'}
        </span>
        <span className="text-xs text-slate-500 ml-auto flex-shrink-0">PDF · JPG · PNG · 5 MB</span>
        <input
          id={`upload-${docType}`} type="file" accept={accept} className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-white mb-5 pb-2 border-b border-white/10">{children}</h2>
}

function FeeInput({ label, id, value, onChange }: { label: string; id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <FieldLabel>{label} (per minute)</FieldLabel>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
        <input
          id={id} type="number" min="5" max="500" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-11 pl-8 pr-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm
            focus:outline-none focus:border-[#C9A227]/60 focus:bg-white/10 transition-all"
        />
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LawyerOnboardingPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [dir, setDir] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Page 1 — Credentials
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [barState, setBarState] = useState('')
  const [barNumber, setBarNumber] = useState('')
  const [enrolmentYear, setEnrolmentYear] = useState('')
  const [profilePhotoPath, setProfilePhotoPath] = useState('')
  const [enrolmentCertPath, setEnrolmentCertPath] = useState('')
  const [barIdFrontPath, setBarIdFrontPath] = useState('')
  const [barIdBackPath, setBarIdBackPath] = useState('')
  const [govtIdType, setGovtIdType] = useState<'PAN'|'AADHAAR'|'PASSPORT'>('PAN')
  const [govtIdPath, setGovtIdPath] = useState('')

  // Page 2 — Profile
  const [bio, setBio] = useState('')
  const [firmName, setFirmName] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [languages, setLanguages] = useState<string[]>(['English'])
  const [courts, setCourts] = useState<string[]>([])
  const [practiceAreas, setPracticeAreas] = useState<string[]>([])
  const [yearsExp, setYearsExp] = useState('')

  // Page 3 — Services
  const [consultTypes, setConsultTypes] = useState<string[]>(['chat','voice','video'])
  const [feeChat, setFeeChat] = useState('20')
  const [feeVoice, setFeeVoice] = useState('30')
  const [feeVideo, setFeeVideo] = useState('40')
  const [docServices, setDocServices] = useState<string[]>([])
  const [availableNow, setAvailableNow] = useState(false)

  // Page 4 — Payout & Trust
  const [bankAccount, setBankAccount] = useState('')
  const [bankIfsc, setBankIfsc] = useState('')
  const [bankName, setBankName] = useState('')
  const [upiId, setUpiId] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [achievements, setAchievements] = useState('')
  const [certifications, setCertifications] = useState('')

  function goTo(next: number) {
    setDir(next > page ? 1 : -1)
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validatePage(): string | null {
    if (page === 1) {
      if (!firstName.trim()) return 'First name is required'
      if (!lastName.trim()) return 'Last name is required'
      if (!phone.trim()) return 'Phone number is required'
      if (!barState) return 'Please select your State Bar Council'
      if (!barNumber.trim()) return 'Enrolment number is required'
      if (!enrolmentYear || isNaN(Number(enrolmentYear))) return 'Year of enrolment is required'
      if (!enrolmentCertPath) return 'Please upload your Bar Council Enrolment Certificate'
      if (!barIdFrontPath) return 'Please upload the front of your Bar Council ID Card'
      if (!barIdBackPath) return 'Please upload the back of your Bar Council ID Card'
      if (!govtIdPath) return 'Please upload your Government ID document'
    }
    if (page === 2) {
      if (!bio.trim() || bio.trim().length < 50) return 'Bio must be at least 50 characters'
      if (courts.length === 0) return 'Please select at least one court you practice in'
      if (practiceAreas.length === 0) return 'Please select at least one practice area'
    }
    if (page === 3) {
      if (consultTypes.length === 0) return 'Please select at least one consultation type'
      if (!bankAccount.trim() && !upiId.trim()) return 'Please provide bank account details or a UPI ID'
    }
    return null
  }

  function handleNext() {
    const err = validatePage()
    if (err) { setSubmitError(err); return }
    setSubmitError('')
    goTo(page + 1)
  }

  async function handleSubmit() {
    const err = validatePage()
    if (err) { setSubmitError(err); return }
    setSubmitError('')
    setSubmitting(true)
    try {
      await apiSubmitLawyerOnboarding({
        firstName, lastName, phone,
        barCouncilState: barState, barCouncilNumber: barNumber, enrolmentYear,
        profilePhotoPath, enrolmentCertPath, barIdFrontPath, barIdBackPath,
        govtIdType, govtIdPath,
        bio, firmName, linkedinUrl, websiteUrl,
        languages, courtsPracticed: courts, specializations: practiceAreas,
        primarySpecialization: practiceAreas[0] ?? 'General Practice',
        yearsExperience: yearsExp,
        consultationTypes: consultTypes,
        feeChat, feeVoice, feeVideo,
        documentServices: docServices,
        availabilitySlots: availableNow ? { instant: true } : {},
        bankAccountNumber: bankAccount, bankIfsc, bankName, upiId,
        panNumber, gstNumber, notableAchievements: achievements, certifications,
      })
      router.push('/lawyer-dashboard?onboarding=success')
    } catch (e: any) {
      setSubmitError(e.message || 'Submission failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080B12] px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-[#C9A227] uppercase tracking-widest mb-1">
            Lawyer Registration
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">Complete Your Profile</h1>
          <p className="text-sm text-slate-400">
            Your profile will be reviewed and verified before going live. All information is kept confidential.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Step {page} of {TOTAL_PAGES}</span>
            <span>{Math.round((page / TOTAL_PAGES) * 100)}% complete</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#C9A227] rounded-full"
              animate={{ width: `${(page / TOTAL_PAGES) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {['Credentials', 'Profile', 'Services', 'Payout'].map((label, i) => (
              <div key={label} className={`text-xs font-medium transition-colors ${i + 1 <= page ? 'text-[#C9A227]' : 'text-slate-600'}`}>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Form pages */}
        <div className="bg-[#0E1220] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={page}
              custom={dir}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
              className="p-8"
            >

              {/* ── Page 1: Credentials & Identity ─────────────────────── */}
              {page === 1 && (
                <div className="space-y-5">
                  <SectionTitle>Bar Council Credentials</SectionTitle>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel required>First Name</FieldLabel>
                      <TextInput id="firstName" value={firstName} onChange={setFirstName} placeholder="As on Bar Council ID" />
                    </div>
                    <div>
                      <FieldLabel required>Last Name</FieldLabel>
                      <TextInput id="lastName" value={lastName} onChange={setLastName} placeholder="As on Bar Council ID" />
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>Mobile Number</FieldLabel>
                    <TextInput id="phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" type="tel" />
                  </div>

                  <div>
                    <FieldLabel required>State Bar Council</FieldLabel>
                    <Select id="barState" value={barState} onChange={setBarState} options={BAR_COUNCILS} placeholder="Select Bar Council" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel required>Enrolment Number (Sanad)</FieldLabel>
                      <TextInput id="barNumber" value={barNumber} onChange={setBarNumber} placeholder="e.g. D/1234/2015" />
                    </div>
                    <div>
                      <FieldLabel required>Year of Enrolment</FieldLabel>
                      <TextInput id="enrolYear" value={enrolmentYear} onChange={setEnrolmentYear} type="number" placeholder="e.g. 2015" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Document Uploads</p>
                    <div className="space-y-3">
                      <FileUploadField
                        label="Professional Photo (optional)"
                        docType="profile_photo"
                        path={profilePhotoPath}
                        onUploaded={setProfilePhotoPath}
                        accept="image/jpeg,image/png"
                      />
                      <FileUploadField
                        label="Bar Council Enrolment Certificate"
                        docType="enrolment_cert"
                        path={enrolmentCertPath}
                        onUploaded={setEnrolmentCertPath}
                      />
                      <FileUploadField
                        label="Bar Council ID Card — Front"
                        docType="bar_id_front"
                        path={barIdFrontPath}
                        onUploaded={setBarIdFrontPath}
                        accept="image/jpeg,image/png"
                      />
                      <FileUploadField
                        label="Bar Council ID Card — Back"
                        docType="bar_id_back"
                        path={barIdBackPath}
                        onUploaded={setBarIdBackPath}
                        accept="image/jpeg,image/png"
                      />
                      <div>
                        <FieldLabel required>Government ID Type</FieldLabel>
                        <div className="flex gap-3 mb-3">
                          {(['PAN','AADHAAR','PASSPORT'] as const).map(t => (
                            <button
                              key={t} type="button"
                              onClick={() => setGovtIdType(t)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                govtIdType === t
                                  ? 'bg-[#C9A227] border-[#C9A227] text-[#080B12]'
                                  : 'bg-white/5 border-white/15 text-slate-300 hover:border-[#C9A227]/50'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        <FileUploadField
                          label={`${govtIdType} Document`}
                          docType="govt_id"
                          path={govtIdPath}
                          onUploaded={setGovtIdPath}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Page 2: Professional Profile ───────────────────────── */}
              {page === 2 && (
                <div className="space-y-5">
                  <SectionTitle>Professional Profile</SectionTitle>

                  <div>
                    <FieldLabel required>Professional Bio</FieldLabel>
                    <Textarea
                      id="bio" value={bio} onChange={setBio} rows={5}
                      placeholder="Describe your professional background, areas of expertise, and your approach to client service. (Minimum 50 characters)"
                    />
                    <p className="text-xs text-slate-500 mt-1">{bio.length} characters</p>
                  </div>

                  <div>
                    <FieldLabel required>Courts Practiced In</FieldLabel>
                    <ChipSelect options={COURTS} selected={courts} onChange={setCourts} />
                  </div>

                  <div>
                    <FieldLabel required>Practice Areas</FieldLabel>
                    <ChipSelect options={PRACTICE_AREAS} selected={practiceAreas} onChange={setPracticeAreas} max={6} />
                    <p className="text-xs text-slate-500 mt-1">Select up to 6</p>
                  </div>

                  <div>
                    <FieldLabel>Languages Spoken</FieldLabel>
                    <ChipSelect options={LANGUAGES} selected={languages} onChange={setLanguages} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Firm Name</FieldLabel>
                      <TextInput id="firm" value={firmName} onChange={setFirmName} placeholder="Or leave blank for Independent Practice" />
                    </div>
                    <div>
                      <FieldLabel>Years of Experience</FieldLabel>
                      <TextInput id="exp" value={yearsExp} onChange={setYearsExp} type="number" placeholder="e.g. 8" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>LinkedIn Profile</FieldLabel>
                      <TextInput id="linkedin" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="linkedin.com/in/yourprofile" />
                    </div>
                    <div>
                      <FieldLabel>Website</FieldLabel>
                      <TextInput id="website" value={websiteUrl} onChange={setWebsiteUrl} placeholder="yourfirm.com" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Page 3: Services & Pricing ─────────────────────────── */}
              {page === 3 && (
                <div className="space-y-6">
                  <SectionTitle>Services & Pricing</SectionTitle>

                  <div>
                    <FieldLabel required>Consultation Types Offered</FieldLabel>
                    <div className="flex gap-3">
                      {[
                        { value: 'chat', label: 'Chat' },
                        { value: 'voice', label: 'Voice Call' },
                        { value: 'video', label: 'Video Call' },
                      ].map(({ value, label }) => {
                        const active = consultTypes.includes(value)
                        return (
                          <button
                            key={value} type="button"
                            onClick={() => setConsultTypes(
                              active ? consultTypes.filter(c => c !== value) : [...consultTypes, value]
                            )}
                            className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                              active ? 'bg-[#C9A227] border-[#C9A227] text-[#080B12]' : 'bg-white/5 border-white/15 text-slate-300 hover:border-[#C9A227]/50'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {consultTypes.includes('chat') && (
                      <FeeInput label="Chat" id="feeChat" value={feeChat} onChange={setFeeChat} />
                    )}
                    {consultTypes.includes('voice') && (
                      <FeeInput label="Voice" id="feeVoice" value={feeVoice} onChange={setFeeVoice} />
                    )}
                    {consultTypes.includes('video') && (
                      <FeeInput label="Video" id="feeVideo" value={feeVideo} onChange={setFeeVideo} />
                    )}
                  </div>

                  <div>
                    <FieldLabel>Document Services You Can Draft</FieldLabel>
                    <p className="text-xs text-slate-500 mb-3">
                      Select services you are comfortable handling. Clients will see you as an available advocate for these.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {DOC_SERVICES.map(({ slug, label }) => {
                        const active = docServices.includes(slug)
                        return (
                          <button
                            key={slug} type="button"
                            onClick={() => setDocServices(
                              active ? docServices.filter(s => s !== slug) : [...docServices, slug]
                            )}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm border transition-all text-left ${
                              active ? 'bg-[#C9A227]/10 border-[#C9A227]/40 text-[#C9A227]' : 'bg-white/3 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                              active ? 'bg-[#C9A227] border-[#C9A227]' : 'border-white/20'
                            }`}>
                              {active && (
                                <svg className="w-2.5 h-2.5 text-[#080B12]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="text-sm font-medium text-white">Available for Instant Consultation</p>
                      <p className="text-xs text-slate-400 mt-0.5">Clients can connect with you immediately when you are online</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAvailableNow(!availableNow)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${availableNow ? 'bg-[#C9A227]' : 'bg-white/20'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${availableNow ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Page 4: Payout & Trust ─────────────────────────────── */}
              {page === 4 && (
                <div className="space-y-6">
                  <SectionTitle>Payout Details</SectionTitle>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-300 leading-relaxed">
                      Payout details are used to transfer your consultation earnings. Information is encrypted and never shared with clients.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Bank Account Number</FieldLabel>
                      <TextInput id="bankAcc" value={bankAccount} onChange={setBankAccount} placeholder="Account number" />
                    </div>
                    <div>
                      <FieldLabel>IFSC Code</FieldLabel>
                      <TextInput id="ifsc" value={bankIfsc} onChange={setBankIfsc} placeholder="e.g. SBIN0001234" />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Bank Name</FieldLabel>
                    <TextInput id="bankName" value={bankName} onChange={setBankName} placeholder="e.g. State Bank of India" />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-slate-500 flex-shrink-0">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div>
                    <FieldLabel>UPI ID (alternative to bank account)</FieldLabel>
                    <TextInput id="upi" value={upiId} onChange={setUpiId} placeholder="yourname@upi" />
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <SectionTitle>Tax Information</SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>PAN Number</FieldLabel>
                        <TextInput id="pan" value={panNumber} onChange={setPanNumber} placeholder="ABCDE1234F" />
                      </div>
                      <div>
                        <FieldLabel>GST Number (if registered)</FieldLabel>
                        <TextInput id="gst" value={gstNumber} onChange={setGstNumber} placeholder="27AAPFU0939F1ZV" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <SectionTitle>Additional Information</SectionTitle>
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>Notable Cases or Achievements</FieldLabel>
                        <Textarea id="achievements" value={achievements} onChange={setAchievements} rows={3}
                          placeholder="Briefly describe significant cases, verdicts, or professional achievements (optional)"
                        />
                      </div>
                      <div>
                        <FieldLabel>Certifications or Additional Qualifications</FieldLabel>
                        <Textarea id="certs" value={certifications} onChange={setCertifications} rows={2}
                          placeholder="e.g. Certified Mediator, LLM in Corporate Law (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Review summary */}
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Review Summary</p>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex justify-between"><span className="text-slate-500">Name</span><span>{firstName} {lastName}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Bar Council</span><span className="text-right max-w-[60%]">{barState || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Enrolment No.</span><span>{barNumber || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Practice Areas</span><span className="text-right max-w-[60%]">{practiceAreas.slice(0,3).join(', ')}{practiceAreas.length > 3 ? ` +${practiceAreas.length - 3}` : ''}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Consultation Rates</span>
                        <span>
                          {[
                            consultTypes.includes('chat') ? `Chat ₹${feeChat}/min` : null,
                            consultTypes.includes('video') ? `Video ₹${feeVideo}/min` : null,
                          ].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Footer nav */}
          <div className="px-8 py-5 border-t border-white/10 flex items-center justify-between gap-4">
            {page > 1 ? (
              <button
                type="button" onClick={() => goTo(page - 1)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
            ) : <div />}

            <div className="flex-1 text-center">
              {submitError && (
                <p className="text-xs text-red-400">{submitError}</p>
              )}
            </div>

            {page < TOTAL_PAGES ? (
              <button
                type="button" onClick={handleNext}
                className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#E5C050] text-[#080B12] font-bold text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                Continue
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ) : (
              <button
                type="button" onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#E5C050] text-[#080B12] font-bold text-sm px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#080B12]/30 border-t-[#080B12] rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : 'Submit for Verification'}
              </button>
            )}
          </div>
        </div>

        {/* Info note */}
        <p className="text-xs text-slate-600 text-center mt-5">
          Your information is reviewed by our compliance team within 2–3 business days.
          All documents are stored securely and never shared publicly.
        </p>
      </div>
    </div>
  )
}
