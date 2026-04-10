'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StepDetalhesProps {
  palavrasPreferidas: string[]
  palavrasEvitadas: string[]
  instrucoesAdicionais: string
  onPreferidasChange: (value: string[]) => void
  onEvitadasChange: (value: string[]) => void
  onInstrucoesChange: (value: string) => void
}

function TagInput({ 
  tags, 
  onChange, 
  placeholder 
}: { 
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string 
}) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const trimmed = input.trim()
    if (!trimmed || tags.includes(trimmed)) return
    onChange([...tags, trimmed])
    setInput('')
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9] transition-colors"
        />
        <button
          onClick={addTag}
          disabled={!input.trim()}
          className="size-11 rounded-xl bg-[#0ea5e9] text-white flex items-center justify-center hover:bg-[#0ea5e9]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
      </div>
      <AnimatePresence mode="popLayout">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <motion.span
              key={`${tag}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-full text-sm font-medium border border-[#0ea5e9]/20"
            >
              {tag}
              <button
                onClick={() => removeTag(i)}
                className="hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </motion.span>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}

export function StepDetalhes({
  palavrasPreferidas,
  palavrasEvitadas,
  instrucoesAdicionais,
  onPreferidasChange,
  onEvitadasChange,
  onInstrucoesChange,
}: StepDetalhesProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
        Detalhes finais
      </h2>
      <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
        Informações extras para personalizar seus roteiros
      </p>

      {/* Palavras Preferidas */}
      <div className="mb-6">
        <label className="text-sm font-bold text-slate-900 dark:text-white block mb-2">
          Palavras preferidas
        </label>
        <TagInput
          tags={palavrasPreferidas}
          onChange={onPreferidasChange}
          placeholder="Adicionar..."
        />
      </div>

      {/* Palavras Evitadas */}
      <div className="mb-6">
        <label className="text-sm font-bold text-slate-900 dark:text-white block mb-2">
          Palavras evitadas
        </label>
        <TagInput
          tags={palavrasEvitadas}
          onChange={onEvitadasChange}
          placeholder="Adicionar..."
        />
      </div>

      {/* Instruções Adicionais */}
      <div>
        <label className="text-sm font-bold text-slate-900 dark:text-white block mb-2">
          Instruções adicionais
        </label>
        <textarea
          value={instrucoesAdicionais}
          onChange={(e) => onInstrucoesChange(e.target.value)}
          placeholder="Informações extras para a IA considerar nos roteiros..."
          rows={4}
          className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9] transition-colors resize-none leading-relaxed"
        />
      </div>
    </div>
  )
}
