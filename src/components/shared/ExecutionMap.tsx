'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type StepStatus = 'done' | 'current' | 'locked'

interface Step {
  icon: string
  title: string
  description: string
  status: StepStatus
  href: string
  btnLabel: string
  doneBtnLabel: string
  color: string
  external?: boolean
  showConfirm?: boolean
}

const HOTMART_AULAS_URL = 'https://go.hotmart.com/I99444830U' // URL das aulas na Hotmart

interface ExecutionMapProps {
  completion: number
  isRecurring?: boolean
  metodoConcluido?: boolean
  onConfirmMetodo?: () => void
}

export function ExecutionMap({ completion, isRecurring = false, metodoConcluido = false, onConfirmMetodo }: ExecutionMapProps) {
  const [confirming, setConfirming] = useState(false)

  const handleConfirmMetodo = async () => {
    setConfirming(true)
    onConfirmMetodo?.()
  }

  const getSteps = (): Step[] => {
    // State 3: Recurring user (daily routine)
    if (isRecurring && completion === 100) {
      return [
        {
          icon: 'anchor',
          title: 'Pegar um Gancho Viral',
          description: 'Escolha uma frase de abertura que prende atenção nos primeiros 3 segundos.',
          status: 'current',
          href: '/ganchos',
          btnLabel: 'Ver Ganchos',
          doneBtnLabel: 'Ver Ganchos',
          color: '#06b6d4',
        },
        {
          icon: 'auto_awesome',
          title: 'Gerar Roteiro com IA',
          description: 'Use o gerador de prompts para criar o texto completo do seu conteúdo.',
          status: 'locked',
          href: '/prompts',
          btnLabel: 'Abrir Gerador',
          doneBtnLabel: 'Abrir Gerador',
          color: '#8b5cf6',
        },
        {
          icon: 'calendar_today',
          title: 'Seguir a Rotina',
          description: 'Siga a rotina semanal para manter a consistência e engajamento.',
          status: 'locked',
          href: '/rotina',
          btnLabel: 'Ver Rotina',
          doneBtnLabel: 'Ver Rotina',
          color: '#10b981',
        },
        {
          icon: 'trending_up',
          title: 'Postar e Interagir',
          description: 'Publique o conteúdo e interaja com seus seguidores para crescer.',
          status: 'locked',
          href: '/rotina',
          btnLabel: 'Ver Checklist',
          doneBtnLabel: 'Ver Checklist',
          color: '#f59e0b',
        },
      ]
    }

    // State 1 & 2: New user flow (4 steps)
    const step1Done = completion === 100
    const step2Done = step1Done && metodoConcluido

    return [
      {
        icon: 'psychology',
        title: 'Treinar a IA',
        description: step1Done 
          ? 'Você já ensinou a IA sobre o seu negócio.'
          : 'Preencha seu perfil para ensinar a IA sobre seu negócio, público e objetivos.',
        status: step1Done ? 'done' : 'current',
        href: '/perfil',
        btnLabel: 'Completar Perfil',
        doneBtnLabel: 'Ver Perfil',
        color: '#f59e0b',
      },
      {
        icon: 'play_circle',
        title: 'Entender o Método',
        description: step2Done
          ? 'Você já viu a visão geral do método.'
          : step1Done
            ? 'Veja a visão geral rápida de como usar a plataforma para criar conteúdo.'
            : 'Desbloqueie ao completar o treinamento da IA.',
        status: step2Done ? 'done' : step1Done ? 'current' : 'locked',
        href: HOTMART_AULAS_URL,
        btnLabel: 'Ver Visão Geral',
        doneBtnLabel: 'Ver Novamente',
        color: '#ef4444',
        external: true,
        showConfirm: step1Done && !step2Done,
      },
      {
        icon: 'explore',
        title: 'Jornada de Conteúdo',
        description: 'Siga o mapa metodológico com 30 estações e frameworks prontos.',
        status: step2Done ? 'current' : 'locked',
        href: '/jornada',
        btnLabel: 'Abrir Jornada',
        doneBtnLabel: 'Abrir Jornada',
        color: '#0ea5e9',
      },
      {
        icon: 'target',
        title: 'Definir Posicionamento',
        description: 'Use o Gerador de Prompts para definir seu nicho, persona e posicionamento.',
        status: 'locked',
        href: '/prompts',
        btnLabel: 'Definir Agora',
        doneBtnLabel: 'Definir Agora',
        color: '#8b5cf6',
      },
    ]
  }

  const steps = getSteps()

  const statusConfig = {
    done: {
      badge: '✅',
      badgeText: 'Concluído',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      cardClass: 'border-emerald-500/20 bg-emerald-500/5',
      lineClass: 'bg-emerald-500',
    },
    current: {
      badge: '📍',
      badgeText: 'Ação Atual',
      badgeClass: 'bg-[#0ea5e9]/15 text-[#0ea5e9] border-[#0ea5e9]/30',
      cardClass: 'border-[#0ea5e9]/30 bg-[#0ea5e9]/5 ring-1 ring-[#0ea5e9]/20',
      lineClass: 'bg-white/10',
    },
    locked: {
      badge: '🔒',
      badgeText: 'Bloqueado',
      badgeClass: 'bg-white/5 text-slate-500 border-white/10',
      cardClass: 'border-white/5 bg-white/[0.02] opacity-60',
      lineClass: 'bg-white/10',
    },
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-[#0ea5e9] text-2xl">pin_drop</span>
        <h3 className="text-xl font-black tracking-tight text-white">
          {isRecurring && completion === 100
            ? 'Sua Rotina de Hoje'
            : 'Seu Mapa de Execução'}
        </h3>
      </div>
      <p className="text-sm text-slate-500 mb-6 ml-9">
        {isRecurring && completion === 100
          ? 'Siga estes 4 passos para criar conteúdo consistente todos os dias.'
          : 'Complete estes 4 passos para ter seu conteúdo pronto.'}
      </p>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">  
        {steps.map((step, i) => {
          const config = statusConfig[step.status]
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`relative rounded-2xl p-6 border transition-all ${config.cardClass}`}
            >
              {/* Step Number + Connector */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="size-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{
                    backgroundColor: step.status === 'locked' ? 'rgba(255,255,255,0.05)' : `${step.color}20`,
                    color: step.status === 'locked' ? '#64748b' : step.color,
                    border: `1px solid ${step.status === 'locked' ? 'rgba(255,255,255,0.1)' : `${step.color}40`}`,
                  }}
                >
                  {step.status === 'done' ? (
                    <span className="material-symbols-outlined text-base text-emerald-400">check</span>
                  ) : (
                    i + 1
                  )}
                </div>

                {/* Status Badge */}
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${config.badgeClass}`}>
                  {config.badge} {config.badgeText}
                </span>
              </div>

              {/* Icon + Title */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ color: step.status === 'locked' ? '#475569' : step.color }}
                >
                  {step.icon}
                </span>
                <h4 className={`font-bold text-base ${step.status === 'locked' ? 'text-slate-500' : 'text-white'}`}>
                  {step.title}
                </h4>
              </div>

              {/* Description */}
              <p className={`text-sm leading-relaxed mb-5 ${step.status === 'locked' ? 'text-slate-600' : 'text-slate-400'}`}>
                {step.description}
              </p>

              {/* Action Buttons */}
              {step.status === 'current' && (
                <div className="flex flex-col gap-2">
                  {step.external ? (
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.97]"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      {step.btnLabel}
                    </a>
                  ) : (
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.97]"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}
                    >
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                      {step.btnLabel}
                    </Link>
                  )}

                  {/* Confirm button for step 2 */}
                  {step.showConfirm && (
                    <AnimatePresence>
                      <motion.button
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={handleConfirmMetodo}
                        disabled={confirming}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 transition-all hover:bg-emerald-500/20 active:scale-[0.97] disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-base">
                          {confirming ? 'sync' : 'check_circle'}
                        </span>
                        {confirming ? 'Salvando...' : 'Já concluí esta etapa'}
                      </motion.button>
                    </AnimatePresence>
                  )}
                </div>
              )}

              {step.status === 'done' && (
                step.external ? (
                  <a
                    href={step.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 transition-all hover:bg-emerald-500/20"
                  >
                    <span className="material-symbols-outlined text-base">visibility</span>
                    {step.doneBtnLabel}
                  </a>
                ) : (
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 transition-all hover:bg-emerald-500/20"
                  >
                    <span className="material-symbols-outlined text-base">visibility</span>
                    {step.doneBtnLabel}
                  </Link>
                )
              )}

              {step.status === 'locked' && (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-white/[0.03] border border-white/5 cursor-not-allowed">
                  <span className="material-symbols-outlined text-base">lock</span>
                  {step.btnLabel}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
