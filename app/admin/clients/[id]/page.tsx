'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Wallet } from 'lucide-react'
import { apiGetAdminClient, type AdminClientDetail } from '@/lib/api'
import { WalletAdjustModal } from '../page'
import {
  StatusBadge, EmptyState, ErrorState, SkeletonRows, Toast,
  formatCurrency, formatDate, formatDateTime, fullName,
} from '@/components/admin/AdminUI'

type Tab = 'ledger' | 'consultations' | 'disputes'

const TABS: { id: Tab; label: string }[] = [
  { id: 'ledger',        label: 'Wallet Ledger' },
  { id: 'consultations', label: 'Consultations' },
  { id: 'disputes',      label: 'Disputes' },
]

export default function AdminClientDetailPage() {
  const params = useParams()
  const id = String(params.id)

  const [data, setData] = useState<AdminClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('ledger')
  const [adjusting, setAdjusting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await apiGetAdminClient(id))
    } catch (err: any) {
      setError(err?.message || 'Could not load this client.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-40 rounded bg-white/5 animate-pulse" />
        <div className="h-28 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
        <SkeletonRows rows={5} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-5">
        <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={15} /> Back to clients
        </Link>
        <ErrorState message={error || 'Client not found.'} onRetry={load} />
      </div>
    )
  }

  const a = data.account
  const name = fullName(a.first_name, a.last_name)
  const balance = Number(data.wallet?.balance ?? 0)

  return (
    <div className="space-y-6">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={15} /> Back to clients
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white/[0.03] border border-white/8 p-5"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-white">{name}</h1>
              <StatusBadge status={a.status} />
            </div>
            <p className="text-sm text-slate-400 mt-1 break-words">{a.email}</p>
            <p className="text-xs text-slate-500 mt-1">
              {a.phone || 'No phone'}
              <span className="mx-2 text-slate-700">·</span>
              Joined {formatDate(a.created_at)}
              <span className="mx-2 text-slate-700">·</span>
              Last login {a.last_login_at ? formatDateTime(a.last_login_at) : 'never'}
            </p>
          </div>

          <button
            onClick={() => setAdjusting(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors"
          >
            <Wallet size={16} /> Adjust Wallet
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-white/[0.03] border border-white/8 p-4">
            <p className="text-xs text-slate-500 mb-1">XCoins Balance</p>
            <p className="text-xl font-bold text-white tabular-nums">{formatCurrency(balance)}</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/8 p-4">
            <p className="text-xs text-slate-500 mb-1">Lifetime Spend</p>
            <p className="text-xl font-bold text-white tabular-nums">{formatCurrency(data.lifetimeSpend)}</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/8 p-4">
            <p className="text-xs text-slate-500 mb-1">Open Disputes</p>
            <p className="text-xl font-bold text-white tabular-nums">
              {data.disputes.filter(d => d.status !== 'resolved').length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-full sm:w-fit overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === t.id ? 'text-[#0A0D14]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="clientTab"
                className="absolute inset-0 bg-[#C9A227] rounded-lg"
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white/[0.03] border border-white/8 overflow-hidden">
        {tab === 'ledger' && (
          data.transactions.length === 0 ? (
            <EmptyState title="No wallet activity" hint="Recharges and spends will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/8 text-left">
                    {['Date', 'Type', 'Amount', 'Balance After', 'Note'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.transactions.map(t => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDateTime(t.created_at)}</td>
                      <td className="px-4 py-3"><StatusBadge status={t.type} /></td>
                      <td className={`px-4 py-3 tabular-nums font-semibold ${t.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'credit' ? '+' : '−'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-200 tabular-nums">{formatCurrency(t.balance_after)}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {t.note || '—'}
                        {t.reference_type === 'admin_adjustment' && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-[#C9A227]/15 text-[#D4AF37] text-[10px] font-bold uppercase">
                            Admin
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'consultations' && (
          data.consultations.length === 0 ? (
            <EmptyState title="No consultations yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-white/8 text-left">
                    {['Date', 'Type', 'Status', 'Amount'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.consultations.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDateTime(c.started_at)}</td>
                      <td className="px-4 py-3 text-slate-200 capitalize">{c.type}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-slate-200 tabular-nums">{formatCurrency(c.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'disputes' && (
          data.disputes.length === 0 ? (
            <EmptyState title="No disputes raised" hint="This client has not opened any tickets." />
          ) : (
            <ul className="divide-y divide-white/5">
              {data.disputes.map(d => (
                <li key={d.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="text-sm text-slate-200 flex-1 min-w-0">{d.reason}</p>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{formatDateTime(d.created_at)}</p>
                  {d.resolution_note && (
                    <p className="mt-2 text-xs text-slate-400 p-2.5 rounded-lg bg-white/[0.03] border border-white/8">
                      <span className="font-semibold text-slate-300">Resolution: </span>
                      {d.resolution_note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      <WalletAdjustModal
        client={adjusting ? { id: a.id, first_name: a.first_name, last_name: a.last_name, wallet_balance: balance } : null}
        onClose={() => setAdjusting(false)}
        onDone={async (msg, tone) => {
          setAdjusting(false)
          setToast({ msg, tone })
          await load()
        }}
      />

      <Toast message={toast?.msg ?? null} tone={toast?.tone} onDone={() => setToast(null)} />
    </div>
  )
}
