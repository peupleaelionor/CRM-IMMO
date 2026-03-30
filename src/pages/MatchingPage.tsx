import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Sparkles, Search, Building2, User, ArrowRight, Mail, Plus, Eye,
  Target, Star, TrendingUp, Loader2, ChevronDown, Check, Zap, Heart,
} from 'lucide-react'
import { getContacts, getProperties } from '@/lib/storage'
import { matchBuyerToProperties, matchPropertyToBuyers } from '@/lib/matching'
import type { Contact, Property, MatchResult } from '@/types'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor"
          className="text-gray-200 dark:text-gray-700" strokeWidth="5" />
        <circle cx="36" cy="36" r={radius} fill="none" stroke={color}
          strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
      </svg>
      <span className="absolute text-lg font-bold" style={{ color }}>{score}%</span>
    </div>
  )
}

function MatchSummary({ results }: { results: MatchResult[] }) {
  if (results.length === 0) return null
  const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
  const best = results[0]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="card p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Correspondances</p>
          <p className="text-xl font-bold">{results.length} trouvée{results.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="card p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Score moyen</p>
          <p className="text-xl font-bold">{avg}%</p>
        </div>
      </div>
      <div className="card p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
          <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Meilleur match</p>
          <p className="text-xl font-bold">{best.score}%</p>
        </div>
      </div>
    </div>
  )
}

export default function MatchingPage() {
  const [mode, setMode] = useState<'property' | 'buyer'>('property')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [selectedContactId, setSelectedContactId] = useState<string>('')
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    setContacts(getContacts())
    setProperties(getProperties())
  }, [])

  const buyers = useMemo(
    () => contacts.filter(c => c.type === 'buyer' || c.type === 'both'),
    [contacts],
  )

  const selectedProperty = useMemo(
    () => properties.find(p => p.id === selectedPropertyId),
    [properties, selectedPropertyId],
  )

  const selectedContact = useMemo(
    () => buyers.find(c => c.id === selectedContactId),
    [buyers, selectedContactId],
  )

  const contactsMap = useMemo(
    () => new Map(contacts.map(c => [c.id, c])),
    [contacts],
  )

  const propertiesMap = useMemo(
    () => new Map(properties.map(p => [p.id, p])),
    [properties],
  )

  const runMatching = useCallback((propId: string, contId: string, currentMode: 'property' | 'buyer') => {
    setLoading(true)
    setHasSearched(true)
    // Small delay for animation feel
    setTimeout(() => {
      if (currentMode === 'property') {
        const prop = properties.find(p => p.id === propId)
        if (prop) {
          setResults(matchPropertyToBuyers(prop, contacts))
        }
      } else {
        const buyer = buyers.find(c => c.id === contId)
        if (buyer) {
          setResults(matchBuyerToProperties(buyer, properties))
        }
      }
      setLoading(false)
    }, 600)
  }, [properties, contacts, buyers])

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id)
    setDropdownOpen(false)
    setSearchTerm('')
    runMatching(id, '', 'property')
  }

  const handleSelectContact = (id: string) => {
    setSelectedContactId(id)
    setDropdownOpen(false)
    setSearchTerm('')
    runMatching('', id, 'buyer')
  }

  const handleToggleMode = (newMode: 'property' | 'buyer') => {
    if (newMode === mode) return
    setMode(newMode)
    setResults([])
    setHasSearched(false)
    setSelectedPropertyId('')
    setSelectedContactId('')
    setSearchTerm('')
    setDropdownOpen(false)
  }

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredBuyers = buyers.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const borderColor = (score: number) =>
    score >= 70 ? 'border-l-green-500' : score >= 40 ? 'border-l-amber-500' : 'border-l-red-500'

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <div className="relative">
            <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
            <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            Matching IA
          </h1>
          <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          L&apos;intelligence artificielle trouve les meilleures correspondances acheteurs/biens
        </p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="card p-5 space-y-5">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Sélectionner
            </h2>

            {/* Toggle */}
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
              <button
                onClick={() => handleToggleMode('property')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mode === 'property'
                    ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Partir d&apos;un bien
              </button>
              <button
                onClick={() => handleToggleMode('buyer')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mode === 'buyer'
                    ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <User className="w-4 h-4" />
                Partir d&apos;un acheteur
              </button>
            </div>

            {/* Dropdown search */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-400 transition-colors"
              >
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {mode === 'property'
                    ? (selectedProperty ? selectedProperty.title : 'Choisir un bien...')
                    : (selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : 'Choisir un acheteur...')}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-hidden">
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-48">
                    {mode === 'property' ? (
                      filteredProperties.length > 0 ? filteredProperties.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProperty(p.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                        >
                          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{p.title}</p>
                            <p className="text-xs text-gray-500">{p.city} · {formatCurrency(p.price)}</p>
                          </div>
                          {p.id === selectedPropertyId && <Check className="w-4 h-4 text-purple-500 ml-auto flex-shrink-0" />}
                        </button>
                      )) : (
                        <p className="p-3 text-sm text-gray-500 text-center">Aucun bien trouvé</p>
                      )
                    ) : (
                      filteredBuyers.length > 0 ? filteredBuyers.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectContact(c.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                        >
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{c.firstName} {c.lastName}</p>
                            <p className="text-xs text-gray-500">{c.budget ? formatCurrency(c.budget) : 'Pas de budget'}</p>
                          </div>
                          {c.id === selectedContactId && <Check className="w-4 h-4 text-purple-500 ml-auto flex-shrink-0" />}
                        </button>
                      )) : (
                        <p className="p-3 text-sm text-gray-500 text-center">Aucun acheteur trouvé</p>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected item card */}
            {mode === 'property' && selectedProperty && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-sm">{selectedProperty.title}</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p>📍 {selectedProperty.city} ({selectedProperty.zipCode})</p>
                  <p>💰 {formatCurrency(selectedProperty.price)}</p>
                  <p>📐 {selectedProperty.surface} m² · {selectedProperty.rooms} pièces · {selectedProperty.bedrooms} ch.</p>
                  <p className="capitalize">🏠 {selectedProperty.type}</p>
                </div>
              </div>
            )}

            {mode === 'buyer' && selectedContact && (
              <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-sm">{selectedContact.firstName} {selectedContact.lastName}</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p>💰 Budget : {selectedContact.budget ? formatCurrency(selectedContact.budget) : 'Non défini'}</p>
                  <p>📍 {selectedContact.preferredLocations.length > 0 ? selectedContact.preferredLocations.join(', ') : 'Pas de préférence de lieu'}</p>
                  <p>🏠 {selectedContact.preferredTypes.length > 0 ? selectedContact.preferredTypes.join(', ') : 'Tous types'}</p>
                  <p>📧 {selectedContact.email}</p>
                </div>
              </div>
            )}

            {/* Arrow hint */}
            {(selectedProperty || selectedContact) && (
              <div className="flex items-center justify-center text-purple-400 gap-2 pt-2">
                <ArrowRight className="w-5 h-5 animate-pulse" />
                <span className="text-sm">Voir les résultats</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-2/3">
          <div className="card p-5 min-h-[400px]">
            <h2 className="font-semibold text-lg flex items-center gap-2 mb-5">
              <Target className="w-5 h-5 text-purple-500" />
              Résultats du matching
            </h2>

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                  <Sparkles className="w-5 h-5 text-amber-400 absolute -top-2 -right-2 animate-ping" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                  Analyse en cours...
                </p>
              </div>
            )}

            {/* Empty default state */}
            {!loading && !hasSearched && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="relative">
                  <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">
                  Sélectionnez un bien ou un acheteur pour lancer le matching IA
                </p>
              </div>
            )}

            {/* No results */}
            {!loading && hasSearched && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Aucun match trouvé. Essayez avec d&apos;autres critères.
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && hasSearched && results.length > 0 && (
              <>
                <MatchSummary results={results} />

                <div className="space-y-4">
                  {results.map((match, index) => {
                    const contact = contactsMap.get(match.contactId)
                    const property = propertiesMap.get(match.propertyId)

                    return (
                      <div
                        key={match.id}
                        className={`card border-l-4 ${borderColor(match.score)} p-4 flex flex-col sm:flex-row gap-4 items-start opacity-0 animate-[fadeInUp_0.4s_ease-out_forwards]`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <ScoreCircle score={match.score} />

                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Entity name & details */}
                          {mode === 'property' && contact && (
                            <div>
                              <p className="font-semibold">{contact.firstName} {contact.lastName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {contact.budget ? `Budget : ${formatCurrency(contact.budget)}` : ''} · {contact.preferredLocations.join(', ') || 'Toutes villes'}
                              </p>
                            </div>
                          )}
                          {mode === 'buyer' && property && (
                            <div>
                              <p className="font-semibold">{property.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {property.city} · {formatCurrency(property.price)} · {property.surface} m²
                              </p>
                            </div>
                          )}

                          {/* Reasons */}
                          {match.reasons.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                                Raisons du match
                              </p>
                              <ul className="space-y-1">
                                {match.reasons.map((reason, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <button
                            title="Contacter"
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            title="Créer un deal"
                            className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            title="Voir la fiche"
                            className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-500 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Keyframes for staggered animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
