'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PROFILE_FIELDS } from '@/types/profile'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Check, CheckCircle, Hand, RefreshCw, Zap } from 'lucide-react'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

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

// ── Sugestões clicaveis por pergunta ────────────────────────────────────
const CHIPS: Record<string, { emoji: string; label: string; value: string }[]> = {
  nicho: [
    { emoji: '📱', label: 'Marketing Digital', value: 'Marketing Digital' },
    { emoji: '💰', label: 'Finanças Pessoais', value: 'Finanças Pessoais' },
    { emoji: '🏋️', label: 'Saúde e Bem-estar', value: 'Saúde e Bem-estar' },
    { emoji: '📚', label: 'Educação', value: 'Educação e Aprendizado' },
    { emoji: '🍽️', label: 'Gastronomia', value: 'Gastronomia' },
    { emoji: '🏠', label: 'Imobiliário', value: 'Mercado Imobiliário' },
    { emoji: '⚖️', label: 'Jurídico', value: 'Área Jurídica' },
    { emoji: '🎨', label: 'Criativo/Design', value: 'Design e Criatividade' },
  ],
  assunto: [
    { emoji: '🎯', label: 'Instagram para negócios', value: 'Instagram para negócios locais' },
    { emoji: '📈', label: 'Crescimento orgânico', value: 'Crescimento orgânico no Instagram' },
    { emoji: '🤑', label: 'Renda extra online', value: 'Como gerar renda extra pela internet' },
    { emoji: '🍏', label: 'Alimentação saudável', value: 'Alimentação saudável no dia a dia' },
    { emoji: '🧘', label: 'Saúde mental', value: 'Saúde mental e equilíbrio emocional' },
    { emoji: '💸', label: 'Investimentos simples', value: 'Investimentos para iniciantes' },
  ],
  resultado: [
    { emoji: '👥', label: '10k+ seguidores', value: 'Cresci de 0 para 10 mil seguidores em 3 meses' },
    { emoji: '💰', label: 'Primeiras vendas', value: 'Fechei meus primeiros clientes pelo Instagram' },
    { emoji: '🎓', label: 'Virei referência', value: 'Tornei-me referência no meu nicho local' },
    { emoji: '📊', label: 'Atingi 1M de alcance', value: 'Alcancei mais de 1 milhão de pessoas' },
    { emoji: '🚀', label: 'Largue o emprego', value: 'Consegui viver 100% do meu negócio online' },
    { emoji: '⭐', label: 'Ainda construindo', value: 'Ainda estou construindo meus resultados' },
  ],
  proposito: [
    { emoji: '🛒', label: 'Vender meu produto', value: 'Vender meu produto/serviço pelas redes' },
    { emoji: '🎓', label: 'Lançar um curso', value: 'Lançar um curso ou mentoria online' },
    { emoji: '💼', label: 'Atrair clientes', value: 'Atrair novos clientes para meu negócio' },
    { emoji: '🏆', label: 'Construir autoridade', value: 'Construir autoridade e reconhecimento no meu nicho' },
    { emoji: '🤳', label: 'Audiencia + renda', value: 'Crescer uma audiência e monetizar no futuro' },
    { emoji: '🌐', label: 'Me tornar digital', value: 'Profissional liberal que quer atrair clientes pelo digital' },
  ],
  receio: [
    { emoji: '🎥', label: 'Vergonha da câmera', value: 'Sinto vergonha de aparecer na câmera' },
    { emoji: '🤷', label: 'Não sei o que falar', value: 'Não sei o que falar nem por onde começar' },
    { emoji: '👎', label: 'Medo de julgamento', value: 'Medo de ser julgado(a) pelas pessoas que me conhecem' },
    { emoji: '😩', label: 'Não tenho tempo', value: 'Acho que não vou conseguir manter consistência' },
    { emoji: '📉', label: 'Ninguém vai ver', value: 'Medo de criar e ninguém assistir ou curtir' },
    { emoji: '✅', label: 'Nenhum receio', value: 'Não tenho receios, quero apenas melhorar meu conteúdo' },
  ],
  tempo: [
    { emoji: '⚡', label: '15-30 min/dia', value: '15 a 30 minutos por dia' },
    { emoji: '🕐', label: '1 hora/dia', value: 'Cerca de 1 hora por dia' },
    { emoji: '🕑', label: '2 horas/dia', value: '2 horas por dia' },
    { emoji: '📅', label: 'Só fins de semana', value: 'Apenas nos finais de semana' },
    { emoji: '🔥', label: '3h+/dia', value: 'Mais de 3 horas por dia, estou 100% dedicado' },
  ],
  naoquer: [
    { emoji: '🚫', label: 'Política', value: 'Política e religioão' },
    { emoji: '💊', label: 'Promessas milagrosas', value: 'Promessas de resultado rápido sem esforço' },
    { emoji: '😢', label: 'Conteúdo negativo', value: 'Conteúdo negativo, doom ou catastrofôfico' },
    { emoji: '🎰', label: 'Apostas e jogos', value: 'Apostas esportivas e jogos de azar' },
    { emoji: '😡', label: 'Polêmica e briga', value: 'Polêmicas, brigas e cancel culture' },
    { emoji: '✅', label: 'Sem restrições', value: 'Sem temas proibidos, sou flexível' },
  ],
}

export function OnboardingModal({ userId, onComplete, updateField }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(-1) // -1 = intro screen
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [isCompleting, setIsCompleting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const supabase = useMemo(() => createClient(), [])
  const totalSteps = PROFILE_FIELDS.length
  const currentField = currentStep >= 0 ? PROFILE_FIELDS[currentStep] : null
  const progress = currentStep >= 0 ? ((currentStep + 1) / totalSteps) * 100 : 0

  const currentSection = currentField ? SECTION_LABELS[currentField.section] : null

  const handleAnswer = useCallback((value: string) => {
    if (!currentField) return
    setAnswers(prev => ({ ...prev, [currentField.id]: value }))
  }, [currentField])

  const handleNext = useCallback(async () => {
    if (!currentField) return
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
    } else if (currentStep === 0) {
      setDirection(-1)
      setCurrentStep(-1) // Go back to intro
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
      <div className="onboarding-overlay dark">
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
            <CheckCircle size={48} className="text-[48px] text-slate-900 dark:text-white" />
          </motion.div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Perfil Completo!</h2>
          <p className="text-lg text-slate-800 dark:text-white/90 max-w-md">
            Agora a Inteligência Artificial tem o contexto ideal para gerar conteúdos personalizados para você.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-sm text-[#0ea5e9] font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <RefreshCw size={16} className="animate-spin text-base" />
            Preparando sua experiência...
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Intro welcome screen
  if (currentStep === -1) {
    return (
      <div className="onboarding-overlay dark">
        <div className="w-full max-w-2xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="size-20 bg-gradient-to-br from-[#0ea5e9] to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(14,165,233,0.3)]"
            >
              <Hand size={40} className="text-[40px] text-slate-900 dark:text-white" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              Antes de começar,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">preciso te conhecer melhor!</span>
            </h2>

            <p className="text-base text-slate-800 dark:text-white/90 max-w-lg mx-auto mb-4 leading-relaxed">
              Vou te fazer algumas perguntas rápidas sobre você, seu público e seus objetivos.
            </p>

            <p className="text-base text-slate-800 dark:text-white/90 max-w-lg mx-auto mb-4 leading-relaxed">
              Essas respostas vão alimentar diretamente a <span className="font-bold text-slate-900 dark:text-white">Inteligência Artificial</span> que gera seus prompts, roteiros, ideias de conteúdo e estratégias de vendas.
            </p>

            <p className="text-sm text-slate-700 dark:text-white/90 max-w-lg mx-auto mb-10 leading-relaxed">
              Quanto mais detalhado você for, <span className="font-bold text-[#0ea5e9]">mais personalizados e poderosos</span> serão os conteúdos gerados para o seu nicho. Sem essas informações, a IA não tem contexto suficiente.
            </p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => {
                setDirection(1)
                setCurrentStep(0)
              }}
              className="onboarding-next-btn inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-slate-900 dark:text-white font-bold text-base transition-all active:scale-[0.97]"
            >
              <span>Vamos começar</span>
              <ArrowRight size={20} className="text-xl" />
            </motion.button>

            <button
              onClick={onComplete}
              className="block mx-auto mt-6 text-sm font-medium text-slate-800 dark:text-white/90 hover:text-slate-800 dark:text-white/90 transition-colors"
            >
              Preencher depois
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  // Main question flow
  if (!currentField) return null

  return (
    <div className="onboarding-overlay dark">
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
              <svg className="text-slate-900 dark:text-white w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">Mapa do Engajamento</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-white/90 uppercase tracking-widest">
                Pergunta {currentStep + 1} de {totalSteps}
              </span>
              <span className="text-xs font-black text-[#0ea5e9]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
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
              <DynamicIcon name={currentSection.icon} size={16} style={{ color: currentSection.color }} />
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
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-tight">
                  {currentField.label}
                </h2>
                <p className="text-sm text-slate-700 dark:text-white/90 mb-8">
                  {currentField.placeholder}
                </p>

                {/* Input */}
                {currentField.type === 'textarea' ? (
                  <textarea
                    value={answers[currentField.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#0ea5e9] transition-all resize-none text-base leading-relaxed min-h-[120px] shadow-sm"
                    rows={4}
                    autoFocus
                  />
                ) : (
                  <input
                    type="text"
                    value={answers[currentField.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#0ea5e9] transition-all text-base shadow-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNext()
                    }}
                  />
                )}

                {/* ── Chips / Sugestões clicaveis ── */}
                {CHIPS[currentField.id] && (
                  <div className="mt-5">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Zap size={12} className="text-[#0ea5e9]" />
                      <p className="text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">Sugestões rápidas</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CHIPS[currentField.id].map((chip) => {
                        const isSelected = answers[currentField.id] === chip.value
                        return (
                          <motion.button
                            key={chip.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            type="button"
                            onClick={() => {
                              handleAnswer(chip.value)
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                              isSelected
                                ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/50 text-[#0ea5e9] ring-1 ring-[#0ea5e9]/20'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-[#0ea5e9]/40 hover:text-[#0ea5e9] hover:bg-[#0ea5e9]/5'
                            }`}
                          >
                            <span>{chip.emoji}</span>
                            <span>{chip.label}</span>
                            {isSelected && <Check size={12} className="text-[#0ea5e9]" />}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
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
            disabled={currentStep < 0}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-white/90 hover:text-slate-900 dark:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none px-4 py-3"
          >
            <ArrowLeft size={20} className="text-xl" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            {/* Skip */}
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-slate-800 dark:text-white/90 hover:text-slate-800 dark:text-white/90 transition-colors px-4 py-3"
            >
              Pular
            </button>

            {/* Next / Complete */}
            <button
              onClick={handleNext}
              disabled={isCompleting}
              className="onboarding-next-btn flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-900 dark:text-white font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-70"
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  <span>Concluir</span>
                  <Check size={20} className="text-xl" />
                </>
              ) : (
                <>
                  <span>Próximo</span>
                  <ArrowRight size={20} className="text-xl" />
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
                  : 'w-1.5 bg-black/10 dark:bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
