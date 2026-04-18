'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

const ENERGIAS = [
  { id: 'alta', emoji: '⚡', nome: 'Alta', desc: 'Frases curtas, ritmo rápido' },
  { id: 'media', emoji: '🎯', nome: 'Média', desc: 'Conversa natural' },
  { id: 'baixa', emoji: '🧘', nome: 'Baixa', desc: 'Tom calmo, pausado' },
]

const RITMOS = [
  { id: 'rapido', nome: 'Rápido', desc: '~200 palavras/min' },
  { id: 'medio', nome: 'Médio', desc: '~150 palavras/min' },
  { id: 'pausado', nome: 'Pausado', desc: '~100 palavras/min' },
]

interface StepEnergiaProps {
  energia?: string
  ritmo?: string
  onEnergiaChange: (value: string) => void
  onRitmoChange: (value: string) => void
}

export function StepEnergia({ energia, ritmo, onEnergiaChange, onRitmoChange }: StepEnergiaProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
        Energia e ritmo
      </h2>
      <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
        Como é o ritmo dos seus vídeos?
      </p>

      {/* Energia */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {ENERGIAS.map((e, i) => (
          <motion.button
            key={e.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onEnergiaChange(e.id)}
            className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
              energia === e.id
                ? 'border-[#0ea5e9] bg-[#0ea5e9]/5 ring-2 ring-[#0ea5e9]/20'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            {energia === e.id && (
              <div className="absolute top-2 right-2">
                <CheckCircle size={14} className="text-[#0ea5e9] text-sm" />
              </div>
            )}
            <span className="text-2xl">{e.emoji}</span>
            <p className="font-bold text-sm text-slate-900 dark:text-white">{e.nome}</p>
            <p className="text-xs text-slate-500 dark:text-white/50">{e.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Ritmo de Fala */}
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Ritmo de fala</h3>
      <div className="grid grid-cols-3 gap-3">
        {RITMOS.map((r, i) => (
          <motion.button
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            onClick={() => onRitmoChange(r.id)}
            className={`relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${
              ritmo === r.id
                ? 'border-[#0ea5e9] bg-[#0ea5e9]/5 ring-2 ring-[#0ea5e9]/20'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            {ritmo === r.id && (
              <div className="absolute top-2 right-2">
                <CheckCircle size={14} className="text-[#0ea5e9] text-sm" />
              </div>
            )}
            <p className="font-bold text-sm text-slate-900 dark:text-white">{r.nome}</p>
            <p className="text-xs text-slate-500 dark:text-white/50">{r.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
