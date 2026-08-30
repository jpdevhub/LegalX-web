/**
 * LegalX API Client
 * 
 * All data fetching goes through the Next.js proxy (rewrites in next.config.ts)
 * which forwards to the Express backend. This makes cookies work cross-origin.
 * No Supabase keys, anon keys, or service role keys exist in this file.
 * Authentication tokens live exclusively in HttpOnly cookies managed by the backend.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

let csrfPromise: Promise<string | undefined> | null = null

function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : undefined
}

// Determine base URL for fetch (relative in browser, absolute in SSR)
function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '' // Client: use Next.js rewrites
  return BACKEND_URL // Server: direct to backend
}

// Fetch CSRF token from backend via Next.js proxy (sets cookie)
async function fetchCsrfToken(): Promise<string | undefined> {
  // Use cached promise only if already in-flight — never cache a failure
  if (csrfPromise) return csrfPromise

  csrfPromise = (async () => {
    try {
      const baseUrl = getBaseUrl()
      const res = await fetch(`${baseUrl}/api/auth/csrf`, {
        credentials: 'include',
        signal: AbortSignal.timeout(5000), // 5 s hard timeout
      })
      if (res.ok) {
        const data = await res.json()
        return data.csrfToken as string
      }
    } catch {
      // Network error or timeout — fall through to cookie fallback
    }
    return getCsrfToken()
  })()

  // ⚠️ Critical: clear the promise slot after resolution so a future
  // call can retry on the next click (not reuse a stale/failed promise)
  csrfPromise.then(() => { csrfPromise = null }).catch(() => { csrfPromise = null })

  return csrfPromise
}

// Ensure CSRF token is available (fetches if needed)
async function ensureCsrfToken(): Promise<string | undefined> {
  const existing = getCsrfToken()
  if (existing) return existing
  return fetchCsrfToken()
}

type FetchOptions = RequestInit & { skipCredentials?: boolean; skipCsrf?: boolean }

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipCredentials, skipCsrf, ...fetchOpts } = options
  const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes((fetchOpts.method || 'GET').toUpperCase())
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOpts.headers as Record<string, string> || {}),
  }

  // Add CSRF token for mutations
  if (isMutation && !skipCsrf) {
    const csrfToken = await ensureCsrfToken()
    if (csrfToken) {
      headers[CSRF_HEADER_NAME] = csrfToken
    }
  }

  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}${path}`, {
    ...fetchOpts,
    credentials: skipCredentials ? 'omit' : 'include', // sends HttpOnly cookies
    headers,
  })

  if (!res.ok) {
    let body: { error?: string } = {}
    try { body = await res.json() } catch { /* ignore */ }
    const serverMsg = body.error

    // Map common status codes to user-friendly messages
    const friendlyMessages: Record<number, string> = {
      400: serverMsg || 'Invalid request. Please check your input.',
      401: serverMsg || 'Invalid email or password.',
      403: serverMsg || 'Access denied.',
      404: serverMsg || 'Not found.',
      409: serverMsg || 'An account with this email already exists.',
      429: 'Too many attempts. Please wait a few minutes and try again.',
      500: 'Server error. Please try again in a moment.',
      502: 'Server is unavailable. Please try again shortly.',
      503: 'Service temporarily unavailable. Please try again.',
    }

    throw new Error(friendlyMessages[res.status] ?? serverMsg ?? `Request failed (${res.status})`)
  }

  return res.json()
}

// Initialize CSRF token on client side
export function initCsrf(): Promise<string | undefined> {
  if (typeof window !== 'undefined') {
    return ensureCsrfToken()
  }
  return Promise.resolve(undefined)
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'client' | 'lawyer' | 'admin'
}

export async function apiLogin(email: string, password: string): Promise<AuthUser> {
  const data = await apiFetch<{ user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return data.user
}

export async function apiSignup(params: {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'client' | 'lawyer'
}): Promise<{ message: string }> {
  return apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function apiLogout(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' })
}

export async function apiGetMe(): Promise<AuthUser | null> {
  try {
    const data = await apiFetch<{ user: AuthUser }>('/api/auth/me')
    return data.user
  } catch {
    return null
  }
}

// ── Lawyers ───────────────────────────────────────────────────────────────────

export interface LawyerFee { chat: number; voice: number; video: number }
export interface LawyerReview { author: string; rating: number; text: string; date: string }
export interface LawyerEducation { degree: string; institution: string; year: number }

export interface ApiLawyer {
  slug: string
  name: string
  initials: string
  avatarBg: string
  barNumber: string
  verified: boolean
  online: boolean
  specializations: string[]
  primarySpec: string
  experience: number
  location: string
  languages: string[]
  rating: number
  reviewCount: number
  casesHandled: number
  bio: string
  education: LawyerEducation[]
  expertise: string[]
  achievements: string[]
  fees: LawyerFee
  reviews: LawyerReview[]
}

export async function apiGetLawyers(): Promise<ApiLawyer[]> {
  const data = await apiFetch<{ lawyers: ApiLawyer[] }>('/api/lawyers')
  return data.lawyers
}

export async function apiGetLawyer(slug: string): Promise<ApiLawyer | null> {
  try {
    const data = await apiFetch<{ lawyer: ApiLawyer }>(`/api/lawyers/${slug}`)
    return data.lawyer
  } catch {
    return null
  }
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface PendingLawyer {
  account_id: string
  first_name: string
  last_name: string
  email: string
  bar_council_number: string
  verification_status: string
  created_at: string
}

export async function apiGetPendingLawyers(): Promise<PendingLawyer[]> {
  const data = await apiFetch<{ lawyers: PendingLawyer[] }>('/api/admin/lawyers?status=pending_verification')
  return data.lawyers
}

export async function apiApproveLawyer(id: string): Promise<void> {
  await apiFetch(`/api/admin/lawyers/${id}/approve`, { method: 'PATCH' })
}

export async function apiRejectLawyer(id: string, reason?: string): Promise<void> {
  await apiFetch(`/api/admin/lawyers/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  })
}

export async function apiGetAdminStats(): Promise<{ verifiedLawyers: number; pendingApprovals: number }> {
  return apiFetch('/api/admin/stats')
}

// ── Lawyer Onboarding ─────────────────────────────────────────────────────────

export interface LawyerMe {
  onboarding_complete: boolean
  verification_status: 'pending_signup' | 'pending_verification' | 'verified' | 'rejected' | 'unverified'
  rejection_reason: string | null
  profile: Record<string, any> | null
}

export async function apiGetLawyerMe(): Promise<LawyerMe | null> {
  try {
    return await apiFetch<LawyerMe>('/api/lawyers/me')
  } catch {
    return null
  }
}

export async function apiUploadLawyerDoc(
  file: File,
  docType: 'profile_photo' | 'enrolment_cert' | 'bar_id_front' | 'bar_id_back' | 'govt_id'
): Promise<{ path: string }> {
  // Use the same cookie name as the backend sets: 'csrf_token'
  const csrfToken = document.cookie
    .split('; ')
    .find(r => r.startsWith(`${CSRF_COOKIE_NAME}=`))
    ?.split('=')[1]

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`/api/upload/lawyer-doc?docType=${docType}`, {
    method: 'POST',
    credentials: 'include',
    // x-csrf-token header is checked by validateCsrf before multer runs
    headers: csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : {},
    body: formData, // multipart — do NOT set Content-Type, browser sets boundary
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(body.error || 'Upload failed')
  }
  return res.json()
}

export async function apiSubmitLawyerOnboarding(data: Record<string, any>): Promise<void> {
  await apiFetch('/api/lawyers/onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Admin: fetch signed document URLs for a lawyer ────────────────────────────
export interface LawyerDocs {
  lawyer: { name: string; email: string; govtIdType: string }
  docs: {
    enrolment_cert: string | null
    bar_id_front: string | null
    bar_id_back: string | null
    govt_id: string | null
    profile_photo: string | null
  }
}

export async function apiGetLawyerDocs(id: string): Promise<LawyerDocs> {
  return apiFetch<LawyerDocs>(`/api/admin/lawyers/${id}/docs`)
}

// ── Lawyer Portal: Consultations ──────────────────────────────────────────────

export type ConsultStatus = 'pending' | 'upcoming' | 'active' | 'completed' | 'cancelled'
export type ConsultType   = 'chat' | 'voice' | 'video'

export interface PortalConsultation {
  id: string
  type: ConsultType
  status: ConsultStatus
  scheduledAt: string | null
  clientName: string
  clientId: string
  caseNote: string | null
  postCallNote: string | null
  durationMin: number | null
  fee: number
  agoraChannel: string | null
}

export async function apiGetPortalConsultations(status?: ConsultStatus): Promise<PortalConsultation[]> {
  const qs = status ? `?status=${status}` : ''
  try { return await apiFetch<PortalConsultation[]>(`/api/consultations/lawyer${qs}`) }
  catch { return [] }
}

export async function apiMarkConsultationComplete(id: string, note: string): Promise<void> {
  await apiFetch(`/api/consultations/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ postCallNote: note }),
  })
}

export async function apiGetAgoraToken(consultationId: string): Promise<{ token: string; uid: number; appId: string; channel: string }> {
  return apiFetch(`/api/consultations/${consultationId}/token`)
}

// ── Lawyer Portal: Documents ──────────────────────────────────────────────────

export type DocServiceType = 'drafting' | 'verification'
export type DocStatus      = 'new' | 'in_progress' | 'delivered' | 'revision_requested' | 'completed'

export interface PortalDocument {
  id: string
  serviceType: DocServiceType
  documentType: string
  status: DocStatus
  clientName: string
  revisionCount: number
  pageCount: number | null
  verificationTier: 'review_only' | 'review_and_consult' | null
  fee: number
  createdAt: string
  deliverableUrl: string | null
}

export async function apiGetPortalDocuments(
  serviceType: DocServiceType,
  status?: DocStatus
): Promise<PortalDocument[]> {
  const qs = new URLSearchParams({ serviceType, ...(status ? { status } : {}) }).toString()
  try { return await apiFetch<PortalDocument[]>(`/api/applications/lawyer?${qs}`) }
  catch { return [] }
}

export async function apiMarkDocumentComplete(id: string): Promise<void> {
  await apiFetch(`/api/applications/${id}/complete`, { method: 'PATCH' })
}

// ── Lawyer Portal: Payouts ────────────────────────────────────────────────────

export interface PayoutCycle {
  id: string
  periodStart: string
  periodEnd: string
  consultationEarnings: number
  draftingEarnings: number
  verificationEarnings: number
  platformFee: number
  grossAmount: number
  tdsAmount: number
  netAmount: number
  status: 'pending' | 'processing' | 'paid'
  transactionCount: number
}

export interface PayoutSummary {
  currentCyclePending: number
  totalEarned: number
  hasPan: boolean
  tdsRate: number
  cycles: PayoutCycle[]
}

export async function apiGetPayoutSummary(): Promise<PayoutSummary> {
  try { return await apiFetch<PayoutSummary>('/api/lawyers/payouts') }
  catch { return { currentCyclePending: 0, totalEarned: 0, hasPan: false, tdsRate: 20, cycles: [] } }
}

// ── Lawyer Portal: Settings ───────────────────────────────────────────────────

export interface LawyerSettings {
  firstName: string
  lastName: string
  bio: string | null
  firmName: string | null
  profilePhotoUrl: string | null
  languages: string[]
  courtsPracticed: string[]
  linkedinUrl: string | null
  websiteUrl: string | null
  // Services
  draftingEnabled: boolean
  verificationEnabled: boolean
  consultationEnabled: boolean
  consultationTypes: ('chat' | 'voice' | 'video')[]
  consultationFeePerMin: number
  // Payout
  bankAccountName: string | null
  bankAccountNumber: string | null
  bankIfsc: string | null
  upiId: string | null
  gstNumber: string | null
  panNumber: string | null
}

export async function apiGetLawyerSettings(): Promise<LawyerSettings | null> {
  try { return await apiFetch<LawyerSettings>('/api/lawyers/settings') }
  catch { return null }
}

export async function apiUpdateLawyerSettings(data: Partial<LawyerSettings>): Promise<void> {
  await apiFetch('/api/lawyers/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
