'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check, CheckCircle, ExternalLink, Eye, Lock, MapPin, RefreshCw } from 'lucide-react'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

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
  const [ganchoFeitoHoje, setGanchoFeitoHoje] = useState(false)

  useEffect(() => {
    const checkStatus = () => {
      const today = new Date().toISOString().split('T')[0]
      if (typeof window !== 'undefined') {
        setGanchoFeitoHoje(localStorage.getItem('gancho_feito_hoje') === today)
      }
    }
    checkStatus()
    if (typeof window !== 'undefined') {
      window.addEventListener('task_atualizada', checkStatus)
      return () => window.removeEventListener('task_atualizada', checkStatus)
    }
  }, [])

  const handleConfirmMetodo = async () => {
    setConfirming(true)
    onConfirmMetodo?.()
  }

  const getSteps = (): Step[] => {
    // State 3: Recurring user (daily routine) — rotação semanal
    if (isRecurring && completion === 100) {
      // Calcula semana do ano para alternar automaticamente
      const now = new Date()
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
      const isRotinaWeek = weekNumber % 2 === 0 // par = rotina, ímpar = ganchos

      const rotinaStep: Step = {
        icon: 'calendar_today',
        title: 'Seguir a Rotina',
        description: 'Veja o que fazer em cada dia da semana para não perder o ritmo.',
        status: isRotinaWeek ? 'current' : 'locked',
        href: '/rotina',
        btnLabel: 'Ver Rotina',
        doneBtnLabel: 'Ver Rotina',
        color: '#10b981',
      }
      const ganchoStep: Step = {
        icon: 'anchor',
        title: 'Pegar um Gancho Viral',
        description: 'Escolha uma frase para começar seu vídeo e prender a atenção.',
        status: isRotinaWeek ? 'locked' : (ganchoFeitoHoje ? 'done' : 'current'),
        href: '/ganchos',
        btnLabel: 'Ver Ganchos',
        doneBtnLabel: 'Ver Ganchos',
        color: '#06b6d4',
      }

      // Step 1 e 2 alternam conforme a semana
      const first = isRotinaWeek ? rotinaStep : ganchoStep
      const second = isRotinaWeek ? ganchoStep : rotinaStep

      return [
        first,
        second,
        {
          icon: 'auto_awesome',
          title: 'Gerar Roteiro com IA',
          description: 'Crie o texto completo do seu conteúdo com ajuda da IA.',
          status: 'locked',
          href: '/formatos',
          btnLabel: 'Abrir Gerador',
          doneBtnLabel: 'Abrir Gerador',
          color: '#8b5cf6',
        },
        {
          icon: 'trending_up',
          title: 'Postar e Interagir',
          description: 'Publique e responda comentários para crescer seu perfil.',
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
          ? 'Você já preencheu suas informações.'
          : 'Preencha seu perfil com informações sobre você, seu público e seus objetivos.',
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
          ? 'Você já viu como funciona.'
          : step1Done
            ? 'Veja um resumo rápido de como usar a plataforma para criar conteúdo.'
            : 'Preencha seu perfil primeiro para liberar esta etapa.',
        status: step2Done ? 'done' : step1Done ? 'current' : 'locked',
        href: HOTMART_AULAS_URL,
        btnLabel: 'Ver Visão Geral',
        doneBtnLabel: 'Ver Novamente',
        color: '#ef4444',
        external: true,
        showConfirm: step1Done && !step2Done,
      },
      {
        icon: 'target',
        title: 'Definir Posicionamento',
        description: 'Defina quem é você, quem é seu público e o que te diferencia.',
        status: step2Done ? 'current' : 'locked',
        href: '/prompts',
        btnLabel: 'Definir Agora',
        doneBtnLabel: 'Ver Posicionamento',
        color: '#8b5cf6',
      },
      {
        icon: 'explore',
        title: 'Jornada de Conteúdo',
        description: 'Siga o passo a passo com 30 etapas e dicas prontas para usar.',
        status: 'locked',
        href: '/jornada',
        btnLabel: 'Abrir Jornada',
        doneBtnLabel: 'Abrir Jornada',
        color: '#0ea5e9',
      },
    ]
  }

  const steps = getSteps()
  const activeStep = steps.find(s => s.status === 'current') || steps.find(s => s.status === 'locked') || steps[steps.length - 1]
  const isDone = activeStep.status === 'done'

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-2">
        <MapPin size={24} className="text-[#0ea5e9] text-2xl" />
        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          Sua Prioridade Agora
        </h3>
      </div>
      <p className="text-sm text-slate-700 dark:text-white/90 mb-6 ml-9">
        Foque em uma tarefa por vez para construir o seu negócio de forma contínua.
      </p>

      {/* Hero Task Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`relative rounded-3xl p-6 sm:p-8 sm:pr-10 border transition-all glass-card ${
          isDone
            ? 'border-emerald-500/30'
            : activeStep.status === 'locked' 
              ? 'border-slate-300/20 dark:border-white/10 opacity-70' 
              : 'border-[#0ea5e9]/40 shadow-xl shadow-[#0ea5e9]/10'
        } overflow-hidden`}
      >
        {/* Background glow para destacar */}
        {!isDone && activeStep.status === 'current' && (
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#0ea5e9]/10 blur-[80px] rounded-full pointer-events-none" />
        )}

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 sm:items-center relative z-10">
          {/* Ícone Grande */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: isDone ? '#10b98120' : activeStep.status === 'locked' ? 'rgba(255,255,255,0.05)' : `${activeStep.color}20`,
              color: isDone ? '#10b981' : activeStep.status === 'locked' ? '#64748b' : activeStep.color,
              borderColor: isDone ? '#10b98140' : activeStep.status === 'locked' ? 'rgba(255,255,255,0.1)' : `${activeStep.color}40`,
            }}
          >
            {isDone ? <Check size={36} className="sm:text-4xl" /> : <DynamicIcon name={activeStep.icon} size={36} className="sm:size-10" />}
          </div>

          <div className="flex-1 space-y-2">
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-1 border ${
              isDone
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                : activeStep.status === 'locked'
                  ? 'bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10'
                  : 'bg-[#0ea5e9]/15 text-[#0ea5e9] border-[#0ea5e9]/30'
            }`}>
              {isDone ? '✅ Fase Completa' : activeStep.status === 'locked' ? '🔒 Próxima Etapa (Bloqueada)' : '📍 FAZER NESTE MOMENTO'}
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeStep.title}
            </h4>
            <p className="text-slate-700 dark:text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl">
              {activeStep.description}
            </p>
          </div>

          {/* Ação */}
          <div className="shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/10 sm:pl-10">
            {activeStep.status === 'current' && (
              <div className="flex flex-col gap-3">
                {activeStep.external ? (
                  <a
                    href={activeStep.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all shadow-lg hover:scale-105 active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${activeStep.color}, ${activeStep.color}dd)` }}
                  >
                    <ExternalLink size={18} className="text-[18px]" />
                    {activeStep.btnLabel}
                  </a>
                ) : (
                  <Link
                    href={activeStep.href}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all shadow-lg hover:scale-105 active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${activeStep.color}, ${activeStep.color}dd)` }}
                  >
                    <ArrowRight size={18} className="text-[18px]" />
                    {activeStep.btnLabel}
                  </Link>
                )}
                {activeStep.showConfirm && (
                   <motion.button
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     onClick={handleConfirmMetodo}
                     disabled={confirming}
                     className="inline-flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-60"
                   >
                     {confirming ? <RefreshCw size={16} /> : <CheckCircle size={16} />}
                     {confirming ? 'Salvando...' : 'Marcar como feito'}
                   </motion.button>
                )}
              </div>
            )}
            
            {activeStep.status === 'done' && (
              <Link
                href={activeStep.href}
                className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
              >
                <Eye size={18} />
                Revisar Etapa
              </Link>
            )}

            {activeStep.status === 'locked' && (
              <div className="inline-flex justify-center flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full border border-slate-300 dark:border-white/10 flex items-center justify-center mb-2">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block text-center">
                  Cumpra a etapa anterior
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}
