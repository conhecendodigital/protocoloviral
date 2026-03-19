'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PROFILE_FIELDS } from '@/types/profile'
import { createClient } from '@/lib/supabase/client'

interface OnboardingModalProps {
  userId: string
  onComplete: () => void
  updateField: (field: string, value: string) => void
}

const SECTION_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  sobre: { icon: 'person', label: 'Sobre Você', color: '#0ea5e9' },
  publico: { icon: 'groups', label: 'Seu Público', color: '#8b5cf6' },
  objetivos: { icon: 'rocket_launch', label: 'Seus Objetivos', color: '#10b981' },
}

export function OnboardingModal({ userId, onComplete, updateField }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [isCompleting, setIsCompleting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const supabase = useMemo(() => createClient(), [])
  const totalSteps = PROFILE_FIELDS.length
  const currentField = PROFILE_FIELDS[currentStep]
  const progress = ((currentStep + 1) / totalSteps) * 100

  const currentSection = currentField ? SECTION_LABELS[currentField.section] : null

  const handleAnswer = useCallback((value: string) => {
    if (!currentField) return
    setAnswers(prev => ({ ...prev, [currentField.id]: value }))
  }, [currentField])

  const handleNext = useCallback(async () => {
    // Save current answer
    const value = answers[currentField.id] || ''
    if (value.trim()) {
      updateField(currentField.id, value)
    }

    if (currentStep < totalSteps - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    } else {
      // Last step — complete onboarding
      setIsCompleting(true)
      
      // Save the last field if filled
      if (value.trim()) {
        updateField(currentField.id, value)
      }

      // Mark onboarding as completed
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId)

      setShowSuccess(true)
      setTimeout(() => {
        onComplete()
      }, 2500)
    }
  }, [currentStep, totalSteps, currentField, answers, updateField, userId, supabase, onComplete])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(async () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    } else {
      setIsCompleting(true)
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId)
      setShowSuccess(true)
      setTimeout(() => {
        onComplete()
      }, 2500)
    }
  }, [currentStep, totalSteps, supabase, userId, onComplete])

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  // Success screen
  if (showSuccess) {
    return (
      <div className="onboarding-overlay">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="size-24 rounded-full bg-gradient-to-br from-emerald-400 to-[#0ea5e9] flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(16,185,129,0.4)]"
          >
            <span className="material-symbols-outlined text-[48px] text-white">check_circle</span>
          </motion.div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Perfil Completo!</h2>
          <p className="text-lg text-slate-400 max-w-md">
            Agora a Inteligência Artificial tem o contexto ideal para gerar conteúdos personalizados para você.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-sm text-[#0ea5e9] font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <span className="material-symbols-outlined animate-spin text-base">sync</span>
            Preparando sua experiência...
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="onboarding-overlay">
      <div className="w-full max-w-2xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen py-12">

        {/* Top: Logo + Progress */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-12"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="size-10 bg-[#0ea5e9] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.4)]">
              <svg className="text-white w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Mapa do Engajamento</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Pergunta {currentStep + 1} de {totalSteps}
              </span>
              <span className="text-xs font-black text-[#0ea5e9]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0ea5e9] to-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </motion.div>

        {/* Section Badge */}
        {currentSection && (
          <motion.div
            key={currentField.section}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 mb-6"
          >
            <div
              className="size-8 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: `${currentSection.color}15`,
                borderColor: `${currentSection.color}30`,
              }}
            >
              <span className="material-symbols-outlined text-base" style={{ color: currentSection.color }}>
                {currentSection.icon}
              </span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: currentSection.color }}>
              {currentSection.label}
            </span>
          </motion.div>
        )}

        {/* Question Card */}
        <div className="w-full relative" style={{ minHeight: '280px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <div className="onboarding-card p-8 md:p-10 rounded-3xl">
                {/* Question Label */}
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3 leading-tight">
                  {currentField.label}
                </h2>
                <p className="text-sm text-slate-500 mb-8">
                  {currentField.placeholder}
                </p>

                {/* Input */}
                {currentField.type === 'textarea' ? (
                  <textarea
                    value={answers[currentField.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0ea5e9] transition-all resize-none text-sm leading-relaxed min-h-[120px]"
                    rows={4}
                    autoFocus
                  />
                ) : (
                  <input
                    type="text"
                    value={answers[currentField.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0ea5e9] transition-all text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNext()
                    }}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full flex items-center justify-between mt-8 gap-4"
        >
          {/* Back */}
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none px-4 py-3"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Voltar
          </button>

          <div className="flex items-center gap-3">
            {/* Skip */}
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-slate-600 hover:text-slate-400 transition-colors px-4 py-3"
            >
              Pular
            </button>

            {/* Next / Complete */}
            <button
              onClick={handleNext}
              disabled={isCompleting}
              className="onboarding-next-btn flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-70"
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  <span>Concluir</span>
                  <span className="material-symbols-outlined text-xl">check</span>
                </>
              ) : (
                <>
                  <span>Próximo</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Step Dots */}
        <div className="flex items-center gap-1.5 mt-8">
          {PROFILE_FIELDS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                  : i < currentStep
                  ? 'w-1.5 bg-[#0ea5e9]/50'
                  : 'w-1.5 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
