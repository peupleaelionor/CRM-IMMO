import { useState, useMemo, useCallback } from 'react'
import {
  Search,
  Plus,
  Grid3x3,
  List,
  MapPin,
  Maximize2,
  BedDouble,
  DoorOpen,
  Sparkles,
  Copy,
  Save,
  Edit,
  Trash2,
  X,
  Building2,
  Home,
  Mountain,
  Store,
  ChevronDown,
  Loader2,
  Check,
} from 'lucide-react'
import { getProperties, saveProperties, getContacts } from '@/lib/storage'
import { searchProperties, filterProperties } from '@/lib/search'
import { generatePropertyDescription } from '@/lib/ai'
import { useSearch } from '@/hooks/useSearch'
import type { Property, Contact } from '@/types'
import type { PropertyFilters } from '@/lib/search'

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const TYPE_LABELS: Record<Property['type'], string> = {
  apartment: 'Appartement',
  house: 'Maison',
  land: 'Terrain',
  commercial: 'Commercial',
}

const TYPE_ICONS: Record<Property['type'], typeof Building2> = {
  apartment: Building2,
  house: Home,
  land: Mountain,
  commercial: Store,
}

const TYPE_GRADIENTS: Record<Property['type'], string> = {
  apartment: 'from-blue-400 to-blue-600',
  house: 'from-emerald-400 to-emerald-600',
  land: 'from-amber-400 to-amber-600',
  commercial: 'from-purple-400 to-purple-600',
}

const STATUS_LABELS: Record<Property['status'], string> = {
  available: 'Disponible',
  under_offer: 'Sous offre',
  sold: 'Vendu',
  off_market: 'Hors marché',
}

const STATUS_BADGE: Record<Property['status'], string> = {
  available: 'badge-success',
  under_offer: 'badge-warning',
  sold: 'badge-danger',
  off_market: 'badge-neutral',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getOwnerName(ownerId: string, contacts: Contact[]): string {
  const c = contacts.find((ct) => ct.id === ownerId)
  return c ? `${c.firstName} ${c.lastName}` : 'Inconnu'
}

/* ─── Filter pills ─────────────────────────────────────────────────────────── */

type TypePill = { label: string; value: Property['type'] | 'all' }

const TYPE_PILLS: TypePill[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Appartement', value: 'apartment' },
  { label: 'Maison', value: 'house' },
  { label: 'Terrain', value: 'land' },
  { label: 'Commercial', value: 'commercial' },
]

/* ─── Main page ────────────────────────────────────────────────────────────── */

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(() => getProperties())
  const contacts = useMemo(() => getContacts(), [])

  const [activePill, setActivePill] = useState<Property['type'] | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterCity, setFilterCity] = useState('')
  const [filterMinPrice, setFilterMinPrice] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')
  const [filterMinSurface, setFilterMinSurface] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const { query, setQuery, results } = useSearch(properties, searchProperties)

  const filters: PropertyFilters = useMemo(() => {
    const f: PropertyFilters = {}
    if (activePill !== 'all') f.type = activePill
    if (filterCity.trim()) f.city = filterCity.trim()
    if (filterMinPrice) f.minPrice = Number(filterMinPrice)
    if (filterMaxPrice) f.maxPrice = Number(filterMaxPrice)
    if (filterMinSurface) f.minSurface = Number(filterMinSurface)
    return f
  }, [activePill, filterCity, filterMinPrice, filterMaxPrice, filterMinSurface])

  const displayed = useMemo(
    () => filterProperties(results, filters),
    [results, filters],
  )

  const persist = useCallback(
    (next: Property[]) => {
      setProperties(next)
      saveProperties(next)
    },
    [],
  )

  const handleDelete = (id: string) => {
    persist(properties.filter((p) => p.id !== id))
    if (selectedProperty?.id === id) setSelectedProperty(null)
  }

  const handleSaveProperty = (property: Property) => {
    const exists = properties.find((p) => p.id === property.id)
    if (exists) {
      persist(properties.map((p) => (p.id === property.id ? property : p)))
    } else {
      persist([property, ...properties])
    }
    setShowAddModal(false)
  }

  const handleUpdateProperty = (updated: Property) => {
    persist(properties.map((p) => (p.id === updated.id ? updated : p)))
    setSelectedProperty(updated)
  }

  return (
    <div className="page-enter space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Biens immobiliers</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Votre portefeuille de biens
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un bien
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
            placeholder="Rechercher un bien..."
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

        {/* Type pills */}
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_PILLS.map((p) => (
            <button
              key={p.value}
              onClick={() => setActivePill(p.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activePill === p.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}

          {/* Extra filters */}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <input
              type="number"
              placeholder="Prix min"
              value={filterMinPrice}
              onChange={(e) => setFilterMinPrice(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
            <input
              type="number"
              placeholder="Prix max"
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
            <input
              type="text"
              placeholder="Ville"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
            <input
              type="number"
              placeholder="Surface min"
              value={filterMinSurface}
              onChange={(e) => setFilterMinSurface(e.target.value)}
              className="w-28 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />

            {/* View toggle */}
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-l-lg p-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-r-lg p-1.5 ${
                  viewMode === 'list'
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results count ──────────────────────────────────────────────── */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {displayed.length} bien{displayed.length !== 1 ? 's' : ''} trouvé{displayed.length !== 1 ? 's' : ''}
      </p>

      {/* ── Property grid / list ───────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Aucun bien trouvé</p>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm gap-1">
            <Plus className="h-3.5 w-3.5" />
            Ajouter un bien
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              ownerName={getOwnerName(property.ownerId, contacts)}
              onView={() => setSelectedProperty(property)}
            />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden border-b border-gray-100 bg-gray-50/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]">
            <span>Bien</span>
            <span>Type</span>
            <span>Prix</span>
            <span>Surface</span>
            <span>Ville</span>
            <span>Statut</span>
            <span />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayed.map((property) => (
              <PropertyListRow
                key={property.id}
                property={property}
                onView={() => setSelectedProperty(property)}
                onDelete={() => handleDelete(property.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Detail Modal ───────────────────────────────────────────────── */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          contacts={contacts}
          onClose={() => setSelectedProperty(null)}
          onUpdate={handleUpdateProperty}
          onDelete={() => handleDelete(selectedProperty.id)}
        />
      )}

      {/* ── Add Modal ──────────────────────────────────────────────────── */}
      {showAddModal && (
        <AddPropertyModal
          contacts={contacts}
          onSave={handleSaveProperty}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

/* ─── Property Card (Grid) ─────────────────────────────────────────────────── */

function PropertyCard({
  property,
  ownerName,
  onView,
}: {
  property: Property
  ownerName: string
  onView: () => void
}) {
  const Icon = TYPE_ICONS[property.type]

  return (
    <div className="card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Gradient header */}
      <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${TYPE_GRADIENTS[property.type]}`}>
        <Icon className="h-16 w-16 text-white/30" />
        <span className={`absolute left-3 top-3 ${STATUS_BADGE[property.status]}`}>
          {STATUS_LABELS[property.status]}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {formatPrice(property.price)}
        </p>
        <h3 className="mt-1 font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
          {property.title}
        </h3>
        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="h-3.5 w-3.5" />
          <span>{property.city} {property.zipCode}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3.5 w-3.5" />
            {property.surface} m²
          </span>
          <span className="flex items-center gap-1">
            <DoorOpen className="h-3.5 w-3.5" />
            {property.rooms} p.
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {property.bedrooms} ch.
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Propriétaire : {ownerName}
        </p>
      </div>

      {/* Actions */}
      <div className="flex border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onView}
          className="flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
        >
          <Edit className="h-3.5 w-3.5" />
          Voir
        </button>
        <button
          onClick={onView}
          className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-purple-600 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-purple-400"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Matching IA
        </button>
        <button
          onClick={onView}
          className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-emerald-600 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Description IA
        </button>
      </div>
    </div>
  )
}

/* ─── Property List Row ────────────────────────────────────────────────────── */

function PropertyListRow({
  property,
  onView,
  onDelete,
}: {
  property: Property
  onView: () => void
  onDelete: () => void
}) {
  const Icon = TYPE_ICONS[property.type]

  return (
    <div
      onClick={onView}
      className="cursor-pointer items-center gap-2 px-4 py-3 transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-900/10 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]"
    >
      {/* Title + icon */}
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${TYPE_GRADIENTS[property.type]}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="font-medium text-gray-900 dark:text-white line-clamp-1">{property.title}</span>
      </div>

      <span className="text-sm text-gray-600 dark:text-gray-400">{TYPE_LABELS[property.type]}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(property.price)}</span>
      <span className="text-sm text-gray-600 dark:text-gray-400">{property.surface} m²</span>
      <span className="text-sm text-gray-600 dark:text-gray-400">{property.city}</span>
      <span className={STATUS_BADGE[property.status]}>{STATUS_LABELS[property.status]}</span>

      <div className="flex justify-end gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ─── Property Detail Modal ────────────────────────────────────────────────── */

function PropertyDetailModal({
  property,
  contacts,
  onClose,
  onUpdate,
  onDelete,
}: {
  property: Property
  contacts: Contact[]
  onClose: () => void
  onUpdate: (p: Property) => void
  onDelete: () => void
}) {
  const [aiDescription, setAiDescription] = useState(property.aiDescription ?? '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedAi, setSavedAi] = useState(false)
  const [status, setStatus] = useState<Property['status']>(property.status)

  const Icon = TYPE_ICONS[property.type]
  const owner = contacts.find((c) => c.id === property.ownerId)

  const handleGenerateDescription = async () => {
    setIsGenerating(true)
    setSavedAi(false)
    try {
      const description = await generatePropertyDescription(property)
      setAiDescription(description)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(aiDescription)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveDescription = () => {
    onUpdate({ ...property, aiDescription, updatedAt: new Date().toISOString() })
    setSavedAi(true)
    setTimeout(() => setSavedAi(false), 2000)
  }

  const handleStatusChange = (newStatus: Property['status']) => {
    setStatus(newStatus)
    onUpdate({ ...property, status: newStatus, updatedAt: new Date().toISOString() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10" onClick={onClose}>
      <div
        className="animate-fade-in w-full max-w-3xl rounded-xl bg-white shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className={`relative flex h-44 items-center justify-center rounded-t-xl bg-gradient-to-br ${TYPE_GRADIENTS[property.type]}`}>
          <Icon className="h-20 w-20 text-white/30" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/20 p-1.5 text-white hover:bg-black/40"
          >
            <X className="h-5 w-5" />
          </button>
          <span className={`absolute left-3 top-3 ${STATUS_BADGE[property.status]}`}>
            {STATUS_LABELS[property.status]}
          </span>
        </div>

        <div className="space-y-6 p-6">
          {/* Title + price */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{property.title}</h2>
            <p className="mt-1 text-3xl font-extrabold text-brand-600 dark:text-brand-400">
              {formatPrice(property.price)}
            </p>
          </div>

          {/* Info grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{property.location}, {property.city} {property.zipCode}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Maximize2 className="h-4 w-4 text-gray-400" />
              <span>{property.surface} m²</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <DoorOpen className="h-4 w-4 text-gray-400" />
              <span>{property.rooms} pièces · {property.bedrooms} chambres</span>
            </div>
          </div>

          {/* Features */}
          {property.features.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Caractéristiques
              </h3>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f) => (
                  <span key={f} className="badge-info">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Description
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

          {/* Owner info */}
          {owner && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Propriétaire
              </h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p className="font-medium">{owner.firstName} {owner.lastName}</p>
                <p>{owner.email}</p>
                <p>{owner.phone}</p>
              </div>
            </div>
          )}

          {/* Status management */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Statut
            </h3>
            <div className="relative inline-block">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as Property['status'])}
                className="input w-48 appearance-none pr-8"
              >
                <option value="available">Disponible</option>
                <option value="under_offer">Sous offre</option>
                <option value="sold">Vendu</option>
                <option value="off_market">Hors marché</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* ── AI Description Generator ─────────────────────────────────── */}
          <div className="rounded-xl border-2 border-brand-300 bg-brand-50/50 p-5 dark:border-brand-700 dark:bg-brand-900/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-brand-500" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Générateur de description IA
              </h3>
            </div>

            <button
              onClick={handleGenerateDescription}
              disabled={isGenerating}
              className="btn btn-primary gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? "Génération en cours..." : "✨ Générer description IA"}
            </button>

            {isGenerating && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-white p-4 dark:bg-gray-800">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" style={{ animationDelay: '0.2s' }} />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  L&apos;IA rédige votre annonce...
                </span>
              </div>
            )}

            {aiDescription && !isGenerating && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={aiDescription}
                  onChange={(e) => { setAiDescription(e.target.value); setSavedAi(false) }}
                  rows={8}
                  className="input w-full resize-y font-sans text-sm leading-relaxed"
                />
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="btn btn-secondary btn-sm gap-1">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copié !' : 'Copier'}
                  </button>
                  <button onClick={handleSaveDescription} className="btn btn-primary btn-sm gap-1">
                    {savedAi ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    {savedAi ? 'Sauvegardé !' : 'Sauvegarder'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick matching */}
          <button className="btn btn-secondary gap-2">
            <Sparkles className="h-4 w-4 text-brand-500" />
            Trouver des acheteurs
          </button>

          {/* Footer actions */}
          <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button onClick={onDelete} className="btn btn-danger btn-sm gap-1">
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
              Créé le {formatDate(property.createdAt)} · Mis à jour le {formatDate(property.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Add Property Modal ───────────────────────────────────────────────────── */

function AddPropertyModal({
  contacts,
  onSave,
  onClose,
}: {
  contacts: Contact[]
  onSave: (p: Property) => void
  onClose: () => void
}) {
  const sellers = contacts.filter((c) => c.type === 'seller' || c.type === 'both')

  const [form, setForm] = useState({
    title: '',
    type: 'apartment' as Property['type'],
    price: '',
    surface: '',
    rooms: '',
    bedrooms: '',
    city: '',
    zipCode: '',
    location: '',
    features: '',
    ownerId: sellers[0]?.id ?? '',
    description: '',
  })

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const saved: Property = {
      id: Date.now().toString(),
      title: form.title.trim(),
      type: form.type,
      price: Number(form.price),
      surface: Number(form.surface),
      rooms: Number(form.rooms),
      bedrooms: Number(form.bedrooms),
      city: form.city.trim(),
      zipCode: form.zipCode.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      images: [],
      features: form.features
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      status: 'available',
      ownerId: form.ownerId,
      createdAt: now,
      updatedAt: now,
    }
    onSave(saved)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div
        className="animate-fade-in w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ajouter un bien</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
            <input
              required
              className="input w-full"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Appartement T3 lumineux centre-ville"
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
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="land">Terrain</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Prix (€)</label>
              <input
                type="number"
                required
                className="input w-full"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="250000"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Surface (m²)</label>
              <input
                type="number"
                required
                className="input w-full"
                value={form.surface}
                onChange={(e) => set('surface', e.target.value)}
                placeholder="75"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Pièces</label>
              <input
                type="number"
                required
                className="input w-full"
                value={form.rooms}
                onChange={(e) => set('rooms', e.target.value)}
                placeholder="3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Chambres</label>
              <input
                type="number"
                required
                className="input w-full"
                value={form.bedrooms}
                onChange={(e) => set('bedrooms', e.target.value)}
                placeholder="2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ville</label>
              <input
                required
                className="input w-full"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Lyon"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Code postal</label>
              <input
                required
                className="input w-full"
                value={form.zipCode}
                onChange={(e) => set('zipCode', e.target.value)}
                placeholder="69001"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
            <input
              className="input w-full"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="12 rue de la République"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Caractéristiques <span className="font-normal text-gray-400">(séparées par des virgules)</span>
            </label>
            <input
              className="input w-full"
              value={form.features}
              onChange={(e) => set('features', e.target.value)}
              placeholder="Balcon, Parking, Cave"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Propriétaire</label>
            <select
              className="input w-full"
              value={form.ownerId}
              onChange={(e) => set('ownerId', e.target.value)}
            >
              {sellers.length === 0 && <option value="">Aucun vendeur disponible</option>}
              {sellers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              className="input w-full resize-y"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Description du bien..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary gap-1">
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
