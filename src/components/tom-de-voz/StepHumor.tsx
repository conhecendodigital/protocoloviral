'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Bordao {
  texto: string
  posicao: 'inicio' | 'meio' | 'final'
}

interface StepHumorProps {
  humor: number
  bordoes: Bordao[]
  onHumorChange: (value: number) => void
  onBordoesChange: (value: Bordao[]) => void
}

export function StepHumor({ humor, bordoes, onHumorChange, onBordoesChange }: StepHumorProps) {
  const [newBordao, setNewBordao] = useState('')
  const [newPosicao, setNewPosicao] = useState<'inicio' | 'meio' | 'final'>('inicio')

  const addBordao = () => {
    if (!newBordao.trim()) return
    onBordoesChange([...bordoes, { texto: newBordao.trim(), posicao: newPosicao }])
    setNewBordao('')
  }

  const removeBordao = (index: number) => {
    onBordoesChange(bordoes.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addBordao()
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
        Humor e bordões
      </h2>
      <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
        Quanto humor você usa e quais são suas frases marcantes?
      </p>

      {/* Slider de Humor */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">
            Nível de humor: {humor}/5
          </label>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={5}
            value={humor}
            onChange={(e) => onHumorChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0ea5e9]
              [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(14,165,233,0.5)] [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[#0ea5e9] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-white/40 font-medium">
            <span>Sério</span>
            <span>Muito engraçado</span>
          </div>
        </div>
      </div>

      {/* Bordões */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Bordões
        </h3>
        <p className="text-xs text-slate-500 dark:text-white/50 mb-3">
          Frases que você sempre usa nos vídeos
        </p>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newBordao}
            onChange={(e) => setNewBordao(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Bora!"
            className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9] transition-colors"
          />
          <select
            value={newPosicao}
            onChange={(e) => setNewPosicao(e.target.value as any)}
            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#0ea5e9] transition-colors cursor-pointer"
          >
            <option value="inicio">Início</option>
            <option value="meio">Meio</option>
            <option value="final">Final</option>
          </select>
          <button
            onClick={addBordao}
            disabled={!newBordao.trim()}
            className="size-11 rounded-xl bg-[#0ea5e9] text-white flex items-center justify-center hover:bg-[#0ea5e9]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>

        {/* Lista */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {bordoes.map((b, i) => (
              <motion.div
                key={`${b.texto}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
              >
                <span className="text-sm font-semibold text-slate-900 dark:text-white flex-1">
                  &ldquo;{b.texto}&rdquo;
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0ea5e9] bg-[#0ea5e9]/10 px-2.5 py-1 rounded-full shrink-0">
                  {b.posicao}
                </span>
                <button
                  onClick={() => removeBordao(i)}
                  className="text-slate-400 hover:text-red-400 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}
