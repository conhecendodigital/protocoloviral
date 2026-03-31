'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={cn('size-9 sm:size-10 rounded-full bg-slate-200/5 dark:bg-black/5 dark:bg-white/5 animate-pulse', className)} />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        "relative size-9 sm:size-10 rounded-full flex items-center justify-center transition-all border",
        theme === 'dark'
          ? "bg-slate-200/5 dark:bg-black/5 dark:bg-white/5 text-slate-800 dark:text-white/90 hover:text-foreground dark:text-slate-900 dark:text-white border-slate-300/10 dark:border-slate-300/10 dark:border-slate-200 dark:border-white/10 hover:border-slate-300/20 dark:border-slate-300/20 dark:border-white/20"
          : "bg-slate-100/50 text-slate-800 dark:text-white/90 hover:text-sky-600 border-slate-200 hover:border-sky-200",
        className
      )}
      aria-label="Toggle theme"
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === 'dark' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  )
}
