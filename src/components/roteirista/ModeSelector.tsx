'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

export type RoteiroMode = 'fast' | 'premium' | 'search'

interface Props {
  selected: RoteiroMode
  onSelect: (m: RoteiroMode) => void
  disabled?: boolean
}

export function ModeSelector({ selected, onSelect, disabled }: Props) {
  const modes = [
    {
      id: 'fast',
      icon: 'bolt',
      title: 'Modo Rápido',
      desc: 'GPT-4o-Mini • Geração expressa',
      color: 'text-amber-500',
      bgClass: 'hover:border-amber-500/50',
      activeClass: 'border-amber-500 ring-1 ring-amber-500 bg-amber-500/5 dark:bg-amber-500/10'
    },
    {
      id: 'premium',
      icon: 'diamond',
      title: 'Estratégico Premium',
      desc: 'Claude 3.5 Sonnet • Alta profundidade',
      color: 'text-violet-500',
      bgClass: 'hover:border-violet-500/50',
      activeClass: 'border-violet-500 ring-1 ring-violet-500 bg-violet-500/5 dark:bg-violet-500/10'
    },
    {
      id: 'search',
      icon: 'travel_explore',
      title: 'Baseado na Web',
      desc: 'Anti-alucinação • Fatos em tempo real',
      color: 'text-emerald-500',
      bgClass: 'hover:border-emerald-500/50',
      activeClass: 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {modes.map(mode => {
        const isActive = selected === mode.id
        return (
          <button
            key={mode.id}
            disabled={disabled}
            onClick={() => onSelect(mode.id as RoteiroMode)}
            className={cn(
              "relative p-4 rounded-2xl border text-left transition-all duration-300 disabled:opacity-50",
              isActive ? mode.activeClass : "border-slate-200 dark:border-white/10 dark:hover:border-white/20 bg-white dark:bg-black/40",
              !isActive && mode.bgClass
            )}
          >
            {isActive && (
              <motion.div layoutId="mode-sel-bg" className="absolute inset-0 rounded-2xl opacity-50 pointer-events-none" />
            )}
            <DynamicIcon name={mode.icon} size={30} className={cn("mb-3 block", mode.color)} />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {mode.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-white/60 mt-1 font-medium">
              {mode.desc}
            </p>
          </button>
        )
      })}
    </div>
  )
}
