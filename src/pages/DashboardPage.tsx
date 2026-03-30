import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Building2,
  Handshake,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Activity,
  ChevronRight,
  Flame,
  Target,
  Zap,
  BarChart3,
} from 'lucide-react'
import { getContacts, getProperties, getDeals, getTasks } from '@/lib/storage'
import type { Contact, Property, Deal, Task } from '@/types'

// ─── Helpers ───────────────────────────────────────────────────
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function todayFrench(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}

// ─── Pipeline stage labels ─────────────────────────────────────
const PIPELINE_STAGES: { key: Deal['status']; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: 'bg-blue-500' },
  { key: 'viewing', label: 'Visite', color: 'bg-indigo-500' },
  { key: 'offer', label: 'Offre', color: 'bg-amber-500' },
  { key: 'negotiation', label: 'Négociation', color: 'bg-orange-500' },
  { key: 'closing', label: 'Closing', color: 'bg-emerald-500' },
]

// ─── Component ─────────────────────────────────────────────────
export function DashboardPage() {
  const [data] = useState(() => ({
    contacts: getContacts(),
    properties: getProperties(),
    deals: getDeals(),
    tasks: getTasks(),
  }))

  const { contacts, properties, deals, tasks } = data

  // ── Derived stats ──────────────────────────────────────────
  const activeContacts = contacts.filter(
    (c) => c.status === 'active' || c.status === 'new' || c.status === 'negotiating',
  )
  const availableProperties = properties.filter(
    (p) => p.status === 'available' || p.status === 'under_offer',
  )
  const activeDeals = deals.filter(
    (d) => !['won', 'lost'].includes(d.status),
  )
  const totalDealValue = activeDeals.reduce((s, d) => s + d.value, 0)
  const wonDeals = deals.filter((d) => d.status === 'won')
  const conversionRate =
    deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100 * 10) / 10 : 0

  // Pipeline counts
  const pipelineCounts = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: deals.filter((d) => d.status === stage.key).length,
  }))
  const maxPipelineCount = Math.max(...pipelineCounts.map((s) => s.count), 1)

  // Hot leads – top 3 contacts by score
  const hotLeads = [...contacts].sort((a, b) => b.score - a.score).slice(0, 3)

  // Recent activity – combine entities sorted by updatedAt/createdAt
  const recentActivities = buildRecentActivities(contacts, properties, deals, tasks)

  // ── AI Suggestions ─────────────────────────────────────────
  const parisProperty = properties.find((p) => p.city.toLowerCase().includes('paris'))
  const staleContact = [...contacts]
    .filter((c) => c.status === 'active')
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())[0]

  const suggestions = [
    {
      icon: <Target className="h-4 w-4 shrink-0" />,
      emoji: '🎯',
      text: `3 acheteurs correspondent à votre nouveau bien${parisProperty ? ` à ${parisProperty.city}` : ''}`,
      link: '/app/matching',
    },
    ...(staleContact
      ? [
          {
            icon: <Flame className="h-4 w-4 shrink-0" />,
            emoji: '🔥',
            text: `Lead chaud : ${staleContact.firstName} ${staleContact.lastName} n'a pas été recontacté(e) depuis 5 jours`,
            link: '/app/contacts',
          },
        ]
      : []),
    {
      icon: <TrendingUp className="h-4 w-4 shrink-0" />,
      emoji: '📈',
      text: 'Votre taux de conversion a augmenté de 12% ce mois',
      link: '',
    },
    {
      icon: <Zap className="h-4 w-4 shrink-0" />,
      emoji: '⚡',
      text: 'Relance automatique envoyée à 4 contacts',
      link: '',
    },
  ]

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="page-enter space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bonjour 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 capitalize">
          {todayFrench()}
        </p>
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-500" />}
          label="Contacts actifs"
          value={activeContacts.length.toString()}
          change={`+${contacts.filter((c) => c.status === 'new').length} nouveaux`}
          positive
        />
        <StatCard
          icon={<Building2 className="h-5 w-5 text-emerald-500" />}
          label="Biens en portefeuille"
          value={availableProperties.length.toString()}
          change={`${properties.length} au total`}
        />
        <StatCard
          icon={<Handshake className="h-5 w-5 text-amber-500" />}
          label="Deals en cours"
          value={activeDeals.length.toString()}
          change={formatCurrency(totalDealValue)}
          positive
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
          label="Taux de conversion"
          value={`${conversionRate}%`}
          change="+12% ce mois"
          positive
        />
      </div>

      {/* ── Two-column layout ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column – 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Suggestions */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-5 pb-3">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Suggestions IA
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {suggestions.map((s, i) => (
                <SuggestionRow key={i} suggestion={s} />
              ))}
            </div>
          </div>

          {/* Pipeline mini-overview */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Pipeline
                </h2>
              </div>
              <Link
                to="/app/deals"
                className="text-sm text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                Voir le pipeline
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {pipelineCounts.map((stage) => (
                <div key={stage.key} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-600 dark:text-gray-400 shrink-0">
                    {stage.label}
                  </span>
                  <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{
                        width: `${Math.max((stage.count / maxPipelineCount) * 100, stage.count > 0 ? 12 : 0)}%`,
                      }}
                    >
                      {stage.count > 0 && (
                        <span className="text-xs font-medium text-white">
                          {stage.count}
                        </span>
                      )}
                    </div>
                  </div>
                  {stage.count === 0 && (
                    <span className="text-xs text-gray-400">0</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column – 1/3 */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Activité récente
              </h2>
            </div>
            <div className="space-y-4">
              {recentActivities.length === 0 && (
                <p className="text-sm text-gray-400">Aucune activité récente</p>
              )}
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-gray-100 dark:bg-gray-800 p-1.5">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {a.text}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Leads */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Leads chauds
              </h2>
            </div>
            <div className="space-y-3">
              {hotLeads.length === 0 && (
                <p className="text-sm text-gray-400">Aucun lead</p>
              )}
              {hotLeads.map((lead) => (
                <Link
                  key={lead.id}
                  to="/app/contacts"
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {lead.firstName[0]}
                    {lead.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {relativeTime(lead.updatedAt)}
                    </p>
                  </div>
                  <ScoreBadge score={lead.score} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ReactNode
  label: string
  value: string
  change?: string
  positive?: boolean
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </span>
      {change && (
        <span
          className={`text-xs ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}
        >
          {change}
        </span>
      )}
    </div>
  )
}

function SuggestionRow({
  suggestion,
}: {
  suggestion: { emoji: string; text: string; link: string }
}) {
  const inner = (
    <div className="flex items-center gap-3 px-5 py-3.5 border-l-4 border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer group">
      <span className="text-lg leading-none">{suggestion.emoji}</span>
      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
        {suggestion.text}
      </span>
      <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-amber-500 transition-colors shrink-0" />
    </div>
  )

  if (suggestion.link) {
    return <Link to={suggestion.link}>{inner}</Link>
  }
  return inner
}

function ScoreBadge({ score }: { score: number }) {
  let cls = 'score-low'
  if (score >= 70) cls = 'score-high'
  else if (score >= 40) cls = 'score-medium'

  return (
    <span
      className={`${cls} inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full`}
    >
      <Star className="h-3 w-3" />
      {score}
    </span>
  )
}

// ─── Build recent activities from data ─────────────────────────
interface ActivityItem {
  icon: React.ReactNode
  text: string
  time: string
  date: Date
}

function buildRecentActivities(
  contacts: Contact[],
  properties: Property[],
  deals: Deal[],
  tasks: Task[],
): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const c of contacts) {
    items.push({
      icon: <Users className="h-3.5 w-3.5 text-blue-500" />,
      text: `Nouveau contact : ${c.firstName} ${c.lastName}`,
      time: relativeTime(c.createdAt),
      date: new Date(c.createdAt),
    })
  }

  for (const p of properties) {
    items.push({
      icon: <Building2 className="h-3.5 w-3.5 text-emerald-500" />,
      text: `Bien mis à jour : ${p.title}`,
      time: relativeTime(p.updatedAt),
      date: new Date(p.updatedAt),
    })
  }

  for (const d of deals) {
    const stageLabel =
      PIPELINE_STAGES.find((s) => s.key === d.status)?.label ?? d.status
    items.push({
      icon: <Handshake className="h-3.5 w-3.5 text-amber-500" />,
      text: `Deal « ${d.title} » passé en ${stageLabel}`,
      time: relativeTime(d.updatedAt),
      date: new Date(d.updatedAt),
    })
  }

  for (const t of tasks) {
    items.push({
      icon: <Clock className="h-3.5 w-3.5 text-purple-500" />,
      text: `Tâche : ${t.title}`,
      time: relativeTime(t.createdAt),
      date: new Date(t.createdAt),
    })
  }

  items.sort((a, b) => b.date.getTime() - a.date.getTime())
  return items.slice(0, 5)
}
