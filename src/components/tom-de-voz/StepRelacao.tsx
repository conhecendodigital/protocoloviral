'use client'

import { motion } from 'framer-motion'

const RELACOES = [
  { id: 'professor', emoji: '🎓', nome: 'Professor', desc: 'Ensina com paciência, guia passo a passo' },
  { id: 'amigo', emoji: '🤝', nome: 'Amigo', desc: 'Fala de igual, linguagem solta' },
  { id: 'provocador', emoji: '🔥', nome: 'Provocador', desc: 'Desafia, cutuca, questiona crenças' },
  { id: 'mentor', emoji: '🦁', nome: 'Mentor', desc: 'Autoridade com experiência real' },
  { id: 'comediante', emoji: '😂', nome: 'Comediante', desc: 'Usa humor pra ensinar' },
  { id: 'hipeman', emoji: '🚀', nome: 'Hipeman', desc: 'Energia alta, motivacional' },
]

interface StepRelacaoProps {
  value?: string
  onChange: (value: string) => void
}

export function StepRelacao({ value, onChange }: StepRelacaoProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
        Como você se relaciona com sua audiência?
      </h2>
      <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
        Escolha o estilo que mais combina com você
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {RELACOES.map((r, i) => (
          <motion.button
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onChange(r.id)}
            className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all text-left ${
              value === r.id
                ? 'border-[#0ea5e9] bg-[#0ea5e9]/5 ring-2 ring-[#0ea5e9]/20'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            {value === r.id && (
              <div className="absolute top-3 right-3">
                <span className="material-symbols-outlined text-[#0ea5e9] text-lg">check_circle</span>
              </div>
            )}
            <span className="text-2xl">{r.emoji}</span>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">{r.nome}</p>
              <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5 leading-relaxed">{r.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
