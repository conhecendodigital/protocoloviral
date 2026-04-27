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
      <section className="mb-8 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
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
        </div>
      </section>

      {/* Execution Map */}
      {loading ? (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
            <div className="h-7 w-48 bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
          </div>
          <div className="h-5 w-3/4 max-w-md bg-slate-200 dark:bg-white/10 rounded-md mb-6 ml-9 animate-pulse" />
          <div className="relative rounded-3xl p-6 sm:p-8 sm:pr-10 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 sm:items-center relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-32 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
                <div className="h-8 w-64 bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
                <div className="h-5 w-full max-w-lg bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
              </div>
              <div className="shrink-0 pt-4 sm:pt-0 sm:pl-10">
                <div className="w-40 h-12 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <ExecutionMap
          completion={completion}
          isRecurring={!!profile?.onboarding_completed}
          metodoConcluido={!!profile?.metodo_concluido}
          onConfirmMetodo={handleConfirmMetodo}
        />
      )}



      {/* Feed de Formatos */}
      <section className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
        <div className="flex items-center gap-3 mb-6">
          <Flame size={28} className="text-orange-500" />
          <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Feed de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Formatos</span>
          </h3>
        </div>
        <FormatosFeed />
      </section>
    </>
  )
}
