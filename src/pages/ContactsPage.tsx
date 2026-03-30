import { useState, useMemo } from 'react'
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  Star,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Sparkles,
  Filter,
  X,
  User,
  MapPin,
} from 'lucide-react'
import { getContacts, saveContacts } from '@/lib/storage'
import { searchContacts, filterContacts } from '@/lib/search'
import { useSearch } from '@/hooks/useSearch'
import type { Contact } from '@/types'
import type { ContactFilters } from '@/lib/search'

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const TYPE_LABELS: Record<Contact['type'], string> = {
  buyer: 'Acheteur',
  seller: 'Vendeur',
  both: 'Les deux',
}

const STATUS_LABELS: Record<Contact['status'], string> = {
  new: 'Nouveau',
  active: 'Actif',
  negotiating: 'En négo.',
  closed: 'Clôturé',
  lost: 'Perdu',
}

const TYPE_BADGE: Record<Contact['type'], string> = {
  buyer: 'badge-info',
  seller: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  both: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
}

const STATUS_BADGE: Record<Contact['status'], string> = {
  new: 'badge-info',
  active: 'badge-success',
  negotiating: 'badge-warning',
  closed: 'badge-neutral',
  lost: 'badge-danger',
}

function scoreClass(score: number) {
  if (score >= 70) return 'score-high'
  if (score >= 40) return 'score-medium'
  return 'score-low'
}

function scoreBadge(score: number) {
  if (score >= 70) return 'badge-success'
  if (score >= 40) return 'badge-warning'
  return 'badge-danger'
}

function avatarColor(name: string) {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]
  let hash = 0
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

/* Fake activity generator for the detail panel */
function fakeActivities(contact: Contact) {
  const base = new Date(contact.updatedAt).getTime()
  return [
    { date: new Date(base).toISOString(), text: 'Mise à jour du profil contact' },
    { date: new Date(base - 2 * 86400000).toISOString(), text: 'Appel téléphonique — intéressé par un T3 à Lyon' },
    { date: new Date(base - 5 * 86400000).toISOString(), text: 'Email envoyé avec 3 biens compatibles' },
    { date: new Date(base - 12 * 86400000).toISOString(), text: 'Première prise de contact via le site' },
  ]
}

/* ─── Filter pills definition ──────────────────────────────────────────────── */

type FilterPill = { label: string; key: string }

const PILLS: FilterPill[] = [
  { label: 'Tous', key: 'all' },
  { label: 'Acheteurs', key: 'buyer' },
  { label: 'Vendeurs', key: 'seller' },
  { label: 'Actifs', key: 'active' },
  { label: 'Nouveaux', key: 'new' },
]

type SortKey = 'score' | 'name' | 'date'

/* ─── Main page ────────────────────────────────────────────────────────────── */

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(() => getContacts())
  const [activePill, setActivePill] = useState('all')
  const [sortBy, setSortBy] = useState<SortKey>('score')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  const { query, setQuery, results } = useSearch(contacts, searchContacts)

  /* Build filters from active pill */
  const filters: ContactFilters = useMemo(() => {
    switch (activePill) {
      case 'buyer':
        return { type: 'buyer' as const }
      case 'seller':
        return { type: 'seller' as const }
      case 'active':
        return { status: 'active' as const }
      case 'new':
        return { status: 'new' as const }
      default:
        return {}
    }
  }, [activePill])

  /* Apply filters + sort */
  const displayed = useMemo(() => {
    const filtered = filterContacts(results, filters)
    const sorted = [...filtered]
    switch (sortBy) {
      case 'score':
        sorted.sort((a, b) => b.score - a.score)
        break
      case 'name':
        sorted.sort((a, b) => a.lastName.localeCompare(b.lastName, 'fr'))
        break
      case 'date':
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
    }
    return sorted
  }, [results, filters, sortBy])

  /* Persist helper */
  const persist = (next: Contact[]) => {
    setContacts(next)
    saveContacts(next)
  }

  const handleDelete = (id: string) => {
    persist(contacts.filter((c) => c.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const handleSaveContact = (contact: Contact) => {
    const exists = contacts.find((c) => c.id === contact.id)
    if (exists) {
      persist(contacts.map((c) => (c.id === contact.id ? contact : c)))
    } else {
      persist([contact, ...contacts])
    }
    setShowModal(false)
    setEditingContact(null)
  }

  const openEdit = (contact: Contact) => {
    setEditingContact(contact)
    setShowModal(true)
  }

  const openNew = () => {
    setEditingContact(null)
    setShowModal(true)
  }

  return (
    <div className="page-enter space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez vos acheteurs, vendeurs et prospects
          </p>
        </div>
        <button onClick={openNew} className="btn btn-primary gap-2">
          <UserPlus className="h-4 w-4" />
          Nouveau contact
        </button>
      </div>

      {/* ── Search & Filters ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un contact..."
            className="input w-full pl-11 text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          {PILLS.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePill(p.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activePill === p.key
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="score">Score</option>
              <option value="name">Nom</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results count ──────────────────────────────────────────────── */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {displayed.length} contact{displayed.length !== 1 ? 's' : ''} trouvé{displayed.length !== 1 ? 's' : ''}
      </p>

      {/* ── Contact list ───────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <User className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Aucun contact trouvé</p>
          <button onClick={openNew} className="btn btn-primary btn-sm gap-1">
            <UserPlus className="h-3.5 w-3.5" />
            Ajouter un contact
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop header */}
          <div className="hidden border-b border-gray-100 bg-gray-50/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400 md:grid md:grid-cols-[2fr_1fr_1.5fr_1fr_0.8fr_0.8fr_1fr_auto]">
            <span>Contact</span>
            <span>Type</span>
            <span>Email</span>
            <span>Téléphone</span>
            <span>Score</span>
            <span>Statut</span>
            <span>Mise à jour</span>
            <span />
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayed.map((contact, idx) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                index={idx}
                expanded={expandedId === contact.id}
                onToggle={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
                onEdit={() => openEdit(contact)}
                onDelete={() => handleDelete(contact.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      {showModal && (
        <ContactModal
          contact={editingContact}
          onSave={handleSaveContact}
          onClose={() => {
            setShowModal(false)
            setEditingContact(null)
          }}
        />
      )}
    </div>
  )
}

/* ─── Contact Row ──────────────────────────────────────────────────────────── */

interface ContactRowProps {
  contact: Contact
  index: number
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

function ContactRow({ contact, index, expanded, onToggle, onEdit, onDelete }: ContactRowProps) {
  const bg = index % 2 === 0 ? '' : 'bg-gray-50/40 dark:bg-gray-800/20'

  return (
    <div>
      {/* ─ Desktop row ─ */}
      <div
        onClick={onToggle}
        className={`hidden cursor-pointer items-center gap-2 px-4 py-3 transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-900/10 md:grid md:grid-cols-[2fr_1fr_1.5fr_1fr_0.8fr_0.8fr_1fr_auto] ${bg}`}
      >
        {/* Name + Avatar */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(contact.firstName + contact.lastName)}`}
          >
            {initials(contact.firstName, contact.lastName)}
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {contact.firstName} {contact.lastName}
          </span>
        </div>

        {/* Type */}
        <div>
          <span className={`badge ${TYPE_BADGE[contact.type]}`}>{TYPE_LABELS[contact.type]}</span>
        </div>

        {/* Email */}
        <span className="truncate text-sm text-gray-600 dark:text-gray-400">{contact.email}</span>

        {/* Phone */}
        <span className="text-sm text-gray-600 dark:text-gray-400">{contact.phone}</span>

        {/* Score */}
        <div>
          <span className={`badge ${scoreBadge(contact.score)}`}>{contact.score}</span>
        </div>

        {/* Status */}
        <div>
          <span className={`badge ${STATUS_BADGE[contact.status]}`}>{STATUS_LABELS[contact.status]}</span>
        </div>

        {/* Updated */}
        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(contact.updatedAt)}</span>

        {/* Chevron */}
        <div className="flex justify-end">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* ─ Mobile card ─ */}
      <div
        onClick={onToggle}
        className={`cursor-pointer p-4 transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-900/10 md:hidden ${bg}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColor(contact.firstName + contact.lastName)}`}
          >
            {initials(contact.firstName, contact.lastName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                {contact.firstName} {contact.lastName}
              </span>
              <span className={`badge ${scoreBadge(contact.score)}`}>{contact.score}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className={`badge ${TYPE_BADGE[contact.type]}`}>{TYPE_LABELS[contact.type]}</span>
              <span className={`badge ${STATUS_BADGE[contact.status]}`}>{STATUS_LABELS[contact.status]}</span>
            </div>
            <div className="mt-2 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {contact.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {contact.phone}
              </div>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
          )}
        </div>
      </div>

      {/* ─ Expanded detail panel ─ */}
      {expanded && <ContactDetail contact={contact} onEdit={onEdit} onDelete={onDelete} />}
    </div>
  )
}

/* ─── Contact Detail Panel ─────────────────────────────────────────────────── */

function ContactDetail({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact
  onEdit: () => void
  onDelete: () => void
}) {
  const activities = fakeActivities(contact)

  return (
    <div className="animate-fade-in border-t border-gray-100 bg-gray-50/50 px-4 py-5 dark:border-gray-800 dark:bg-gray-800/30 md:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        {/* ── Col 1: Informations ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Informations
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4 text-gray-400" />
              <span>
                {contact.firstName} {contact.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${contact.email}`} className="hover:text-brand-600 hover:underline">
                {contact.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{contact.phone}</span>
            </div>
            {contact.budget !== undefined && contact.budget > 0 && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Star className="h-4 w-4 text-gray-400" />
                <span>Budget: {formatCurrency(contact.budget)}</span>
              </div>
            )}
            {contact.preferredLocations.length > 0 && (
              <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{contact.preferredLocations.join(', ')}</span>
              </div>
            )}
          </dl>

          {/* Score bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Score</span>
              <span className={`font-bold ${scoreClass(contact.score)}`}>{contact.score}/100</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all ${
                  contact.score >= 70
                    ? 'bg-emerald-500'
                    : contact.score >= 40
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${contact.score}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Col 2: Notes & Matching ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Notes
          </h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {contact.notes || 'Aucune note'}
          </p>

          <button className="btn btn-secondary btn-sm gap-2">
            <Sparkles className="h-4 w-4 text-brand-500" />
            Trouver des biens compatibles
          </button>
        </div>

        {/* ── Col 3: Activité ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Activité récente
          </h3>
          <ul className="space-y-3">
            {activities.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-400" />
                <div>
                  <p className="text-gray-700 dark:text-gray-300">{a.text}</p>
                  <p className="text-xs text-gray-400">{formatDate(a.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <button onClick={onEdit} className="btn btn-secondary btn-sm gap-1">
          <Edit className="h-3.5 w-3.5" />
          Modifier
        </button>
        <a href={`mailto:${contact.email}`} className="btn btn-secondary btn-sm gap-1">
          <Mail className="h-3.5 w-3.5" />
          Email
        </a>
        <button onClick={onDelete} className="btn btn-danger btn-sm gap-1">
          <Trash2 className="h-3.5 w-3.5" />
          Supprimer
        </button>
      </div>
    </div>
  )
}

/* ─── Add / Edit Contact Modal ─────────────────────────────────────────────── */

interface ModalProps {
  contact: Contact | null
  onSave: (c: Contact) => void
  onClose: () => void
}

function ContactModal({ contact, onSave, onClose }: ModalProps) {
  const isNew = !contact

  const [form, setForm] = useState({
    firstName: contact?.firstName ?? '',
    lastName: contact?.lastName ?? '',
    email: contact?.email ?? '',
    phone: contact?.phone ?? '',
    type: contact?.type ?? ('buyer' as Contact['type']),
    budget: contact?.budget?.toString() ?? '',
    preferredLocations: contact?.preferredLocations.join(', ') ?? '',
    notes: contact?.notes ?? '',
  })

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const saved: Contact = {
      id: contact?.id ?? Date.now().toString(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      type: form.type,
      budget: form.budget ? Number(form.budget) : undefined,
      preferredLocations: form.preferredLocations
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      preferredTypes: contact?.preferredTypes ?? [],
      notes: form.notes.trim(),
      score: contact?.score ?? 50,
      status: contact?.status ?? 'new',
      createdAt: contact?.createdAt ?? now,
      updatedAt: now,
    }
    onSave(saved)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="animate-fade-in w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isNew ? 'Nouveau contact' : 'Modifier le contact'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
              <input
                required
                className="input w-full"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
              <input
                required
                className="input w-full"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              required
              className="input w-full"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
            <input
              className="input w-full"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select
                className="input w-full"
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
              >
                <option value="buyer">Acheteur</option>
                <option value="seller">Vendeur</option>
                <option value="both">Les deux</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Budget (€)</label>
              <input
                type="number"
                className="input w-full"
                placeholder="300 000"
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Localisations préférées
            </label>
            <input
              className="input w-full"
              placeholder="Paris, Lyon, Bordeaux"
              value={form.preferredLocations}
              onChange={(e) => set('preferredLocations', e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">Séparez par des virgules</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              rows={3}
              className="input w-full resize-none"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary gap-1">
              <UserPlus className="h-4 w-4" />
              {isNew ? 'Créer le contact' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
