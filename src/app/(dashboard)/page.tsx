'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { ExecutionMap } from '@/components/shared/ExecutionMap'
import { OnboardingModal } from '@/components/shared/OnboardingModal'
import { createClient } from '@/lib/supabase/client'
import { Flame } from 'lucide-react'
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
