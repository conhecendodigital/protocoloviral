'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { ExecutionMap } from '@/components/shared/ExecutionMap'
import { OnboardingModal } from '@/components/shared/OnboardingModal'
import { createClient } from '@/lib/supabase/client'
import { Brain, Flame, ArrowRight } from 'lucide-react'
import { FormatosFeed } from '@/components/formatos/FormatosFeed'

// Supabase client created outside component (not in useMemo)
const supabase = createClient()

export default function HomePage() {
  const { profile, loading, userId, updateField, fetchProfile, getCompletionPercent } = useProfile()
  const completion = getCompletionPercent()
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)
  const [startedOnboarding, setStartedOnboarding] = useState(false)

  useEffect(() => {
    if (!loading && userId && completion === 0 && !onboardingDismissed) {
      setStartedOnboarding(prev => {
        if (!prev) return true
        return prev
      })
    }
  }, [loading, userId, completion, onboardingDismissed])

  const showOnboarding = startedOnboarding && !onboardingDismissed

  const handleConfirmMetodo = useCallback(async () => {
    if (!userId) return
    await supabase
      .from('profiles')
      .update({ metodo_concluido: true })
      .eq('id', userId)
    fetchProfile()
  }, [userId, fetchProfile])

  const getFirstName = () => {
    if (profile?.nome_completo) return profile.nome_completo.split(' ')[0]
    if (!profile?.email) return 'Mapeador'
    return profile.email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase())
  }

  return (
    <>
      {showOnboarding && userId && (
        <OnboardingModal
          userId={userId}
          updateField={updateField}
          onComplete={() => {
            setOnboardingDismissed(true)
            fetchProfile()
          }}
        />
      )}

      {/* Welcome Banner */}
      <section className="mb-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white">
            Olá,{' '}
            {loading ? (
              <span className="inline-flex gap-1 align-middle">
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                {getFirstName()}
              </span>
            )}!
          </h1>
          <p className="text-slate-600 dark:text-white/70 text-base sm:text-lg">
            {completion < 100
              ? 'Preencha seu perfil para a gente poder te ajudar melhor.'
              : 'Tudo pronto! Siga os passos abaixo para criar seu conteúdo.'}
          </p>
        </motion.div>
      </section>

      {/* Execution Map */}
      {!loading && (
        <ExecutionMap
          completion={completion}
          isRecurring={!!profile?.onboarding_completed}
          metodoConcluido={!!profile?.metodo_concluido}
          onConfirmMetodo={handleConfirmMetodo}
        />
      )}

      {/* Premium CTA Banner */}
      {!loading && completion === 100 && (
        <motion.section
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-10 w-full relative group cursor-pointer"
        >
          <Link href="/roteirista" className="block relative overflow-hidden rounded-[2rem] p-8 sm:p-12 transition-all duration-500 shadow-2xl hover:shadow-[#0ea5e9]/40 border border-[#0ea5e9]/30">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#060a12] via-[#0284c7] to-[#0ea5e9] opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Single decorative blur (reduced from 2× blur-[100px]) */}
            <div className="absolute -top-10 right-0 w-80 h-80 bg-white/5 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="inline-flex items-center gap-2 text-[11px] sm:text-[13px] font-black tracking-[0.2em] text-white/80 uppercase mb-3 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                  <Brain size={14} />
                  Escritório de IA
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg mb-2">
                  Acesse seus Agentes Premium
                </h2>
                <p className="text-white/80 font-medium text-sm sm:text-base max-w-lg">
                  Transforme conhecimento em conteúdo viral que atrai, retém e converte seguidores com o nosso Roteirista inteligente, 100% anti-alucinação.
                </p>
              </div>

              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-white blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                <div className="bg-white text-[#0ea5e9] px-8 py-4 sm:px-10 sm:py-5 rounded-full font-black text-lg sm:text-xl shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 relative z-10 w-full sm:w-auto">
                  Iniciar Agora
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </Link>
        </motion.section>
      )}

      {/* Feed de Formatos */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Flame size={28} className="text-orange-500" />
          <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Feed de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Formatos</span>
          </h3>
        </div>
        <FormatosFeed />
      </motion.section>
    </>
  )
}
