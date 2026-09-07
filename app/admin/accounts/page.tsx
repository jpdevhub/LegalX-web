'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Trash2, AlertTriangle, Unlink } from 'lucide-react'
import {
  apiGetAdminAccounts, apiGetOrphanAccounts, apiGetAccountImpact, apiDeleteAccount,
  type AdminAccount, type AccountImpact,
} from '@/lib/api'
import {
  StatusBadge, Modal, EmptyState, ErrorState, SkeletonRows,
  Pagination, Toast, formatDate, fullName,
} from '@/components/admin/AdminUI'

/**
 * Accounts — the one place an account is removed.
 *
 * Clients and lawyers have their own pages for day-to-day work, but deleting
 * someone used to mean removing the Auth user in Supabase and then hunting
 * through a dozen tables for what it left behind. This page deletes the login
 * and everything hanging off it in a single action, and shows exactly what
 * that will be before asking to confirm.
 */

const PAGE_SIZE = 20

type RoleFilter = 'all' | 'client' | 'lawyer' | 'admin'

const ROLE_TABS: { key: RoleFilter; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'client', label: 'Clients' },
  { key: 'lawyer', label: 'Lawyers' },
  { key: 'admin',  label: 'Admins' },
]

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [role, setRole] = useState<RoleFilter>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // Orphans are a separate view, not a filter: they come from a different
  // endpoint (one that has to read the Auth user list to find them).
  const [orphansOnly, setOrphansOnly] = useState(false)
  const [orphanTruncated, setOrphanTruncated] = useState(false)

  const [target, setTarget] = useState<AdminAccount | null>(null)
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (orphansOnly) {
        const res = await apiGetOrphanAccounts()
        setAccounts(res.orphans)
        setTotal(res.orphans.length)
        setOrphanTruncated(!res.complete)
      } else {
        const res = await apiGetAdminAccounts({
          role,
          search: search || undefined,
          page,
          pageSize: PAGE_SIZE,
        })
        setAccounts(res.items)
        setTotal(res.total)
      }
    } catch (err: any) {
      setError(err?.message || 'Could not load accounts.')
    } finally {
      setLoading(false)
    }
  }, [role, search, page, orphansOnly])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Accounts</h1>
        <p className="text-sm text-slate-400">
          Every client, lawyer and admin in one list. Deleting here removes the login and
          every record behind it, in one step.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {ROLE_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setRole(tab.key); setPage(1); setOrphansOnly(false) }}
              className={`shrink-0 px-3.5 h-11 rounded-lg border text-sm font-semibold transition-colors ${
                !orphansOnly && role === tab.key
                  ? 'bg-[#C9A227] text-[#0A0D14] border-[#C9A227]'
                  : 'bg-white/5 text-slate-300 border-white/15 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => { setOrphansOnly(v => !v); setPage(1) }}
            title="Account rows whose Supabase Auth user no longer exists"
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 h-11 rounded-lg border text-sm font-semibold transition-colors ${
              orphansOnly
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-white/5 text-slate-300 border-white/15 hover:text-white'
            }`}
          >
            <Unlink size={14} /> Orphaned
          </button>
        </div>

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            disabled={orphansOnly}
            placeholder="Search by name or email…"
            className="w-full h-11 pl-9 pr-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 transition-all disabled:opacity-50"
          />
        </div>
      </div>

      {orphansOnly && (
        <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/25">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {orphanTruncated
              ? 'There are more accounts than this scan can compare in one pass, so no list is shown — a partial answer here would label live accounts as orphans.'
              : 'These accounts have no Supabase Auth user — the login was deleted from the dashboard, leaving the profile and its records behind. Deleting them here clears the rest.'}
          </p>
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={6} />
      ) : accounts.length === 0 ? (
        <EmptyState
          title={orphansOnly ? (orphanTruncated ? 'Scan incomplete' : 'No orphaned accounts') : 'No accounts found'}
          hint={
            orphansOnly
              ? orphanTruncated
                ? 'Nothing is listed because the comparison could not be completed.'
                : 'Every account row has a matching login.'
              : search ? 'Try a different search term.' : undefined
          }
        />
      ) : (
        <>
          <div className="hidden md:block rounded-xl bg-white/[0.03] border border-white/8 overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-white/8 text-left">
                  {['Name', 'Email', 'Role', 'Status', 'Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {accounts.map(a => (
                  <tr key={a.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{fullName(a.first_name, a.last_name)}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[220px]">{a.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <RolePill role={a.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.verification_status ?? a.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(a.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setTarget(a)}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {accounts.map(a => (
              <div key={a.id} className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{fullName(a.first_name, a.last_name)}</p>
                    <p className="text-xs text-slate-500 truncate">{a.email ?? '—'}</p>
                  </div>
                  <RolePill role={a.role} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <StatusBadge status={a.verification_status ?? a.status} />
                  <span className="text-xs text-slate-400">Joined {formatDate(a.created_at)}</span>
                </div>
                <button
                  onClick={() => setTarget(a)}
                  className="mt-3 w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
                >
                  <Trash2 size={13} /> Delete account
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && !orphansOnly && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      )}

      <DeleteAccountModal
        account={target}
        onClose={() => setTarget(null)}
        onDone={async (msg, tone) => {
          setTarget(null)
          setToast({ msg, tone })
          await load()
        }}
      />

      <Toast message={toast?.msg ?? null} tone={toast?.tone} onDone={() => setToast(null)} />
    </div>
  )
}

function RolePill({ role }: { role: AdminAccount['role'] }) {
  const style =
    role === 'admin'  ? 'bg-[#C9A227]/15 text-[#D4AF37] border-[#C9A227]/30' :
    role === 'lawyer' ? 'bg-sky-500/15 text-sky-300 border-sky-500/25' :
                        'bg-slate-500/15 text-slate-300 border-slate-500/25'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide ${style}`}>
      {role}
    </span>
  )
}

// ── Delete ────────────────────────────────────────────────────────────────────

/** "bookings.client_id" -> "Bookings" + "client_id" */
function splitRef(key: string): [string, string] {
  const [table, column = ''] = key.split('.')
  const label = table.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())
  return [label, column]
}

function DeleteAccountModal({
  account,
  onClose,
  onDone,
}: {
  account: AdminAccount | null
  onClose: () => void
  onDone: (message: string, tone: 'success' | 'error') => void | Promise<void>
}) {
  const [impact, setImpact] = useState<AccountImpact | null>(null)
  const [loadingImpact, setLoadingImpact] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!account) return
    setImpact(null); setConfirmEmail(''); setReason(''); setError(null); setBusy(false)

    let cancelled = false
    setLoadingImpact(true)
    apiGetAccountImpact(account.id)
      .then(res => { if (!cancelled) setImpact(res) })
      .catch(err => { if (!cancelled) setError(err?.message || 'Could not read what this account is linked to.') })
      .finally(() => { if (!cancelled) setLoadingImpact(false) })
    return () => { cancelled = true }
  }, [account])

  const realEmail = (account?.email ?? impact?.authEmail ?? '').trim().toLowerCase()
  const emailMatches = realEmail.length > 0 && confirmEmail.trim().toLowerCase() === realEmail
  const valid = emailMatches && reason.trim().length >= 5

  const rows = useMemo(() => {
    const entries = Object.entries(impact?.tables ?? {})
    return entries.sort((a, b) => b[1] - a[1])
  }, [impact])

  const submit = async () => {
    if (!account || !valid) return
    setBusy(true)
    setError(null)
    try {
      const res = await apiDeleteAccount(account.id, confirmEmail.trim().toLowerCase(), reason.trim())
      await onDone(
        `${res.email} deleted — ${res.rowsRemoved} linked record${res.rowsRemoved === 1 ? '' : 's'} removed.`,
        'success'
      )
    } catch (err: any) {
      setBusy(false)
      setError(err?.message || 'Could not delete the account.')
    }
  }

  return (
    <Modal
      open={!!account}
      title={`Delete ${fullName(account?.first_name, account?.last_name, 'account')}`}
      onClose={busy ? () => {} : onClose}
    >
      <div className="flex gap-2.5 p-3.5 rounded-lg bg-rose-500/8 border border-rose-500/25 mb-5">
        <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
        <p className="text-xs text-rose-200/90 leading-relaxed">
          This cannot be undone. The login and everything tied to this account is removed.
          Records that outlive the person — audit entries, reviewed content — are kept and
          simply stop pointing at them.
        </p>
      </div>

      <p className="text-sm text-slate-400 mb-4">
        <span className="text-white font-semibold">{realEmail || 'unknown address'}</span>
        {account && <span className="text-slate-500"> · {account.role}</span>}
      </p>

      {loadingImpact ? (
        <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-5">
          <span className="w-3.5 h-3.5 border-2 border-white/15 border-t-[#C9A227] rounded-full animate-spin" />
          Checking what is linked to this account…
        </div>
      ) : impact && !impact.impactAvailable ? (
        <p className="text-xs text-amber-300/90 mb-5 leading-relaxed">
          The breakdown is unavailable until the account-deletion migration is applied.
          Deleting will still work, but you will not see what it removes first.
        </p>
      ) : rows.length > 0 ? (
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
            Will be removed ({impact?.totalRows})
          </p>
          <ul className="rounded-lg border border-white/10 divide-y divide-white/5 max-h-52 overflow-y-auto">
            {rows.map(([key, count]) => {
              const [label, column] = splitRef(key)
              return (
                <li key={key} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="text-xs text-slate-300 truncate">
                    {label}
                    <span className="text-slate-600"> · {column}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-200 tabular-nums shrink-0">{count}</span>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">
            Counts are direct links. Rows hanging off these — a session under a booking,
            for instance — go with them.
          </p>
        </div>
      ) : impact ? (
        <p className="text-xs text-slate-500 mb-5">
          Nothing else in the database points at this account.
          {!impact.authUserExists && ' Its login has already been deleted.'}
        </p>
      ) : null}

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
        Type the email to confirm
      </label>
      <input
        value={confirmEmail}
        onChange={e => setConfirmEmail(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        placeholder={realEmail || 'account email'}
        className={`w-full h-11 px-3.5 rounded-lg bg-white/8 border text-white text-sm placeholder:text-slate-600 focus:outline-none transition-colors ${
          confirmEmail.length === 0
            ? 'border-white/15 focus:border-[#C9A227]/60'
            : emailMatches
              ? 'border-emerald-500/40'
              : 'border-rose-500/40'
        }`}
      />

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 mt-4 uppercase tracking-wide">
        Reason (required)
      </label>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="e.g. Duplicate test account created during launch."
        className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 resize-none"
      />
      <p className="mt-1.5 text-[11px] text-slate-600">
        Kept on record with your name after the account itself is gone.
      </p>

      {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

      <div className="mt-5 flex gap-3">
        <button
          onClick={onClose}
          disabled={busy}
          className="flex-1 h-11 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={busy || !valid}
          className="flex-1 h-11 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? 'Deleting…' : 'Delete permanently'}
        </button>
      </div>
    </Modal>
  )
}
