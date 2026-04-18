import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WizardQuestion } from './wizard-data'
import { Check, Circle, FileEdit, Pencil, Plus } from 'lucide-react'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

interface GamifiedQuestionProps {
  question: WizardQuestion
  value: string
  onChange: (val: string) => void
}

export function GamifiedQuestion({ question, value, onChange }: GamifiedQuestionProps) {
  const selectedValues = value ? value.split(' | ').filter(v => v.trim() !== '') : []
  const customValuesArray = selectedValues.filter(v => !question.options.find(o => o.id === v))
  
  const [customValue, setCustomValue] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const [concorrentesInputs, setConcorrentesInputs] = useState<string[]>(Array.from({ length: 5 }, () => ''))

  // Workaround: We want to trigger initialization without breaking rules, let's use a ref to track if initialized
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    if (!initialized && value !== undefined) {
      if (question.id === 'concorrentes') {
        const vals = value ? value.split(' | ') : []
        setConcorrentesInputs(Array.from({ length: 5 }, (_, i) => vals[i] || ''))
      } else {
        if (customValuesArray.length > 0) {
          setIsCustom(true)
          setCustomValue(customValuesArray.join(' | '))
        }
      }
      setInitialized(true)
    }
  }, [value, initialized, customValuesArray, question.id])

  const handleConcorrentesBlur = () => {
    const filled = concorrentesInputs.filter(v => v.trim() !== '')
    onChange(filled.join(' | '))
  }

  const handleConcorrentesChange = (idx: number, text: string) => {
    const newInputs = [...concorrentesInputs]
    newInputs[idx] = text
    setConcorrentesInputs(newInputs)
  }

  const handleSelectOption = (optId: string) => {
    if (question.multiple === false) {
      onChange(optId)
      setIsCustom(false)
      setCustomValue('')
      return
    }

    let newValues
    if (selectedValues.includes(optId)) {
      newValues = selectedValues.filter(v => v !== optId)
    } else {
      newValues = [...selectedValues, optId]
    }
    onChange(newValues.join(' | '))
  }

  const handleCustomSubmit = () => {
    if (question.multiple === false) {
      if (customValue.trim()) {
        onChange(customValue.trim())
      } else {
        setIsCustom(false)
        onChange('')
      }
      return
    }

    const standardValues = selectedValues.filter(v => question.options.find(o => o.id === v))
    const trimmed = customValue.trim()
    if (trimmed) {
      onChange([...standardValues, trimmed].join(' | '))
    } else {
      onChange(standardValues.join(' | '))
    }
  }

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCustomSubmit()
      // e.target.blur() // optional, maybe just saving is enough "salve e ele continue"
    }
  }

  const toggleCustom = () => {
    if (question.multiple === false) {
      if (isCustom) {
        setIsCustom(false)
        setCustomValue('')
        onChange('')
      } else {
        setIsCustom(true)
        onChange('')
      }
      return
    }

    if (isCustom) {
      setIsCustom(false)
      setCustomValue('')
      const standardValues = selectedValues.filter(v => question.options.find(o => o.id === v))
      onChange(standardValues.join(' | '))
    } else {
      setIsCustom(true)
    }
  }

  if (question.id === 'concorrentes') {
    return (
      <div className="mb-10 last:mb-0">
        <div className="mb-4">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{question.title}</h4>
          {question.subtitle && <p className="text-sm text-slate-500 dark:text-white/60">{question.subtitle}</p>}
        </div>
        <div className="space-y-3">
          {concorrentesInputs.map((val, idx) => (
             <div key={idx} className="flex gap-3 items-center">
                 <span className="text-slate-400 dark:text-white/40 font-bold text-sm w-4 text-right">{idx + 1}.</span>
                 <input 
                   type="text" 
                   value={val} 
                   onChange={(e) => handleConcorrentesChange(idx, e.target.value)}
                   onBlur={handleConcorrentesBlur}
                   onKeyDown={(e) => e.key === 'Enter' && handleConcorrentesBlur()}
                   placeholder={`Nome ou @ do perfil de referência ${idx + 1}`}
                   className="flex-1 bg-black/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl px-4 py-3 focus-visible:ring-0 focus-visible:border-[#0ea5e9] outline-none transition-all text-slate-900 dark:text-white text-sm"
                 />
             </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10 last:mb-0">
      <div className="mb-4">
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {question.title}
        </h4>
        {question.subtitle && (
          <p className="text-sm text-slate-500 dark:text-white/60">
            {question.subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {question.options.map(opt => {
          const isSelected = selectedValues.includes(opt.id)
          return (
            <div
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-start gap-2 ${
                isSelected
                  ? 'border-[#0ea5e9] bg-[#0ea5e9]/10 shadow-[0_0_15px_rgba(14,165,233,0.15)] ring-1 ring-[#0ea5e9]/20 scale-[0.98]'
                  : 'border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/5'
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`size-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  isSelected ? 'bg-[#0ea5e9] text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/50'
                }`}>
{opt.icon ? <DynamicIcon name={opt.icon} size={14} /> : isSelected ? <Check size={14} /> : <Circle size={14} />}
                </div>
                <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-[#0ea5e9]' : 'text-slate-700 dark:text-white/80'}`}>
                  {opt.label}
                </span>
              </div>
            </div>
          )
        })}

        {question.allowCustom && (
          <div
            onClick={toggleCustom}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-start gap-2 ${
              isCustom
                ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/20 scale-[0.98]'
                : 'border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`size-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                isCustom ? 'bg-violet-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/50'
              }`}>
                {isCustom ? <Pencil size={14} /> : <Plus size={14} />}
              </div>
              <span className={`text-sm font-bold leading-tight ${isCustom ? 'text-violet-500' : 'text-slate-700 dark:text-white/80'}`}>
                Personalizado
              </span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20 flex gap-3">
              <FileEdit size={18} className="text-violet-400 mt-2" />
              <textarea
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
                onBlur={handleCustomSubmit}
                onKeyDown={handleCustomKeyDown}
                autoFocus
                placeholder="Escreva livremente aqui e pressione Enter para salvar..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none text-slate-900 dark:text-white resize-none min-h-[60px]"
                rows={3}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
