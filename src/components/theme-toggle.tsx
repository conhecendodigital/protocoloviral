'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={cn('size-9 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse', className)} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative size-9 rounded-full flex items-center justify-center transition-all border',
        isDark
          ? 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200',
        className
      )}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      {isDark
        ? <Moon size={16} />
        : <Sun size={16} />
      }
    </button>
  )
}
