import {
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Users,
  Shield,
  Mail,
  Phone,
  ChevronDown,
  Zap,
  Calendar,
  BarChart3,
  Lock,
  Trophy,
  CreditCard,
  Headphones,
  Building,
} from 'lucide-react'
import { useState } from 'react'

/* ── Data ─────────────────────────────────────────────────── */

const crmProducts = [
  {
    name: 'ImmoBase',
    price: '29€/mois',
    commission: '8€/mois récurrent',
    features: [true, true, false, false, false, false],
    rating: 3.2,
    tag: 'Basique',
  },
  {
    name: 'ProImmo CRM',
    price: '79€/mois',
    commission: '15€/mois récurrent',
    features: [true, true, true, true, false, false],
    rating: 3.8,
    tag: 'Standard',
  },
  {
    name: 'EstateFlow Pro',
    price: '49€/mois',
    commission: '25€/mois récurrent',
    features: [true, true, true, true, true, true],
    rating: 4.9,
    tag: 'Choix Expert',
  },
]

const featureLabels = [
  'Gestion des contacts',
  'Automatisation emails',
  'Planification visites',
  'Signatures électroniques',
  'Rapports analytics',
  'Intégration MLS',
]

const testimonials = [
  {
    name: 'Marc Dubois',
    role: 'Agent immobilier indépendant',
    content:
      "J'ai gagné 12h par semaine depuis que j'utilise EstateFlow. L'automatisation des suivis est incroyable.",
    avatar: 'MD',
  },
  {
    name: 'Sophie Martin',
    role: "Directrice d'agence",
    content:
      'Mon équipe de 8 agents a vu ses ventes augmenter de 34% en 6 mois. Le ROI est immédiat.',
    avatar: 'SM',
  },
  {
    name: 'Pierre Lefebvre',
    role: 'Consultant immobilier',
    content:
      'Après avoir testé 4 CRM différents, EstateFlow est de loin le plus complet et intuitif.',
    avatar: 'PL',
  },
]

const faqItems = [
  {
    question: 'Combien de temps dure la mise en place ?',
    answer:
      "Moins de 30 minutes. L'import de vos contacts existants se fait en un clic et nos templates sont prêts à l'emploi.",
  },
  {
    question: 'Puis-je annuler à tout moment ?',
    answer:
      'Absolument. Sans engagement, sans frais cachés. Vous gardez accès à vos données même après résiliation.',
  },
  {
    question: 'Est-ce compatible avec mon logiciel actuel ?',
    answer:
      "EstateFlow s'intègre avec 200+ outils : Gmail, Outlook, Google Calendar, DocuSign, et bien plus.",
  },
  {
    question: 'Quelle est la différence avec un CRM généraliste ?',
    answer:
      "EstateFlow est conçu EXCLUSIVEMENT pour l'immobilier. Chaque fonctionnalité répond à un besoin métier spécifique.",
  },
]

const expertFeatures = [
  {
    Icon: Zap,
    title: 'Automatisation intelligente',
    desc: "Les emails de suivi s'envoient automatiquement selon le comportement de vos leads",
  },
  {
    Icon: Calendar,
    title: 'Planification optimisée',
    desc: "L'IA suggère les créneaux de visite en fonction de vos déplacements",
  },
  {
    Icon: BarChart3,
    title: 'Analytics prédictifs',
    desc: "Identifiez vos leads chauds avant même qu'ils ne vous appellent",
  },
  {
    Icon: Lock,
    title: 'Sécurité bancaire',
    desc: 'Vos données client sont chiffrées avec le même niveau que les banques',
  },
]

/* ── Components ───────────────────────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="size-4 fill-amber-400 text-amber-400" />
      <span className="font-semibold">{rating}/5</span>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-white/5 transition-colors cursor-pointer"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown
          className={`size-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-muted-foreground text-sm">
          {answer}
        </div>
      )}
    </div>
  )
}

/* ── App ──────────────────────────────────────────────────── */

export default function App() {
  return (
    <div className="min-h-screen">
      {/* ─── Header / Nav ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--background))]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="size-6 text-amber-400" />
            <span className="font-bold text-lg">CRM Immo Pro</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#comparatif" className="hover:text-white transition-colors">
              Comparatif
            </a>
            <a href="#avertissement" className="hover:text-white transition-colors">
              Avertissement
            </a>
            <a href="#avis" className="hover:text-white transition-colors">
              Avis
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>
          <button className="bg-amber-500 text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-amber-400 transition-colors cursor-pointer">
            Essai Gratuit
          </button>
        </div>
      </header>

      <main className="pt-16">
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden py-24 px-4">
          {/* Decorative gradient blobs */}
          <div className="absolute -top-12 -left-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-4 py-1.5 text-sm">
              <Trophy className="size-4" />
              Comparatif 2024 mis à jour
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Les 3 meilleurs{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                CRM
              </span>{' '}
              pour agents
              <br />
              immobiliers indépendants
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Après 6 mois de tests approfondis, voici le comparatif honnête qui vous
              fera{' '}
              <strong className="text-white">gagner 10+ heures par semaine</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <a
                href="#comparatif"
                className="inline-flex items-center gap-2 bg-amber-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-amber-400 transition-colors"
              >
                Voir le comparatif
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#avertissement"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <AlertTriangle className="size-4" />
                Lire l'avertissement
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                Tests réalisés sur 6 mois
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4" />
                847 agents interrogés
              </div>
              <div className="flex items-center gap-2">
                <Shield className="size-4" />
                Sans sponsorisation
              </div>
            </div>
          </div>

          {/* Scroll down indicator */}
          <div className="flex justify-center mt-16">
            <ChevronDown className="size-6 text-muted-foreground animate-bounce" />
          </div>
        </section>

        {/* ─── Comparison Table ─── */}
        <section id="comparatif" className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Le comparatif{' '}
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  sans langue de bois
                </span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nous avons testé chaque solution pendant 2 mois avec une équipe de 5
                agents immobiliers.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-muted-foreground font-medium">
                      Fonctionnalité
                    </th>
                    {crmProducts.map((p) => (
                      <th key={p.name} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-white">{p.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              p.tag === 'Choix Expert'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-white/10 text-muted-foreground border border-white/10'
                            }`}
                          >
                            {p.tag}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Price row */}
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-muted-foreground">Prix mensuel</td>
                    {crmProducts.map((p) => (
                      <td
                        key={p.name}
                        className={`p-4 text-center font-semibold ${
                          p.tag === 'Choix Expert' ? 'text-amber-400' : ''
                        }`}
                      >
                        {p.price}
                      </td>
                    ))}
                  </tr>

                  {/* Rating row */}
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-muted-foreground">Note utilisateurs</td>
                    {crmProducts.map((p) => (
                      <td key={p.name} className="p-4">
                        <div className="flex justify-center">
                          <StarRating rating={p.rating} />
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Feature rows */}
                  {featureLabels.map((label, i) => (
                    <tr key={label} className="border-b border-white/5">
                      <td className="p-4 text-muted-foreground">{label}</td>
                      {crmProducts.map((p) => (
                        <td key={p.name} className="p-4 text-center">
                          {p.features[i] ? (
                            <CheckCircle className="size-5 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="size-5 text-red-400 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Commission row */}
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-muted-foreground">Commission affilié</td>
                    {crmProducts.map((p) => (
                      <td key={p.name} className="p-4 text-center text-sm text-muted-foreground">
                        {p.commission}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-8">
              <button className="inline-flex items-center gap-2 bg-amber-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer">
                Découvrir EstateFlow Pro
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ─── Warning Section ─── */}
        <section id="avertissement" className="py-12 px-4">
          <div className="max-w-4xl mx-auto bg-red-950/50 border border-red-500/30 rounded-2xl p-8 glow-red">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="size-6 text-red-400 shrink-0 mt-0.5" />
              <h3 className="text-lg font-bold text-red-400">
                ⚠️ ATTENTION : Ce que les autres comparatifs ne vous disent pas
              </h3>
            </div>
            <div className="ml-9 space-y-4">
              <p className="text-muted-foreground">
                Après avoir analysé 47 comparatifs de CRM immobiliers, voici ce que
                nous avons découvert :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <XCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    <strong className="text-white">ImmoBase</strong> facture des frais
                    de mise en setup cachés de 199€ après le 14ème jour d'essai.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    <strong className="text-white">ProImmo CRM</strong> nécessite 3
                    jours de formation obligatoire (facturée 450€) pour utiliser
                    toutes les fonctionnalités.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    La plupart des &quot;comparatifs&quot; que vous lisez sont{' '}
                    <strong className="text-white">
                      sponsorisés par les éditeurs
                    </strong>{' '}
                    - ils ne testent pas réellement les logiciels.
                  </span>
                </li>
              </ul>
              <p className="text-muted-foreground italic">
                Notre méthode : 6 mois de tests réels avec de vrais agents. Aucun
                sponsor. Seulement la vérité.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Expert Choice / Features Section ─── */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
            {/* Left column - text */}
            <div>
              <div className="inline-flex items-center gap-2 mb-4 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-4 py-1.5 text-sm">
                <Trophy className="size-4" />
                Choix de l'expert 2024
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Pourquoi{' '}
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  EstateFlow Pro
                </span>{' '}
                domine le marché
              </h2>
              <p className="text-muted-foreground mb-8">
                Le seul CRM conçu par des agents immobiliers, pour des agents
                immobiliers. Chaque fonctionnalité répond à un besoin réel du
                terrain.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {expertFeatures.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                      <f.Icon className="size-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{f.title}</h4>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button className="inline-flex items-center gap-2 bg-amber-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer">
                  Essayer gratuitement 14 jours
                  <ArrowRight className="size-4" />
                </button>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Shield className="size-4" />
                  Sans carte bancaire
                </p>
              </div>
            </div>

            {/* Right column - dashboard mockup */}
            <div className="relative">
              <div className="bg-glass rounded-xl border border-white/10 overflow-hidden p-6">
                {/* Dashboard header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Building className="size-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">EstateFlow Pro</h3>
                      <p className="text-xs text-muted-foreground">Dashboard</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    En ligne
                  </span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { value: '1,247', label: 'Contacts', change: '+12%' },
                    { value: '34', label: 'Visites', change: '+8%' },
                    { value: '7', label: 'Ventes', change: '+25%' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white/5 rounded-lg p-3 text-center"
                    >
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-xs text-emerald-400">{s.change}</p>
                    </div>
                  ))}
                </div>

                {/* Activity feed */}
                <div>
                  <p className="text-sm font-medium mb-3">Activité récente</p>
                  {[
                    { label: 'Nouveau lead', time: '2 min', color: 'bg-blue-400' },
                    {
                      label: 'Visite confirmée',
                      time: '15 min',
                      color: 'bg-amber-400',
                    },
                    {
                      label: 'Contrat signé',
                      time: '1h',
                      color: 'bg-emerald-400',
                    },
                  ].map((a) => (
                    <div
                      key={a.label}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`size-2 rounded-full ${a.color}`} />
                        <span className="text-sm">{a.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg px-4 py-2 text-sm font-medium">
                Économisez 12h/semaine
              </div>
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section id="avis" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Ce que disent les{' '}
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  vrais utilisateurs
                </span>
              </h2>
              <p className="text-muted-foreground">
                847 agents immobiliers ont adopté EstateFlow Pro. Voici leurs retours
                d'expérience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="bg-glass rounded-xl border border-white/10 p-6 hover-lift"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    &quot;{t.content}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '847', label: 'Agents actifs' },
                { value: '34%', label: 'Augmentation ventes' },
                { value: '12h', label: 'Gagnées/semaine' },
                { value: '4.9/5', label: 'Note moyenne' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-glass rounded-xl border border-white/5 p-6 text-center"
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                    {s.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Questions{' '}
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  fréquentes
                </span>
              </h2>
              <p className="text-muted-foreground">
                Tout ce que vous devez savoir avant de commencer.
              </p>
            </div>
            <div className="space-y-2">
              {faqItems.map((item) => (
                <FAQItem key={item.question} {...item} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Section ─── */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-4 py-1.5 text-sm">
              <CheckCircle className="size-4" />
              14 jours d'essai gratuit
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prêt à{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                doubler votre productivité
              </span>{' '}
              ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Rejoignez les 847 agents qui ont déjà transformé leur business.
              Commencez gratuitement, sans engagement.
            </p>
            <button className="inline-flex items-center gap-2 bg-amber-500 text-black font-semibold px-8 py-4 rounded-lg text-lg hover:bg-amber-400 transition-colors mb-6 cursor-pointer">
              Démarrer mon essai gratuit
              <ArrowRight className="size-5" />
            </button>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4" />
                Sans carte bancaire
              </div>
              <div className="flex items-center gap-2">
                <Shield className="size-4" />
                Annulation instantanée
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="size-4" />
                Support 24/7
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building className="size-5 text-amber-400" />
                <span className="font-bold">CRM Immo Pro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Le comparatif honnête des CRM pour agents immobiliers indépendants.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold mb-3">Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#comparatif" className="hover:text-white transition-colors">
                    Comparatif
                  </a>
                </li>
                <li>
                  <a href="#avertissement" className="hover:text-white transition-colors">
                    Avertissement
                  </a>
                </li>
                <li>
                  <a href="#avis" className="hover:text-white transition-colors">
                    Avis
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-3">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Mentions légales
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    CGU
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="size-4" />
                  contact@crmmopro.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4" />
                  01 23 45 67 89
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
            <p>
              © 2024 CRM Immo Pro. Ce site contient des liens d'affiliation.
            </p>
            <p>
              Commission : 25€/mois récurrent par utilisateur EstateFlow Pro inscrit
              via nos liens.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
