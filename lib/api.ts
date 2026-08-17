/**
 * LegalX API Client
 * 
 * All data fetching goes through the Express backend.
 * No Supabase keys, anon keys, or service role keys exist in this file.
 * Authentication tokens live exclusively in HttpOnly cookies managed by the backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : undefined
}

type FetchOptions = RequestInit & { skipCredentials?: boolean; skipCsrf?: boolean }

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipCredentials, skipCsrf, ...fetchOpts } = options
  const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes((fetchOpts.method || 'GET').toUpperCase())
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOpts.headers as Record<string, string> || {}),
  }

  // Add CSRF token for mutations
  if (isMutation && !skipCsrf) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      headers[CSRF_HEADER_NAME] = csrfToken
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOpts,
    credentials: skipCredentials ? 'omit' : 'include', // sends HttpOnly cookies
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error || `API error ${res.status}`)
  }

  return res.json()
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
