'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import {
  apiGetArticles, apiCreateArticle, apiUpdateArticle, type AdminArticle,
} from '@/lib/api'
import {
  StatusBadge, Modal, EmptyState, ErrorState, SkeletonRows,
  Pagination, Toast, formatDateTime,
} from '@/components/admin/AdminUI'

const PAGE_SIZE = 20

const FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft',     label: 'Drafts' },
]

/** URL-safe slug from a title — lowercase, hyphenated, no punctuation. */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200)
}

export default function AdminContentPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<AdminArticle | 'new' | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [busy, setBusy] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; tone: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetArticles({
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setArticles(res.items)
      setTotal(res.total)
    } catch (err: any) {
      setError(err?.message || 'Could not load articles.')
    } finally {
      setLoading(false)
    }
  }, [filter, search, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [filter])

  const openEditor = (article: AdminArticle | 'new') => {
    setEditing(article)
    setModalError(null)
    if (article === 'new') {
      setTitle(''); setSlug(''); setSlugTouched(false); setContent(''); setStatus('draft')
    } else {
      setTitle(article.title)
      setSlug(article.slug)
      setSlugTouched(true)   // never silently rewrite the slug of a live article
      setContent(article.content ?? '')
      setStatus(article.status)
    }
  }

  const onTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const save = async () => {
    if (title.trim().length < 3) { setModalError('Title must be at least 3 characters.'); return }
    if (!/^[a-z0-9-]+$/.test(slug)) { setModalError('Slug may only contain lowercase letters, numbers and hyphens.'); return }

    setBusy(true)
    setModalError(null)
    try {
      if (editing === 'new') {
        await apiCreateArticle({ title: title.trim(), slug, content, status })
        setToast({ msg: 'Article created.', tone: 'success' })
      } else if (editing) {
        await apiUpdateArticle(editing.id, { title: title.trim(), slug, content, status })
        setToast({ msg: 'Article updated.', tone: 'success' })
      }
      setEditing(null)
      await load()
    } catch (err: any) {
      setModalError(err?.message || 'Could not save the article.')
    } finally {
      setBusy(false)
    }
  }

  const togglePublish = async (a: AdminArticle) => {
    try {
      const next = a.status === 'published' ? 'draft' : 'published'
      await apiUpdateArticle(a.id, { status: next })
      setToast({ msg: next === 'published' ? 'Article published.' : 'Article moved to drafts.', tone: 'success' })
      await load()
    } catch (err: any) {
      setToast({ msg: err?.message || 'Could not change the status.', tone: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">Content</h1>
          <p className="text-sm text-slate-400">Articles and guides published on the public site.</p>
        </div>
        <button
          onClick={() => openEditor('new')}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors"
        >
          <Plus size={16} /> New article
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search title or slug…"
            className="w-full h-11 pl-9 pr-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f.id ? 'bg-[#C9A227] text-[#0A0D14]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={6} />
      ) : articles.length === 0 ? (
        <EmptyState title="No articles yet" hint='Use "New article" to write your first one.' />
      ) : (
        <div className="rounded-xl bg-white/[0.03] border border-white/8 divide-y divide-white/5">
          {articles.map(a => (
            <div key={a.id} className="p-4 flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{a.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">/{a.slug}</p>
                <p className="text-xs text-slate-500 mt-1.5">
                  {a.status === 'published' && a.published_at
                    ? `Published ${formatDateTime(a.published_at)}`
                    : `Created ${formatDateTime(a.created_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={a.status === 'published' ? 'verified' : 'pending_signup'} />
                <button
                  onClick={() => openEditor(a)}
                  className="px-3 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => togglePublish(a)}
                  className={`px-3 h-9 rounded-lg text-xs font-semibold transition-colors ${
                    a.status === 'published'
                      ? 'border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  }`}
                >
                  {a.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      )}

      <Modal
        open={!!editing}
        title={editing === 'new' ? 'New article' : 'Edit article'}
        onClose={busy ? () => {} : () => setEditing(null)}
      >
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Title</label>
        <input
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          maxLength={200}
          placeholder="How to register a trademark in India"
          className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 mb-4"
        />

        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Slug</label>
        <input
          value={slug}
          onChange={e => { setSlugTouched(true); setSlug(e.target.value) }}
          maxLength={200}
          placeholder="how-to-register-a-trademark"
          className="w-full h-11 px-3.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 mb-4"
        />

        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Body</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={9}
          className="w-full px-3.5 py-2.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#C9A227]/60 resize-none mb-4"
          placeholder="Article body…"
        />

        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Status</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value as 'draft' | 'published')}
          className="w-full h-11 px-3 rounded-lg bg-white/8 border border-white/15 text-white text-sm focus:outline-none focus:border-[#C9A227]/60"
        >
          <option value="draft" className="bg-[#111318]">Draft</option>
          <option value="published" className="bg-[#111318]">Published</option>
        </select>

        {modalError && <p className="mt-3 text-xs text-rose-400">{modalError}</p>}

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setEditing(null)}
            disabled={busy}
            className="flex-1 h-11 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="flex-1 h-11 rounded-lg bg-[#C9A227] hover:bg-[#D4AF37] text-[#0A0D14] font-bold text-sm transition-colors disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </Modal>

      <Toast message={toast?.msg ?? null} tone={toast?.tone} onDone={() => setToast(null)} />
    </div>
  )
}
