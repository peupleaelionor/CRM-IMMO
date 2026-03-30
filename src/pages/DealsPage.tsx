import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Plus,
  Euro,
  Clock,
  ChevronRight,
  Edit,
  Trash2,
  X,
  ArrowRight,
  Check,
  XCircle,
  Building2,
  User,
  MoreVertical,
  Calendar,
} from 'lucide-react'
import { getDeals, saveDeals, getContacts, getProperties } from '@/lib/storage'
import type { Deal, Contact, Property } from '@/types'

/* ─── Stage config ─────────────────────────────────────────────────────────── */

type DealStatus = Deal['status']

interface StageConfig {
  key: DealStatus
  label: string
  color: string
  bg: string
  border: string
  dot: string
  dropHighlight: string
}

const STAGES: StageConfig[] = [
  {
    key: 'lead',
    label: 'Leads',
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    dot: 'bg-gray-400',
    dropHighlight: 'border-gray-500 bg-gray-100/50 dark:bg-gray-800/50',
  },
  {
    key: 'viewing',
    label: 'Visites',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-600',
    dot: 'bg-blue-500',
    dropHighlight: 'border-blue-500 bg-blue-100/50 dark:bg-blue-900/30',
  },
  {
    key: 'offer',
    label: 'Offres',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-300 dark:border-amber-600',
    dot: 'bg-amber-500',
    dropHighlight: 'border-amber-500 bg-amber-100/50 dark:bg-amber-900/30',
  },
  {
    key: 'negotiation',
    label: 'Négociation',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-600',
    dot: 'bg-orange-500',
    dropHighlight: 'border-orange-500 bg-orange-100/50 dark:bg-orange-900/30',
  },
  {
    key: 'closing',
    label: 'Closing',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    border: 'border-emerald-300 dark:border-emerald-600',
    dot: 'bg-emerald-500',
    dropHighlight: 'border-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/30',
  },
  {
    key: 'won',
    label: 'Gagné',
    color: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-600',
    dot: 'bg-green-500',
    dropHighlight: 'border-green-500 bg-green-100/50 dark:bg-green-900/30',
  },
  {
    key: 'lost',
    label: 'Perdu',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-300 dark:border-red-600',
    dot: 'bg-red-500',
    dropHighlight: 'border-red-500 bg-red-100/50 dark:bg-red-900/30',
  },
]

const STAGE_INDEX: Record<DealStatus, number> = {
  lead: 0,
  viewing: 1,
  offer: 2,
  negotiation: 3,
  closing: 4,
  won: 5,
  lost: 6,
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

function contactName(id: string, contacts: Contact[]): string {
  const c = contacts.find((ct) => ct.id === id)
  return c ? `${c.firstName} ${c.lastName}` : 'Inconnu'
}

function propertyTitle(id: string, properties: Property[]): string {
  const p = properties.find((pr) => pr.id === id)
  return p ? p.title : 'Bien inconnu'
}

function nextStage(status: DealStatus): DealStatus | null {
  const order: DealStatus[] = ['lead', 'viewing', 'offer', 'negotiation', 'closing', 'won']
  const idx = order.indexOf(status)
  if (idx === -1 || idx >= order.length - 1) return null
  return order[idx + 1]
}

function priorityFromDays(days: number): { color: string; label: string } {
  if (days > 30) return { color: 'bg-red-500', label: 'Urgent' }
  if (days > 14) return { color: 'bg-amber-500', label: 'Moyen' }
  return { color: 'bg-green-500', label: 'Récent' }
}

function generateId(): string {
  return `d_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/* ─── Main page ────────────────────────────────────────────────────────────── */

export function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(() => getDeals())
  const contacts = useMemo(() => getContacts(), [])
  const properties = useMemo(() => getProperties(), [])

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Drag state
  const dragRef = useRef<{ dealId: string; sourceStatus: DealStatus } | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<DealStatus | null>(null)

  /* persistence */
  const persist = useCallback((next: Deal[]) => {
    setDeals(next)
    saveDeals(next)
  }, [])

  /* deal CRUD */
  const handleSaveDeal = (deal: Deal) => {
    const exists = deals.find((d) => d.id === deal.id)
    if (exists) {
      persist(deals.map((d) => (d.id === deal.id ? deal : d)))
    } else {
      persist([deal, ...deals])
    }
    setShowAddModal(false)
  }

  const handleDelete = (id: string) => {
    persist(deals.filter((d) => d.id !== id))
    if (selectedDeal?.id === id) setSelectedDeal(null)
    setOpenMenuId(null)
  }

  const handleMoveToStage = (dealId: string, newStatus: DealStatus) => {
    persist(
      deals.map((d) =>
        d.id === dealId
          ? { ...d, status: newStatus, stage: STAGE_INDEX[newStatus] + 1, updatedAt: new Date().toISOString() }
          : d,
      ),
    )
    setOpenMenuId(null)
  }

  /* drag handlers */
  const handleDragStart = (e: React.DragEvent, dealId: string, sourceStatus: DealStatus) => {
    dragRef.current = { dealId, sourceStatus }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', dealId)
    // Add dragging style after a tick so the ghost image renders normally
    requestAnimationFrame(() => {
      const el = document.getElementById(`deal-card-${dealId}`)
      if (el) el.classList.add('opacity-50', 'shadow-xl')
    })
  }

  const handleDragOver = (e: React.DragEvent, status: DealStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = (e: React.DragEvent, status: DealStatus) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null
    const currentTarget = e.currentTarget as HTMLElement
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      if (dragOverColumn === status) setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetStatus: DealStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const drag = dragRef.current
    if (!drag) return
    if (drag.sourceStatus !== targetStatus) {
      handleMoveToStage(drag.dealId, targetStatus)
    }
    dragRef.current = null
  }

  const handleDragEnd = () => {
    // Clean up visual styles
    if (dragRef.current) {
      const el = document.getElementById(`deal-card-${dragRef.current.dealId}`)
      if (el) el.classList.remove('opacity-50', 'shadow-xl')
    }
    dragRef.current = null
    setDragOverColumn(null)
  }

  /* computed */
  const totalValue = useMemo(
    () => deals.filter((d) => d.status !== 'lost').reduce((sum, d) => sum + d.value, 0),
    [deals],
  )

  const dealsByStage = useMemo(() => {
    const map: Record<DealStatus, Deal[]> = {
      lead: [],
      viewing: [],
      offer: [],
      negotiation: [],
      closing: [],
      won: [],
      lost: [],
    }
    for (const d of deals) {
      map[d.status].push(d)
    }
    return map
  }, [deals])

  return (
    <div className="page-enter flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Suivez vos deals de A à Z</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Euro className="w-4 h-4" />
            <span>Valeur totale: {formatPrice(totalValue)}</span>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Nouveau deal
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-max px-1">
          {STAGES.map((stage) => {
            const columnDeals = dealsByStage[stage.key]
            const columnValue = columnDeals.reduce((s, d) => s + d.value, 0)
            const isDropTarget = dragOverColumn === stage.key

            return (
              <div
                key={stage.key}
                className={`kanban-column flex-shrink-0 border-2 border-transparent transition-colors duration-200 ${
                  isDropTarget ? stage.dropHighlight + ' !border-dashed' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, stage.key)}
                onDragLeave={(e) => handleDragLeave(e, stage.key)}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${stage.dot}`} />
                    <span className={`text-sm font-semibold ${stage.color}`}>{stage.label}</span>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${stage.bg} ${stage.color}`}
                    >
                      {columnDeals.length}
                    </span>
                  </div>
                </div>
                <div className={`text-xs font-medium mb-3 ${stage.color}`}>
                  {formatPrice(columnValue)}
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                  {columnDeals.map((deal) => {
                    const days = daysSince(deal.createdAt)
                    const priority = priorityFromDays(days)

                    return (
                      <div
                        key={deal.id}
                        id={`deal-card-${deal.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id, deal.status)}
                        onDragEnd={handleDragEnd}
                        className="kanban-card relative group"
                        onClick={() => setSelectedDeal(deal)}
                      >
                        {/* Priority dot + title */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${priority.color}`}
                              title={priority.label}
                            />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {deal.title}
                            </span>
                          </div>
                          {/* Action menu */}
                          <div className="relative flex-shrink-0">
                            <button
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(openMenuId === deal.id ? null : deal.id)
                              }}
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                            {openMenuId === deal.id && (
                              <DealCardMenu
                                deal={deal}
                                onMoveNext={() => {
                                  const ns = nextStage(deal.status)
                                  if (ns) handleMoveToStage(deal.id, ns)
                                }}
                                onEdit={() => {
                                  setSelectedDeal(deal)
                                  setOpenMenuId(null)
                                }}
                                onDelete={() => handleDelete(deal.id)}
                                onClose={() => setOpenMenuId(null)}
                              />
                            )}
                          </div>
                        </div>

                        {/* Buyer */}
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <User className="w-3 h-3" />
                          <span className="truncate">{contactName(deal.buyerId, contacts)}</span>
                        </div>

                        {/* Value & commission */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatPrice(deal.value)}
                          </span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatPrice(deal.commission)}
                          </span>
                        </div>

                        {/* Days */}
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 dark:text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{days}j</span>
                        </div>
                      </div>
                    )
                  })}

                  {columnDeals.length === 0 && (
                    <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-8">
                      Aucun deal
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddDealModal
          contacts={contacts}
          properties={properties}
          onSave={handleSaveDeal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          contacts={contacts}
          properties={properties}
          onClose={() => setSelectedDeal(null)}
          onMoveStage={(status) => {
            handleMoveToStage(selectedDeal.id, status)
            setSelectedDeal({ ...selectedDeal, status, stage: STAGE_INDEX[status] + 1, updatedAt: new Date().toISOString() })
          }}
          onDelete={() => handleDelete(selectedDeal.id)}
        />
      )}
    </div>
  )
}

/* ─── Deal card action menu ────────────────────────────────────────────────── */

function DealCardMenu({
  deal,
  onMoveNext,
  onEdit,
  onDelete,
  onClose,
}: {
  deal: Deal
  onMoveNext: () => void
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const ns = nextStage(deal.status)

  return (
    <>
      {/* Backdrop to close menu */}
      <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); onClose() }} />
      <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 text-sm">
        {ns && (
          <button
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            onClick={(e) => { e.stopPropagation(); onMoveNext() }}
          >
            <ArrowRight className="w-4 h-4" />
            Étape suivante
          </button>
        )}
        <button
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          onClick={(e) => { e.stopPropagation(); onEdit() }}
        >
          <Edit className="w-4 h-4" />
          Modifier
        </button>
        <button
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>
    </>
  )
}

/* ─── Add deal modal ───────────────────────────────────────────────────────── */

function AddDealModal({
  contacts,
  properties,
  onSave,
  onClose,
}: {
  contacts: Contact[]
  properties: Property[]
  onSave: (deal: Deal) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [buyerId, setBuyerId] = useState('')
  const [value, setValue] = useState('')
  const [commissionPct, setCommissionPct] = useState('4')
  const [notes, setNotes] = useState('')

  const selectedProperty = properties.find((p) => p.id === propertyId)
  const sellerId = selectedProperty?.ownerId ?? ''

  const sellerName = sellerId ? contactName(sellerId, contacts) : '—'

  const commissionAmount = value && commissionPct
    ? Math.round((Number(value) * Number(commissionPct)) / 100)
    : 0

  const buyers = contacts.filter((c) => c.type === 'buyer' || c.type === 'both')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !propertyId || !buyerId || !value) return

    const deal: Deal = {
      id: generateId(),
      title: title.trim(),
      propertyId,
      buyerId,
      sellerId,
      status: 'lead',
      value: Number(value),
      commission: commissionAmount,
      notes: notes.trim(),
      stage: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSave(deal)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nouveau deal</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Dupont → Appt Paris 16e"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
          </div>

          {/* Bien */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bien</label>
            <select
              value={propertyId}
              onChange={(e) => {
                setPropertyId(e.target.value)
                const prop = properties.find((p) => p.id === e.target.value)
                if (prop && !value) setValue(String(prop.price))
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un bien</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {formatPrice(p.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Acheteur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acheteur</label>
            <select
              value={buyerId}
              onChange={(e) => setBuyerId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un acheteur</option>
              {buyers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Vendeur (auto) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendeur</label>
            <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
              {sellerName}
            </div>
          </div>

          {/* Valeur & Commission */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valeur (€)</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="300000"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission (%)</label>
              <input
                type="number"
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                min={0}
                max={100}
                step={0.1}
              />
              {commissionAmount > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  = {formatPrice(commissionAmount)}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              placeholder="Notes sur ce deal…"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Annuler
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer le deal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Deal detail modal ────────────────────────────────────────────────────── */

function DealDetailModal({
  deal,
  contacts,
  properties,
  onClose,
  onMoveStage,
  onDelete,
}: {
  deal: Deal
  contacts: Contact[]
  properties: Property[]
  onClose: () => void
  onMoveStage: (status: DealStatus) => void
  onDelete: () => void
}) {
  const property = properties.find((p) => p.id === deal.propertyId)
  const buyer = contacts.find((c) => c.id === deal.buyerId)
  const seller = contacts.find((c) => c.id === deal.sellerId)
  const stageConfig = STAGES.find((s) => s.key === deal.status)!
  const ns = nextStage(deal.status)
  const days = daysSince(deal.createdAt)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${stageConfig.dot}`} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{deal.title}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageConfig.bg} ${stageConfig.color}`}>
              {stageConfig.label}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <Euro className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(deal.value)}</p>
              <p className="text-xs text-gray-500">Valeur</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <Euro className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(deal.commission)}</p>
              <p className="text-xs text-gray-500">Commission</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-white">{days}j</p>
              <p className="text-xs text-gray-500">Ancienneté</p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Pipeline</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {STAGES.filter((s) => s.key !== 'lost').map((s, i) => {
                const isActive = s.key === deal.status
                const isPast = STAGE_INDEX[deal.status] > STAGE_INDEX[s.key] || deal.status === 'lost'
                return (
                  <div key={s.key} className="flex items-center">
                    {i > 0 && (
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isPast || isActive ? 'text-brand-500' : 'text-gray-300 dark:text-gray-600'}`} />
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${
                        isActive
                          ? `${s.bg} ${s.color} ring-2 ring-offset-1 ring-current`
                          : isPast
                            ? 'bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Related info */}
          <div className="grid grid-cols-2 gap-4">
            {/* Property */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bien</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {property?.title ?? 'Inconnu'}
              </p>
              {property && (
                <p className="text-xs text-gray-500 mt-1">
                  {property.location}, {property.city} — {formatPrice(property.price)}
                </p>
              )}
            </div>

            {/* Contacts */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacts</span>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">Acheteur:</span>{' '}
                {buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Inconnu'}
              </p>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                <span className="font-medium">Vendeur:</span>{' '}
                {seller ? `${seller.firstName} ${seller.lastName}` : 'Inconnu'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {deal.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {deal.notes}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Créé le {new Date(deal.createdAt).toLocaleDateString('fr-FR')}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Mis à jour le {new Date(deal.updatedAt).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {ns && (
              <button
                className="btn-primary flex items-center gap-2 text-sm"
                onClick={() => onMoveStage(ns)}
              >
                <ArrowRight className="w-4 h-4" />
                Passer à « {STAGES.find((s) => s.key === ns)!.label} »
              </button>
            )}
            {deal.status !== 'won' && deal.status !== 'lost' && (
              <>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                  onClick={() => onMoveStage('won')}
                >
                  <Check className="w-4 h-4" />
                  Gagné
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                  onClick={() => onMoveStage('lost')}
                >
                  <XCircle className="w-4 h-4" />
                  Perdu
                </button>
              </>
            )}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors ml-auto"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
