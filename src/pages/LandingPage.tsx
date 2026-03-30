import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Hexagon,
  Sparkles,
  Kanban,
  Zap,
  Star,
  ArrowRight,
  Check,
  ChevronRight,
  Users,
  Building2,
  Shield,
  BarChart3,
  Menu,
  X,
} from 'lucide-react'

/* ─────────────────────────── helpers ─────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const { ref, visible } = useInView()
  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </section>
  )
}

/* ─────────────────────────── data ────────────────────────────── */

const features = [
  {
    icon: Sparkles,
    title: 'Matching IA',
    description:
      "L'IA identifie automatiquement les acheteurs idéaux pour chaque bien.",
    color: 'from-brand-400/20 to-brand-500/5',
    iconColor: 'text-brand-400',
  },
  {
    icon: Kanban,
    title: 'Pipeline Visuel',
    description:
      "Suivez vos deals de la prospection à la signature en un coup d'œil.",
    color: 'from-blue-400/20 to-blue-500/5',
    iconColor: 'text-blue-400',
  },
  {
    icon: Zap,
    title: 'Automatisation',
    description:
      'Relances, tâches, notifications : tout fonctionne en pilote automatique.',
    color: 'from-emerald-400/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
]

const steps = [
  {
    number: '01',
    title: 'Ajoutez vos biens et contacts',
    description:
      'Importez votre base existante ou créez vos fiches en quelques clics. EstateFlow structure automatiquement vos données.',
    icon: Building2,
  },
  {
    number: '02',
    title: "L'IA matche et suggère des actions",
    description:
      "Notre algorithme croise budgets, localisations et préférences pour vous proposer les meilleures opportunités en temps réel.",
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Concluez plus de ventes',
    description:
      'Les relances automatiques et le pipeline visuel vous aident à ne rater aucune opportunité et à closer plus vite.',
    icon: BarChart3,
  },
]

const testimonials = [
  {
    name: 'Sophie Martin',
    role: 'Agent indépendant',
    location: 'Paris',
    quote:
      "EstateFlow m'a fait gagner 3 mandats en 1 mois. Le matching IA est bluffant.",
    avatar: 'SM',
  },
  {
    name: 'Thomas Dubois',
    role: "Directeur d'agence",
    location: 'Lyon',
    quote:
      "On a réduit notre temps de gestion de 60%. L'équipe ne peut plus s'en passer.",
    avatar: 'TD',
  },
  {
    name: 'Marie Lefebvre',
    role: 'Conseillère immobilière',
    location: 'Bordeaux',
    quote:
      "L'automatisation des relances a changé ma façon de travailler. Je ne rate plus aucun lead.",
    avatar: 'ML',
  },
]

const plans = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: '',
    description: 'Pour démarrer',
    popular: false,
    features: [
      '50 contacts',
      '20 biens',
      'Recherche',
      'Pipeline basique',
    ],
    cta: 'Commencer gratuitement',
  },
  {
    name: 'Pro',
    price: '49€',
    period: '/mois',
    description: 'Pour les agents ambitieux',
    popular: true,
    features: [
      'Contacts illimités',
      'Matching IA',
      'Automatisation',
      'Descriptions IA',
      'Support prioritaire',
    ],
    cta: 'Essayer Pro gratuitement',
  },
  {
    name: 'Agence',
    price: '99€',
    period: '/mois',
    description: 'Pour les équipes',
    popular: false,
    features: [
      'Multi-utilisateurs',
      'Tableau de bord équipe',
      'API',
      'Onboarding dédié',
    ],
    cta: 'Contacter les ventes',
  },
]

/* ─────────────────────────── page ────────────────────────────── */

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-gray-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 group">
              <Hexagon className="h-8 w-8 text-brand-400 transition-transform duration-300 group-hover:rotate-90" />
              <span className="text-xl font-bold tracking-tight">
                Estate<span className="text-brand-400">Flow</span>
              </span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#fonctionnalites" className="text-sm text-gray-400 hover:text-white transition-colors">
                Fonctionnalités
              </a>
              <a href="#tarifs" className="text-sm text-gray-400 hover:text-white transition-colors">
                Tarifs
              </a>
              <a href="#temoignages" className="text-sm text-gray-400 hover:text-white transition-colors">
                Témoignages
              </a>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 text-gray-950 text-sm font-semibold hover:bg-brand-400 transition-all duration-200 shadow-lg shadow-brand-500/20 hover:shadow-brand-400/30"
              >
                Essai gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-950/95 backdrop-blur-xl border-b border-white/5 animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <a href="#fonctionnalites" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">
                Fonctionnalités
              </a>
              <a href="#tarifs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">
                Tarifs
              </a>
              <a href="#temoignages" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">
                Témoignages
              </a>
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-full bg-brand-500 text-gray-950 font-semibold"
              >
                Essai gratuit
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <header className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Animated glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-[100px] animate-pulse-glow [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-400/5 rounded-full blur-[150px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-brand-500/20 bg-brand-500/5 text-brand-400 text-sm animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>Propulsé par l'intelligence artificielle</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-slide-up">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Concluez plus de ventes
            </span>
            <br />
            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500 bg-clip-text text-transparent">
              immobilières grâce à l'IA
            </span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-10 animate-slide-up [animation-delay:100ms]">
            Le CRM qui génère automatiquement des mandats, matche acheteurs et
            biens, et automatise vos relances.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up [animation-delay:200ms]">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-500 text-gray-950 font-semibold text-lg hover:bg-brand-400 transition-all duration-200 shadow-xl shadow-brand-500/25 hover:shadow-brand-400/30 hover:scale-[1.02]"
            >
              Démarrer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-sm"
            >
              Voir la démo
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Stats bar */}
          <div className="inline-flex flex-wrap justify-center items-center gap-6 sm:gap-10 px-8 py-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm animate-slide-up [animation-delay:300ms]">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-400" />
              <div>
                <p className="text-2xl font-bold text-white">847</p>
                <p className="text-xs text-gray-500">agents</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-400" />
              <div>
                <p className="text-2xl font-bold text-white">12 400</p>
                <p className="text-xs text-gray-500">biens gérés</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-400" />
              <div>
                <p className="text-2xl font-bold text-white">94%</p>
                <p className="text-xs text-gray-500">de satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Features ─── */}
      <Section id="fonctionnalites" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Fonctionnalités
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Tout ce qu'il vous faut pour performer
              </span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-gray-400 text-lg">
              Des outils puissants conçus spécifiquement pour les professionnels
              de l'immobilier.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:-translate-y-1"
              >
                {/* Gradient glow on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl bg-white/5 ${f.iconColor} mb-5`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── How It Works ─── */}
      <Section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Comment ça marche
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Simple comme 1, 2, 3
              </span>
            </h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-brand-500/0 via-brand-500/40 to-brand-500/0" />

            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                {/* Step circle */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
                  <step.icon className="h-6 w-6 text-brand-400" />
                </div>
                {/* Step number */}
                <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">
                  Étape {step.number}
                </p>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Social Proof ─── */}
      <Section id="temoignages" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Témoignages
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Ils nous font confiance
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-brand-400 fill-brand-400"
                    />
                  ))}
                </div>

                <blockquote className="text-gray-300 leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-500/10 text-brand-400 text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t.role}, {t.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Pricing ─── */}
      <Section id="tarifs" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Tarifs
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Un plan pour chaque ambition
              </span>
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-gray-400 text-lg">
              Commencez gratuitement, évoluez quand vous êtes prêt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? 'border-brand-500/40 bg-brand-500/5 shadow-xl shadow-brand-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-500 text-gray-950 text-xs font-bold uppercase tracking-wider">
                    Le plus populaire
                  </div>
                )}

                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {plan.name}
                </p>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-500">{plan.period}</span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mb-8">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-brand-400 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/app"
                  className={`block text-center py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                    plan.popular
                      ? 'bg-brand-500 text-gray-950 hover:bg-brand-400 shadow-lg shadow-brand-500/20'
                      : 'border border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Final CTA ─── */}
      <Section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative px-6 py-16 sm:px-16 sm:py-24 text-center">
              <Shield className="h-10 w-10 text-brand-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Prêt à transformer votre activité immobilière ?
                </span>
              </h2>
              <p className="max-w-xl mx-auto text-gray-400 text-lg mb-10">
                Rejoignez 847 agents qui gagnent du temps chaque jour.
              </p>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-brand-500 text-gray-950 font-semibold text-lg hover:bg-brand-400 transition-all duration-200 shadow-xl shadow-brand-500/25 hover:shadow-brand-400/30 hover:scale-[1.02]"
              >
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Hexagon className="h-6 w-6 text-brand-400" />
              <span className="text-lg font-bold">
                Estate<span className="text-brand-400">Flow</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">
                Mentions légales
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Confidentialité
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Contact
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} EstateFlow
            </p>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            Fait avec ❤️ pour les agents immobiliers
          </p>
        </div>
      </footer>
    </div>
  )
}
