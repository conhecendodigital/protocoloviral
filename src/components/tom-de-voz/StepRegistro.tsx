'use client'

import { motion } from 'framer-motion'

const REGISTROS = [
  {
    id: 'informal',
    emoji: '🗣️',
    nome: 'Informal',
    desc: 'Gíria, "mano", "véi", zero filtro',
    exemplo: '"Mano, cê precisa ver esse baguio aqui, é sinistro demais."',
  },
  {
    id: 'coloquial',
    emoji: '💬',
    nome: 'Coloquial',
    desc: 'Simples, acessível, sem gíria pesada',
    exemplo: '"Olha só, isso aqui vai mudar a forma como você cria conteúdo."',
  },
  {
    id: 'polido',
    emoji: '✨',
    nome: 'Polido',
    desc: 'Vocabulário rico, sofisticado',
    exemplo: '"Permita-me apresentar uma abordagem que transformará sua estratégia de conteúdo."',
  },
]

interface StepRegistroProps {
  value?: string
  onChange: (value: string) => void
}

export function StepRegistro({ value, onChange }: StepRegistroProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
        Registro linguístico
      </h2>
      <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
        Como você fala nos seus vídeos?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {REGISTROS.map((r, i) => (
          <motion.button
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onChange(r.id)}
            className={`relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 transition-all text-left ${
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
            <div className="flex items-center gap-2">
              <span className="text-xl">{r.emoji}</span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">{r.nome}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-white/50">{r.desc}</p>
            <p className="text-xs italic text-slate-600 dark:text-white/40 mt-1 leading-relaxed border-t border-slate-200 dark:border-white/10 pt-3 w-full">
              {r.exemplo}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
