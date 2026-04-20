'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { ExecutionMap } from '@/components/shared/ExecutionMap'
import { OnboardingModal } from '@/components/shared/OnboardingModal'
import { createClient } from '@/lib/supabase/client'
import { FormatosFeed } from '@/components/formatos/FormatosFeed'
import {
  Anchor, ArrowRight, Bot, Clapperboard, FileEdit,
  Flame, Sparkles, TrendingUp, Video, Zap,
} from 'lucide-react'

const supabase = createClient()

/* ── Stats ── */
const STATS = [
  { value: '1.400+', label: 'Roteiros gerados' },
  { value: '430+',   label: 'Vídeos analisados' },
  { value: '100+',   label: 'Ganchos virais' },
]

/* ── Ferramentas rápidas ── */
const TOOLS = [
  {
    icon: FileEdit,
    label: 'Roteirista',
    desc: 'Gere roteiros completos com IA',
    href: '/roteirista',
    color: '#8b5cf6',
    badge: 'Mais usado',
  },
  {
    icon: Clapperboard,
    label: 'Formatos',
    desc: 'Escolha o formato ideal para seu conteúdo',
    href: '/formatos',
    color: '#0ea5e9',
    badge: 'HOT',
  },
  {
    icon: Anchor,
    label: 'Ganchos Virais',
    desc: '100 templates para prender a atenção',
    href: '/ganchos',
    color: '#06b6d4',
    badge: '100',
  },
  {
    icon: Bot,
    label: 'Escritório de IA',
    desc: 'Agentes especializados em conteúdo',
    href: '/agentes',
    color: '#10b981',
    badge: 'IA',
  },
]

/* ── Como funciona ── */
const STEPS = [
  {
    icon: Video,
    title: 'Analise o que funciona',
    desc: 'Cole o link de um Reels ou TikTok viral e deixe a IA dissecar a estrutura.',
    color: '#0ea5e9',
  },
  {
    icon: FileEdit,
    title: 'Gere seu roteiro',
    desc: 'A IA cria ganchos, corpo e CTA baseado no que já foi validado pelo mercado.',
    color: '#8b5cf6',
  },
  {
    icon: TrendingUp,
    title: 'Poste e cresça',
    desc: 'Publique com a sua voz, no seu estilo. Conteúdo que converte, todo dia.',
    color: '#10b981',
  },
]

export default function HomePage() {
  const { profile, loading, userId, updateField, fetchProfile, getCompletionPercent } = useProfile()
  const completion = getCompletionPercent()
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)
  const [startedOnboarding, setStartedOnboarding] = useState(false)

  useEffect(() => {
    if (!loading && userId && completion === 0 && !onboardingDismissed) {
      setStartedOnboarding(prev => { if (!prev) return true; return prev })
    }
  }, [loading, userId, completion, onboardingDismissed])

  const showOnboarding = startedOnboarding && !onboardingDismissed

  const handleConfirmMetodo = useCallback(async () => {
    if (!userId) return
    await supabase.from('profiles').update({ metodo_concluido: true }).eq('id', userId)
    fetchProfile()
  }, [userId, fetchProfile])

  const getFirstName = () => {
    if (profile?.nome_completo) return profile.nome_completo.split(' ')[0]
    if (!profile?.email) return 'Criador'
    return profile.email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase())
  }

  return (
    <>
      {showOnboarding && userId && (
        <OnboardingModal
          userId={userId}
          updateField={updateField}
          onComplete={() => { setOnboardingDismissed(true); fetchProfile() }}
        />
      )}

      {/* ── HERO ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 relative"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 mb-5">
          <Sparkles size={13} className="text-[#0ea5e9]" />
          <span className="text-xs font-bold text-[#0ea5e9] tracking-wide">Protocolo Viral — IA para criadores</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05] text-slate-900 dark:text-white mb-4">
          {loading ? (
            <span className="inline-flex gap-1.5 items-center">
              <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          ) : (
            <>
              Olá,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                {getFirstName()}
              </span>
              .
            </>
          )}
          <br />
          <span className="text-slate-500 dark:text-white/40 text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 block">
            {completion < 100
              ? 'Complete seu perfil para começar.'
              : 'O que vamos criar hoje?'}
          </span>
        </h1>

        {/* Stats rápidas */}
        <div className="flex flex-wrap gap-4 sm:gap-8 mt-6">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{s.value}</span>
              <span className="text-xs text-slate-500 dark:text-white/40 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── MAPA DE EXECUÇÃO ── */}
      {!loading && (
        <ExecutionMap
          completion={completion}
          isRecurring={!!profile?.onboarding_completed}
          metodoConcluido={!!profile?.metodo_concluido}
          onConfirmMetodo={handleConfirmMetodo}
        />
      )}

      {/* ── FERRAMENTAS RÁPIDAS ── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-12"
      >
        <div className="flex items-center gap-2 mb-5">
          <Zap size={20} className="text-amber-400" />
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">
            Acesso Rápido
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon
            return (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
              >
                <Link
                  href={tool.href}
                  className="glass-card rounded-2xl p-4 flex flex-col gap-3 hover:border-slate-300 dark:hover:border-white/15 hover-physics group block h-full"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${tool.color}18`, color: tool.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${tool.color}18`, color: tool.color }}
                    >
                      {tool.badge}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{tool.label}</p>
                    <p className="text-xs text-slate-500 dark:text-white/40 leading-snug">{tool.desc}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: tool.color }}>
                    Abrir <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* ── COMO FUNCIONA ── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#0ea5e9]/20 relative overflow-hidden">
          {/* Glow sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0ea5e9]/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-[#0ea5e9]" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Como funciona
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2"
                      style={{ borderColor: `${step.color}40`, color: step.color, backgroundColor: `${step.color}12` }}
                    >
                      {i + 1}
                    </div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}12`, color: step.color }}
                    >
                      <Icon size={16} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{step.title}</p>
                    <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="hidden sm:block absolute top-[52px]" style={{ left: `${(i + 1) * 33.33}%`, transform: 'translateX(-50%)' }}>
                      <ArrowRight size={16} className="text-slate-300 dark:text-white/20" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ── FEED DE FORMATOS ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Formatos em Alta
            </h2>
          </div>
          <Link
            href="/formatos"
            className="text-xs font-bold text-[#0ea5e9] hover:text-cyan-400 flex items-center gap-1 transition-colors"
          >
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>
        <FormatosFeed />
      </motion.section>
    </>
  )
}
