'use client'

import { motion } from 'framer-motion'
import { getPreview, getRegistroLabel, getEnergiaLabel } from './previews'

interface VoicePreviewProps {
  relacao?: string
  energia?: string
  registro?: string
}

export function VoicePreview({ relacao, energia, registro }: VoicePreviewProps) {
  const preview = getPreview(
    relacao as any || 'amigo',
    registro as any || 'coloquial'
  )
  const registroLabel = getRegistroLabel(registro as any)
  const energiaLabel = getEnergiaLabel(energia)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6 sticky top-8"
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">visibility</span>
        <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">Preview do seu tom de voz</h3>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-500"></span>
          {registroLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 text-xs font-bold border border-pink-200 dark:border-pink-500/20">
          <span className="material-symbols-outlined text-[12px]">target</span>
          {energiaLabel}
        </span>
      </div>

      {/* Gancho */}
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 dark:text-red-400 block mb-1.5">
          GANCHO
        </span>
        <motion.p
          key={`gancho-${relacao}-${registro}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-amber-900 dark:text-amber-100/80 leading-relaxed"
        >
          {preview.gancho}
        </motion.p>
      </div>

      {/* Desenvolvimento */}
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 block mb-1.5">
          DESENVOLVIMENTO
        </span>
        <motion.p
          key={`dev-${relacao}-${registro}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-amber-900 dark:text-amber-100/80 leading-relaxed"
        >
          {preview.desenvolvimento}
        </motion.p>
      </div>

      {/* CTA */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1.5">
          CTA
        </span>
        <motion.p
          key={`cta-${relacao}-${registro}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-amber-900 dark:text-amber-100/80 leading-relaxed"
        >
          {preview.cta}
        </motion.p>
      </div>
    </motion.div>
  )
}
