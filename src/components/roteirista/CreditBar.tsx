'use client'

import { useCredits } from '@/hooks/use-credits'
import { AlertTriangle, Star } from 'lucide-react'

export function CreditBar() {
  const { availableCredits, isLoading } = useCredits()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 animate-pulse">
        <div className="w-4 h-4 bg-white/20 rounded-full" />
        <div className="h-4 w-16 bg-white/20 rounded" />
      </div>
    )
  }

  // Se = 0, avisa perigo.
  const isDanger = availableCredits === 0
  const isWarning = availableCredits > 0 && availableCredits <= 10

  return (
    <div className={`flex items-center gap-2 border rounded-full px-4 py-1.5 shadow-sm transition-colors
      ${isDanger ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' 
      : isWarning ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80'}`}
    >
      {isDanger ? <AlertTriangle size={18} /> : <Star size={18} />}
      <span className="text-xs font-bold font-mono">
        {availableCredits} CRÉDITOS
      </span>
    </div>
  )
}
