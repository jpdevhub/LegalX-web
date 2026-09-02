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

// One shared refresh across concurrent 401s. A page that fires five requests
// at once must not trigger five refreshes — Supabase rotates refresh tokens,
// so the later calls would present an already-spent token and log the user out.
let refreshPromise: Promise<boolean> | null = null

function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        signal: AbortSignal.timeout(8000),
      })
      return res.ok
    } catch {
      return false
    }
  })()

  refreshPromise.finally(() => { refreshPromise = null })
  return refreshPromise
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipCredentials, skipCsrf, ...fetchOpts } = options
  const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes((fetchOpts.method || 'GET').toUpperCase())

  const buildHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOpts.headers as Record<string, string> || {}),
    }
    // Add CSRF token for mutations
    if (isMutation && !skipCsrf) {
      const csrfToken = await ensureCsrfToken()
      if (csrfToken) headers[CSRF_HEADER_NAME] = csrfToken
    }
    return headers
  }

  const baseUrl = getBaseUrl()
  const send = async () => fetch(`${baseUrl}${path}`, {
    ...fetchOpts,
    credentials: skipCredentials ? 'omit' : 'include', // sends HttpOnly cookies
    headers: await buildHeaders(),
  })

  let res = await send()

  // Access tokens last an hour. On a 401, spend the refresh cookie once and
  // replay the request — the user should never see "expired session" simply
  // for having the tab open too long.
  //
  // Excluded: the credential endpoints. Retrying /login on a 401 would turn a
  // wrong password into a refresh attempt, and retrying /refresh would recurse.
  // /api/auth/me is deliberately NOT excluded — it is the call the header and
  // the portal layouts use, so it is exactly where a silent recovery matters.
  const noRetry = ['/api/auth/login', '/api/auth/signup', '/api/auth/refresh',
                   '/api/auth/forgot-password', '/api/auth/reset-password']
  const isCredentialRoute = noRetry.some(p => path.startsWith(p))
  if (res.status === 401 && !isCredentialRoute && !skipCredentials) {
    if (await refreshSession()) {
      res = await send()
    }
  }

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

/**
 * Request a password-recovery email. Resolves identically whether or not the
 * address is registered — the backend deliberately does not disclose that.
 * `origin` lets the backend build the reset link for whichever deployment the
 * user is actually on (localhost, preview, production); it is validated
 * server-side against the origin allowlist.
 */
export async function apiForgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({
      email,
      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
    }),
  })
}

/** Complete recovery with the one-time code emailed to the user. */
export async function apiResetPassword(
  email: string,
  otp: string,
  password: string
): Promise<{ message: string }> {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, password }),
  })
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

export interface AdminStats {
  verifiedLawyers: number
  pendingApprovals: number
  suspendedLawyers: number
  totalClients: number
  openDisputes: number
  pendingPayouts: number
  slaBreaches: number
  mtdRevenue: number
  mtdConsultationRevenue: number
  mtdDocumentRevenue: number
}

export async function apiGetAdminStats(): Promise<AdminStats> {
  return apiFetch('/api/admin/stats')
}

// ── Admin: lawyers ────────────────────────────────────────────────────────────

export type LawyerVerificationStatus =
  | 'unverified' | 'pending_signup' | 'pending_verification' | 'verified' | 'rejected' | 'suspended'

export interface AdminLawyer {
  account_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  bar_council_number: string | null
  bar_council_state: string | null
  verification_status: LawyerVerificationStatus
  specializations: string[] | null
  consultation_types: string[] | null
  document_services: string[] | null
  avg_rating: number | null
  total_reviews: number | null
  consultation_fee_chat: number | null
  consultation_fee_voice: number | null
  consultation_fee_video: number | null
  enrolment_cert_url: string | null
  bar_id_front_url: string | null
  bar_id_back_url: string | null
  govt_id_url: string | null
  profile_photo_url: string | null
  rejection_reason: string | null
  onboarding_complete: boolean | null
  created_at: string
}

export interface Paginated<T> {
  total: number
  page: number
  pageSize: number
  items: T[]
}

export interface AdminLawyerListParams {
  status?: LawyerVerificationStatus | 'all'
  search?: string
  page?: number
  pageSize?: number
  // Index signature so this can be handed straight to buildQuery.
  [key: string]: string | number | undefined
}

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') qs.set(key, String(value))
  }
  const str = qs.toString()
  return str ? `?${str}` : ''
}

export async function apiGetAdminLawyers(params: AdminLawyerListParams = {}): Promise<Paginated<AdminLawyer>> {
  const data = await apiFetch<{ lawyers: AdminLawyer[]; total: number; page: number; pageSize: number }>(
    `/api/admin/lawyers${buildQuery(params)}`
  )
  return { items: data.lawyers, total: data.total, page: data.page, pageSize: data.pageSize }
}

export interface DisciplinaryFlag {
  id: string
  type: 'complaint' | 'warning' | 'suspension' | 'reinstatement'
  reason: string
  flagged_by: string
  created_at: string
}

export interface AdminLawyerDetail {
  profile: AdminLawyer & Record<string, any>
  account: { status: string; last_login_at: string | null; created_at: string } | null
  bank: {
    account_holder_name: string | null
    bank_name: string | null
    ifsc_code: string | null
    gst_number: string | null
    is_verified: boolean | null
    updated_at: string | null
  } | null
  flags: DisciplinaryFlag[]
  docs: Record<string, string | null>
}

export async function apiGetAdminLawyer(id: string): Promise<AdminLawyerDetail> {
  return apiFetch<AdminLawyerDetail>(`/api/admin/lawyers/${id}`)
}

export async function apiSuspendLawyer(id: string, reason: string): Promise<void> {
  await apiFetch(`/api/admin/lawyers/${id}/suspend`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  })
}

export async function apiReinstateLawyer(id: string, reason?: string): Promise<void> {
  await apiFetch(`/api/admin/lawyers/${id}/reinstate`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  })
}

export async function apiFlagLawyer(
  id: string,
  type: DisciplinaryFlag['type'],
  reason: string
): Promise<{ flag: DisciplinaryFlag }> {
  return apiFetch(`/api/admin/lawyers/${id}/flag`, {
    method: 'POST',
    body: JSON.stringify({ type, reason }),
  })
}

export interface BulkResult {
  succeeded: string[]
  failed: { id: string; error: string }[]
}

export async function apiBulkLawyerAction(
  ids: string[],
  action: 'approve' | 'reject',
  reason?: string
): Promise<BulkResult> {
  return apiFetch('/api/admin/lawyers/bulk', {
    method: 'POST',
    body: JSON.stringify({ ids, action, reason }),
  })
}

// ── Admin: clients ────────────────────────────────────────────────────────────

export interface AdminClient {
  id: string
  email: string
  phone: string | null
  first_name: string | null
  last_name: string | null
  status: string
  created_at: string
  last_login_at: string | null
  wallet_balance: number
}

export async function apiGetAdminClients(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<Paginated<AdminClient>> {
  const data = await apiFetch<{ clients: AdminClient[]; total: number; page: number; pageSize: number }>(
    `/api/admin/clients${buildQuery(params)}`
  )
  return { items: data.clients, total: data.total, page: data.page, pageSize: data.pageSize }
}

export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  balance_after: number
  reference_type: string | null
  reference_id: string | null
  note: string | null
  created_at: string
}

export interface AdminClientDetail {
  account: {
    id: string
    email: string
    phone: string | null
    first_name: string | null
    last_name: string | null
    role: string
    status: string
    created_at: string
    last_login_at: string | null
  }
  wallet: { id: string; balance: number; currency: string; updated_at: string } | null
  transactions: WalletTransaction[]
  disputes: { id: string; reason: string; status: string; created_at: string; resolution_note: string | null }[]
  consultations: { id: string; type: string; status: string; total_amount: number | null; started_at: string | null }[]
  lifetimeSpend: number
}

export async function apiGetAdminClient(id: string): Promise<AdminClientDetail> {
  return apiFetch<AdminClientDetail>(`/api/admin/clients/${id}`)
}

export async function apiAdjustClientWallet(
  id: string,
  amount: number,
  type: 'credit' | 'debit',
  reason: string
): Promise<{ balance: number; previousBalance: number }> {
  return apiFetch(`/api/admin/clients/${id}/wallet`, {
    method: 'PATCH',
    body: JSON.stringify({ amount, type, reason }),
  })
}

// ── Admin: audit log ──────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string
  admin_id: string
  admin_name: string
  action: string
  entity_type: string
  entity_id: string | null
  before_data: Record<string, any> | null
  after_data: Record<string, any> | null
  ip_address: string | null
  created_at: string
}

export async function apiGetAuditLog(
  params: { entity_type?: string; from?: string; to?: string; page?: number; pageSize?: number } = {}
): Promise<Paginated<AuditEntry>> {
  const data = await apiFetch<{ entries: AuditEntry[]; total: number; page: number; pageSize: number }>(
    `/api/admin/audit-log${buildQuery(params)}`
  )
  return { items: data.entries, total: data.total, page: data.page, pageSize: data.pageSize }
}

// ── Admin: disputes ───────────────────────────────────────────────────────────

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'escalated'

export interface AdminDispute {
  id: string
  consultation_id: string | null
  service_order_id: string | null
  client_id: string
  lawyer_id: string | null
  client_name: string | null
  lawyer_name: string | null
  reason: string
  status: DisputeStatus
  resolution_note: string | null
  created_at: string
  updated_at: string
}

export async function apiGetDisputes(
  params: { status?: string; page?: number; pageSize?: number } = {}
): Promise<Paginated<AdminDispute>> {
  const data = await apiFetch<{ disputes: AdminDispute[]; total: number; page: number; pageSize: number }>(
    `/api/admin/disputes${buildQuery(params)}`
  )
  return { items: data.disputes, total: data.total, page: data.page, pageSize: data.pageSize }
}

export async function apiUpdateDispute(
  id: string,
  status: DisputeStatus,
  resolutionNote?: string
): Promise<void> {
  await apiFetch(`/api/admin/disputes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, resolutionNote }),
  })
}

// ── Admin: payouts ────────────────────────────────────────────────────────────

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'held' | 'cancelled'

export interface AdminPayout {
  id: string
  lawyer_id: string
  lawyer_name: string
  has_pan: boolean
  fy_cumulative_gross: number
  period_start: string
  period_end: string
  gross_amount: number
  tds_amount: number
  platform_fee: number
  net_amount: number
  status: PayoutStatus
  hold_reason: string | null
  transaction_count: number
  bank_ref: string | null
  paid_at: string | null
  created_at: string
}

export async function apiGetPayouts(
  params: { status?: string; page?: number; pageSize?: number } = {}
): Promise<Paginated<AdminPayout> & { fyStart: string }> {
  const data = await apiFetch<{
    payouts: AdminPayout[]; total: number; page: number; pageSize: number; fyStart: string
  }>(`/api/admin/payouts${buildQuery(params)}`)
  return { items: data.payouts, total: data.total, page: data.page, pageSize: data.pageSize, fyStart: data.fyStart }
}

export async function apiGeneratePayouts(
  periodStart: string,
  periodEnd: string
): Promise<{ created: number; message?: string }> {
  return apiFetch('/api/admin/payouts/generate', {
    method: 'POST',
    body: JSON.stringify({ periodStart, periodEnd }),
  })
}

export async function apiHoldPayout(id: string, reason: string): Promise<void> {
  await apiFetch(`/api/admin/payouts/${id}/hold`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  })
}

export async function apiSetPayoutStatus(
  id: string,
  status: 'pending' | 'processing' | 'paid' | 'cancelled',
  bankRef?: string
): Promise<void> {
  await apiFetch(`/api/admin/payouts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, bankRef }),
  })
}

// ── Admin: documents ──────────────────────────────────────────────────────────

export interface AdminServiceOrder {
  id: string
  order_number: string | null
  account_id: string | null
  assigned_lawyer_id: string | null
  client_name: string
  lawyer_name: string | null
  service_title: string
  status: string
  price: number | null
  customer_notes: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export async function apiGetAdminDocuments(
  params: { status?: string; page?: number; pageSize?: number } = {}
): Promise<Paginated<AdminServiceOrder>> {
  const data = await apiFetch<{ orders: AdminServiceOrder[]; total: number; page: number; pageSize: number }>(
    `/api/admin/documents${buildQuery(params)}`
  )
  return { items: data.orders, total: data.total, page: data.page, pageSize: data.pageSize }
}

// ── Admin: analytics ──────────────────────────────────────────────────────────

export interface AdminAnalytics {
  months: string[]
  revenueByMonth: Record<string, number>
  consultRevenue: Record<string, number>
  docRevenue: Record<string, number>
  clientSignups: Record<string, number>
  lawyerSignups: Record<string, number>
  consultByType: Record<string, number>
  leaderboard: { lawyer_id: string; name: string; avg_rating: number; total_reviews: number }[]
  totals: { consultations: number; disputes: number; disputeRate: number; totalRevenue: number }
}

export async function apiGetAnalytics(): Promise<AdminAnalytics> {
  return apiFetch<AdminAnalytics>('/api/admin/analytics')
}

// ── Legal Shorts ──────────────────────────────────────────────────────────────

export interface LegalShort {
  id: string
  title: string
  slug: string | null
  summary: string
  takeaway: string | null
  category: string
  court: string | null
  judgment_date: string | null
  source_url: string | null
  source_name: string | null
  tags: string[] | null
  likes_count: number
  published_at: string | null
  created_at: string
}

export interface ShortsPage {
  shorts: LegalShort[]
  hasMore: boolean
  nextCursor: string | null
}

export async function apiGetShorts(
  params: { category?: string; before?: string; limit?: number } = {}
): Promise<ShortsPage> {
  return apiFetch<ShortsPage>(`/api/shorts${buildQuery(params)}`)
}

export async function apiGetShortCategories(): Promise<{ name: string; count: number }[]> {
  const data = await apiFetch<{ categories: { name: string; count: number }[] }>('/api/shorts/categories')
  return data.categories
}

export async function apiGetShort(slug: string): Promise<LegalShort | null> {
  try {
    const data = await apiFetch<{ short: LegalShort }>(`/api/shorts/${slug}`)
    return data.short
  } catch {
    return null
  }
}

// ── Admin: shorts review queue ────────────────────────────────────────────────

export interface AdminShort extends LegalShort {
  is_published: boolean
  review_status: 'pending' | 'approved' | 'rejected'
  rejected_reason: string | null
  /** Verbatim quote from the source. Verified server-side before the card exists. */
  evidence: string | null
  relevance_score: number | null
  confidence: 'high' | 'medium' | 'low' | null
  source_feed: string | null
}

export interface ShortsQueue extends Paginated<AdminShort> {
  counts: { pending: number; approved: number; rejected: number }
}

export async function apiGetAdminShorts(
  params: { status?: 'pending' | 'approved' | 'rejected'; search?: string; page?: number; pageSize?: number } = {}
): Promise<ShortsQueue> {
  const data = await apiFetch<{
    shorts: AdminShort[]; total: number; page: number; pageSize: number
    counts: { pending: number; approved: number; rejected: number }
  }>(`/api/admin/shorts${buildQuery(params)}`)
  return {
    items: data.shorts, total: data.total, page: data.page, pageSize: data.pageSize,
    counts: data.counts,
  }
}

/** Approve (publish) or reject a batch of suggestions in one action. */
export async function apiBulkShorts(
  ids: string[], action: 'approve' | 'reject', reason?: string
): Promise<{ changed: number; skipped: number }> {
  return apiFetch('/api/admin/shorts/bulk', {
    method: 'POST',
    body: JSON.stringify({ ids, action, reason }),
  })
}

// ── Archive ───────────────────────────────────────────────────────────────────

export async function apiGetShortsArchive(
  params: { month?: string; category?: string; page?: number; limit?: number } = {}
): Promise<{ shorts: LegalShort[]; total: number; page: number; limit: number }> {
  return apiFetch(`/api/shorts/archive${buildQuery(params)}`)
}

export async function apiGetShortsMonths(): Promise<{ month: string; count: number }[]> {
  const data = await apiFetch<{ months: { month: string; count: number }[] }>('/api/shorts/months')
  return data.months
}

export async function apiUpdateShort(
  id: string,
  input: Partial<{
    title: string; summary: string; takeaway: string; category: string
    court: string; judgmentDate: string; tags: string[]; isPublished: boolean
  }>
): Promise<void> {
  await apiFetch(`/api/admin/shorts/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}

export async function apiDeleteShort(id: string): Promise<void> {
  await apiFetch(`/api/admin/shorts/${id}`, { method: 'DELETE' })
}

export interface ShortsFeedOption {
  id: string; label: string; enabled: boolean
  sourceName: string; licenceNote: string
}

export async function apiGetShortsFeeds(): Promise<ShortsFeedOption[]> {
  const data = await apiFetch<{ feeds: ShortsFeedOption[] }>('/api/admin/shorts/feeds')
  return data.feeds
}

export interface IngestReport {
  proposed: number
  /** Candidates the grounding contract rejected, with the reason why. */
  skipped: { title: string; reason: string }[]
  failed: { url: string; error: string }[]
  suggestions: { id: string; title: string; relevance_score: number | null; confidence: string | null }[]
  /** True when a quota stopped the run before it reached the target. */
  stoppedEarly?: boolean
  stopReason?: string
  remaining?: number
  message?: string
}

export interface IngestJob {
  status: 'idle' | 'running' | 'done' | 'failed'
  startedAt: string | null
  finishedAt: string | null
  processed: number
  total: number
  report: IngestReport | null
  error: string | null
  /** Set while waiting out a provider quota, so the UI can explain the pause. */
  cooldownUntil: string | null
  alreadyRunning?: boolean
}

/**
 * Starts a run and returns straight away.
 *
 * The run itself takes minutes — longer than the gateway will hold a request
 * open — so progress is polled via apiGetIngestStatus rather than awaited.
 */
export async function apiStartIngest(limit = 8, feeds?: string[]): Promise<IngestJob> {
  return apiFetch('/api/admin/shorts/auto-ingest', {
    method: 'POST',
    body: JSON.stringify({ limit, feeds }),
  })
}

export async function apiGetIngestStatus(): Promise<IngestJob> {
  return apiFetch('/api/admin/shorts/ingest-status')
}

export async function apiIngestShort(input: {
  sourceUrl: string; rawText?: string; sourceName?: string
}): Promise<{ short: { id: string; title: string } }> {
  return apiFetch('/api/admin/shorts/ingest', { method: 'POST', body: JSON.stringify(input) })
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  link: string | null
  created_at: string
}

export async function apiGetNotifications(
  params: { page?: number; pageSize?: number } = {}
): Promise<{ notifications: AppNotification[]; total: number; unread: number }> {
  return apiFetch(`/api/notifications${buildQuery(params)}`)
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
}

export async function apiMarkAllNotificationsRead(): Promise<void> {
  await apiFetch('/api/notifications/read-all', { method: 'PATCH' })
}

// ── Consultations ─────────────────────────────────────────────────────────────

export interface AgoraSession {
  consultationId: string
  channelName: string
  agoraAppId: string
  token: string
  uid: number
  role: 'client' | 'lawyer'
  type: 'chat' | 'voice' | 'video'
  status: string
  counterpartId: string | null
}

/**
 * Fetches call credentials for a consultation. The backend authorises this
 * against the two participants, so nothing sensitive needs to travel in the URL.
 */
export async function apiGetConsultationToken(consultationId: string): Promise<AgoraSession> {
  return apiFetch<AgoraSession>(`/api/consultations/${consultationId}/agora-token`)
}

export async function apiSubmitReview(
  targetId: string,
  rating: number,
  comment: string,
  targetType: 'lawyer' | 'consultation' = 'lawyer'
): Promise<void> {
  await apiFetch('/api/consultations/review', {
    method: 'POST',
    body: JSON.stringify({ targetId, rating, comment, targetType }),
  })
}

// ── Admin: articles ───────────────────────────────────────────────────────────

export interface AdminArticle {
  id: string
  title: string
  slug: string
  content: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export async function apiGetArticles(
  params: { status?: string; search?: string; page?: number; pageSize?: number } = {}
): Promise<Paginated<AdminArticle>> {
  const data = await apiFetch<{ articles: AdminArticle[]; total: number; page: number; pageSize: number }>(
    `/api/admin/articles${buildQuery(params)}`
  )
  return { items: data.articles, total: data.total, page: data.page, pageSize: data.pageSize }
}

export async function apiCreateArticle(input: {
  title: string; slug: string; content: string; status: 'draft' | 'published'
}): Promise<{ article: AdminArticle }> {
  return apiFetch('/api/admin/articles', { method: 'POST', body: JSON.stringify(input) })
}

export async function apiUpdateArticle(
  id: string,
  input: Partial<{ title: string; slug: string; content: string; status: 'draft' | 'published' }>
): Promise<void> {
  await apiFetch(`/api/admin/articles/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}

// ── Lawyer Onboarding ─────────────────────────────────────────────────────────

export interface LawyerMe {
  onboarding_complete: boolean
  verification_status: 'pending_signup' | 'pending_verification' | 'verified' | 'rejected' | 'unverified'
  rejection_reason: string | null
  /** Availability switch state. Top-level because `profile` renames it to `online`. */
  is_online: boolean
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
