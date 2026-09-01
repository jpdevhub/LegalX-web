'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Wallet, ArrowUpDown } from 'lucide-react'
import {
  apiGetAdminClients, apiAdjustClientWallet, type AdminClient,
} from '@/lib/api'
import {
  StatusBadge, Modal, EmptyState, ErrorState, SkeletonRows,
  Pagination, Toast, formatCurrency, formatDate, fullName,
} from '@/components/admin/AdminUI'

const PAGE_SIZE = 20
type SortKey = 'created_at' | 'wallet_balance' | 'name'

export default function AdminClientsPage() {
  const router = useRouter()

  const [clients, setClients] = useState<AdminClient[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortAsc, setSortAsc] = useState(false)

  const [target, setTarget] = useState<AdminClient | null>(null)
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetAdminClients({ search: search || undefined, page, pageSize: PAGE_SIZE })
      setClients(res.items)
      setTotal(res.total)
    } catch (err: any) {
      setError(err?.message || 'Could not load clients.')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { load() }, [load])

  // Sorting is client-side over the current page only — the label says "this
  // page" so it can't be mistaken for a global ordering.
  const sorted = useMemo(() => {
    const rows = [...clients]
    rows.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'wallet_balance') cmp = a.wallet_balance - b.wallet_balance
      else if (sortKey === 'name') {
        cmp = fullName(a.first_name, a.last_name).localeCompare(fullName(b.first_name, b.last_name))
      } else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortAsc ? cmp : -cmp
    })
    return rows
  }, [clients, sortKey, sortAsc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const SortHeader = ({ label, sortBy }: { label: string; sortBy: SortKey }) => (
    <button
      onClick={() => toggleSort(sortBy)}
      className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
        sortKey === sortBy ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
      }`}
    >
      {label}
      <ArrowUpDown size={12} />
    </button>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Clients</h1>
        <p className="text-sm text-slate-400">Accounts, wallet balances, and manual adjustments.</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full h-11 pl-9 pr-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 transition-all"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={6} />
      ) : sorted.length === 0 ? (
        <EmptyState title="No clients found" hint={search ? 'Try a different search term.' : undefined} />
      ) : (
        <>
          <div className="hidden md:block rounded-xl bg-white/[0.03] border border-white/8 overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-white/8 text-left">
                  <th className="px-4 py-3"><SortHeader label="Name" sortBy="name" /></th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3"><SortHeader label="Joined" sortBy="created_at" /></th>
                  <th className="px-4 py-3"><SortHeader label="XCoins" sortBy="wallet_balance" /></th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sorted.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/admin/clients/${c.id}`)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-white">{fullName(c.first_name, c.last_name)}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[220px]">{c.email}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3 text-slate-200 tabular-nums font-semibold">{formatCurrency(c.wallet_balance)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); setTarget(c) }}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Wallet size={13} /> Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {sorted.map(c => (
              <div key={c.id} className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
                <Link href={`/admin/clients/${c.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{fullName(c.first_name, c.last_name)}</p>
                      <p className="text-xs text-slate-500 truncate">{c.email}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">Joined {formatDate(c.created_at)}</span>
                    <span className="text-sm font-bold text-white tabular-nums">{formatCurrency(c.wallet_balance)}</span>
                  </div>
                </Link>
                <button
                  onClick={() => setTarget(c)}
                  className="mt-3 w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Wallet size={13} /> Adjust Wallet
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      )}

      <WalletAdjustModal
        client={target}
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

// ── Wallet adjustment ─────────────────────────────────────────────────────────

export function WalletAdjustModal({
  client,
  onClose,
  onDone,
}: {
  client: { id: string; first_name: string | null; last_name: string | null; wallet_balance: number } | null
  onClose: () => void
  onDone: (message: string, tone: 'success' | 'error') => void | Promise<void>
}) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'credit' | 'debit'>('credit')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (client) { setAmount(''); setType('credit'); setReason(''); setError(null); setBusy(false) }
  }, [client])

  const parsed = Number(amount)
  const valid = amount !== '' && Number.isFinite(parsed) && parsed > 0 && reason.trim().length >= 3
  const projected = client ? client.wallet_balance + (type === 'credit' ? parsed : -parsed) : 0

  const submit = async () => {
    if (!client || !valid) {
      setError('Enter an amount above zero and a reason of at least 3 characters.')
      return
    }
    if (type === 'debit' && projected < 0) {
      setError(`Insufficient balance — this client only has ${formatCurrency(client.wallet_balance)}.`)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await apiAdjustClientWallet(client.id, parsed, type, reason.trim())
      await onDone(
        `Wallet ${type === 'credit' ? 'credited' : 'debited'} — new balance ${formatCurrency(res.balance)}.`,
        'success'
      )
    } catch (err: any) {
      setBusy(false)
      setError(err?.message || 'Could not adjust the wallet.')
    }
  }

  return (
    <Modal
      open={!!client}
      title={`Adjust wallet — ${fullName(client?.first_name, client?.last_name, 'client')}`}
      onClose={busy ? () => {} : onClose}
    >
      {client && (
        <p className="text-sm text-slate-400 mb-4">
          Current balance <span className="text-white font-semibold">{formatCurrency(client.wallet_balance)}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        {(['credit', 'debit'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`h-11 rounded-lg border text-sm font-semibold capitalize transition-colors ${
              type === t
                ? t === 'credit'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                : 'bg-white/5 border-white/15 text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
        Amount (₹)
      </label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="0.00"
        className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 mb-1.5"
      />
      {client && amount !== '' && Number.isFinite(parsed) && parsed > 0 && (
        <p className={`text-xs mb-4 ${projected < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
          New balance would be {formatCurrency(projected)}
        </p>
      )}

      <label className="block text-xs font-semibold text-slate-300 mb-1.5 mt-3 uppercase tracking-wide">
        Reason (required)
      </label>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="e.g. Refund for failed consultation on 12 Aug."
        className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 resize-none"
      />

      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

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
          className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? 'Applying…' : 'Apply adjustment'}
        </button>
      </div>
    </Modal>
  )
}
