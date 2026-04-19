// src/pages/Documents.jsx
import { useState, useRef, useEffect } from 'react'
import { Upload, Download, Eye, FolderOpen, Trash2, Search, X, CheckCircle2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'

const CATEGORIES = ['diagnostic', 'prescription', 'imaging']

const categoryColors = {
  diagnostic:   { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20',    active: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  prescription: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  imaging:      { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20',  active: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
}
const categoryIcons  = { diagnostic: '🧪', prescription: '💊', imaging: '🩻' }
const categoryLabels = { diagnostic: 'Diag.', prescription: 'Rx', imaging: 'Img.' }
const filterCategories = ['all', ...CATEGORIES]

// ── Staging item ──────────────────────────────────────────────────────────────
function StagingItem({ item, onCategoryChange, onRemove }) {
  return (
    <div className="flex flex-col gap-2 bg-slate-800/50 rounded-xl px-3 py-3 border border-slate-700/50
                    xs:flex-row xs:items-center xs:gap-3 xs:px-4">

      {/* Name row */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-base flex-shrink-0">{categoryIcons[item.category]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-display font-semibold truncate leading-tight">
            {item.name}
          </p>
          <p className="text-slate-500 text-xs font-body mt-0.5 truncate">
            {item.file.type || 'file'} · {(item.file.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        {/* Remove – always top-right */}
        <button
          onClick={() => onRemove(item.id)}
          aria-label="Remove"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500
                     hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category buttons */}
      <div className="flex gap-1.5 xs:flex-shrink-0">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => onCategoryChange(item.id, c)}
            className={`flex-1 xs:flex-none min-w-0 px-2 py-1.5 rounded-lg text-xs font-display
                        font-semibold border transition-all capitalize active:scale-95 ${
              item.category === c
                ? categoryColors[c].active
                : 'bg-slate-700/40 text-slate-400 border-slate-600/40 hover:text-white hover:border-slate-500'
            }`}
          >
            <span className="xs:hidden">{categoryLabels[c]}</span>
            <span className="hidden xs:inline">{c}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Doc card ──────────────────────────────────────────────────────────────────
function DocCard({ doc, onView, onDownload, onDelete }) {
  const cat = categoryColors[doc.category] || categoryColors.diagnostic
  return (
    <div className="glass glass-hover rounded-2xl p-4 flex items-start gap-3">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex-shrink-0 ${cat.bg} border ${cat.border}
                       flex items-center justify-center text-lg`}>
        {categoryIcons[doc.category] || '📄'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-white text-sm truncate leading-tight">
          {doc.name}
        </p>
        <p className="text-slate-400 text-xs font-body mt-0.5 truncate">
          {doc.type} · {doc.size}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`px-2 py-0.5 text-xs font-display rounded-full ${cat.bg} ${cat.text}`}>
            {doc.category}
          </span>
          <span className="text-slate-600 text-xs font-mono">
            {format(new Date(doc.date), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Actions – always horizontal, compact */}
      <div className="flex gap-1 flex-shrink-0 self-start pt-0.5">
        {[
          { fn: () => onView(doc),     icon: <Eye className="w-3.5 h-3.5" />,      hover: 'hover:text-emerald-400 hover:bg-emerald-500/10', label: 'View' },
          { fn: () => onDownload(doc), icon: <Download className="w-3.5 h-3.5" />, hover: 'hover:text-cyan-400 hover:bg-cyan-500/10',    label: 'Download' },
          { fn: () => onDelete(doc.id),icon: <Trash2 className="w-3.5 h-3.5" />,   hover: 'hover:text-red-400 hover:bg-red-500/10',      label: 'Delete' },
        ].map(({ fn, icon, hover, label }) => (
          <button
            key={label}
            onClick={fn}
            title={label}
            aria-label={label}
            className={`w-8 h-8 bg-slate-700/60 rounded-lg flex items-center justify-center
                        text-slate-400 active:scale-95 transition-all ${hover}`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Documents() {
  const { token, backendUrl } = useApp()

  const [docs, setDocs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('all')
  const [dragging, setDragging]   = useState(false)
  const [error, setError]         = useState('')
  const [staged, setStaged]       = useState([])

  const fileRef = useRef()

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchDocs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (search)             params.set('search', search)
      const res  = await fetch(`${backendUrl}/api/documents?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setDocs(data.documents)
    } catch {
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocs() }, [category, search])

  // ── Stage ──────────────────────────────────────────────────────────────────
  const stageFiles = (files) => {
    const items = [...files].map(f => ({
      id: `${Date.now()}_${Math.random()}`,
      file: f,
      name: f.name.replace(/\.[^.]+$/, ''),
      category: 'diagnostic',
    }))
    setStaged(prev => [...prev, ...items])
  }

  const handleDrop      = (e) => { e.preventDefault(); setDragging(false); stageFiles(e.dataTransfer.files) }
  const handleFileInput = (e) => { stageFiles(e.target.files); e.target.value = '' }

  const updateStagedCategory = (id, cat) =>
    setStaged(prev => prev.map(s => s.id === id ? { ...s, category: cat } : s))
  const removeStagedItem = (id) =>
    setStaged(prev => prev.filter(s => s.id !== id))

  // ── Upload ─────────────────────────────────────────────────────────────────
  const uploadAll = async () => {
    if (!staged.length) return
    setError(''); setUploading(true)
    const uploaded = [], failed = []

    for (const item of staged) {
      try {
        const form = new FormData()
        form.append('file', item.file)
        form.append('category', item.category)
        form.append('name', item.name)
        const res  = await fetch(`${backendUrl}/api/documents/upload`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.message)
        uploaded.push(data.document)
      } catch (err) {
        failed.push(`${item.name}: ${err.message}`)
      }
    }

    if (uploaded.length) setDocs(prev => [...uploaded, ...prev])
    if (failed.length)   setError(`Some uploads failed:\n${failed.join('\n')}`)
    setStaged([]); setUploading(false)
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      const res  = await fetch(`${backendUrl}/api/documents/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setDocs(prev => prev.filter(d => d.id !== id))
      else setError(data.message)
    } catch { setError('Failed to delete document') }
  }

  const handleView     = (doc) => window.open(doc.url, '_blank')
  const handleDownload = (doc) =>
    Object.assign(document.createElement('a'), { href: doc.url, download: doc.name, target: '_blank' }).click()

  const totalMB = docs.reduce((acc, d) => acc + parseFloat(d.size || 0), 0)
  const usedPct = Math.min((totalMB / 1024) * 100, 100).toFixed(1)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-5 px-3 sm:px-5 lg:px-0 pb-10">

      {/* ── Header ── */}
      <div>
        <h2 className="section-title text-xl sm:text-2xl">Documents</h2>
        <p className="section-subtitle text-xs sm:text-sm mt-0.5">
          {docs.length} file{docs.length !== 1 ? 's' : ''} · Reports, prescriptions &amp; imaging
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3
                        text-xs sm:text-sm whitespace-pre-line flex items-start gap-3">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="underline text-xs flex-shrink-0 mt-px">
            dismiss
          </button>
        </div>
      )}

      {/* ── Drop zone ── */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileRef.current.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && fileRef.current.click()}
        className={`rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center cursor-pointer
                    select-none transition-all duration-200 outline-none
                    focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          dragging
            ? 'border-emerald-400 bg-emerald-400/5'
            : 'border-slate-700 hover:border-slate-500 bg-slate-800/20 hover:bg-slate-800/40'
        }`}
      >
        <input ref={fileRef} type="file" multiple className="hidden"
               onChange={handleFileInput} accept=".pdf,.jpg,.jpeg,.png,.webp,.docx" />
        <div className="w-11 h-11 sm:w-14 sm:h-14 bg-slate-700/60 rounded-2xl flex items-center
                        justify-center mx-auto mb-3 pointer-events-none">
          <Upload className="w-5 h-5 sm:w-7 sm:h-7 text-slate-400" />
        </div>
        <p className="font-display font-semibold text-white text-sm sm:text-base pointer-events-none">
          Drop files here or tap to browse
        </p>
        <p className="text-slate-500 text-xs sm:text-sm font-body mt-1 pointer-events-none">
          PDF, JPG, PNG, WEBP, DOCX — up to 25 MB each
        </p>
      </div>

      {/* ── Staging panel ── */}
      {staged.length > 0 && (
        <div className="glass rounded-2xl p-3 sm:p-5 space-y-3 border border-slate-600/40">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display font-semibold text-white text-sm">
                {staged.length} file{staged.length > 1 ? 's' : ''} ready
              </p>
              <p className="text-slate-500 text-xs font-body mt-0.5">
                Pick a category for each, then upload
              </p>
            </div>
            <button
              onClick={() => setStaged([])}
              className="text-slate-500 hover:text-slate-300 text-xs underline whitespace-nowrap flex-shrink-0 mt-0.5"
            >
              clear all
            </button>
          </div>

          <div className="space-y-2">
            {staged.map(item => (
              <StagingItem key={item.id} item={item}
                onCategoryChange={updateStagedCategory}
                onRemove={removeStagedItem} />
            ))}
          </div>

          <button
            onClick={uploadAll}
            disabled={uploading}
            className={`w-full py-3 rounded-xl font-display font-semibold text-sm transition-all
                        flex items-center justify-center gap-2 active:scale-[0.98] ${
              uploading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Upload {staged.length} file{staged.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="space-y-2 sm:space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            className="input-field pl-9 w-full text-sm"
            placeholder="Search documents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Pills – bleed-scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap pb-0.5 sm:pb-0">
          {filterCategories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-2 rounded-xl text-xs font-display font-semibold transition-all
                          capitalize whitespace-nowrap flex-shrink-0 active:scale-95 ${
                category === c
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'glass text-slate-400 hover:text-white'
              }`}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Document grid ── */}
      {loading ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading documents…</p>
        </div>
      ) : docs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-display font-semibold text-slate-400 text-sm">No documents found</p>
          <p className="text-slate-600 text-xs sm:text-sm font-body mt-1">
            Try a different filter or upload your first file
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {docs.map(doc => (
            <DocCard key={doc.id} doc={doc}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* ── Storage ── */}
      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="font-display font-semibold text-white text-sm">Storage used</p>
            <p className="text-slate-400 text-xs font-body mt-0.5">{totalMB.toFixed(1)} MB of 1 GB</p>
          </div>
          <span className="text-emerald-400 text-xs font-mono flex-shrink-0">{usedPct}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${usedPct}%` }}
          />
        </div>
      </div>

    </div>
  )
}