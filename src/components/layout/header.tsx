'use client'

import { MobileNav } from './mobile-nav'
import { useProfile } from '@/hooks/use-profile'
import { getNivelByXP, getProgressoNivel } from '@/data/niveis'
import Link from 'next/link'

interface HeaderProps {
  title?: string
  subtitle?: string
  hideOnDesktop?: boolean
  className?: string
}

export function Header({ title, subtitle, hideOnDesktop = false, className = '' }: HeaderProps) {
  const { profile, loading, getCompletionPercent } = useProfile()
  
  const xp = profile?.xp || 0
  const nivel = getNivelByXP(xp)
  const progresso = getProgressoNivel(xp)
  const completion = getCompletionPercent()

  return (
    <header className={`glass-header px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between ${hideOnDesktop ? 'lg:hidden' : ''} ${className}`}>
      <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0">
        <MobileNav />
        
        {/* Level Progress (hidden on mobile) */}
        <div className="hidden md:flex flex-col min-w-[200px]">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0ea5e9]">
              {loading ? '...' : `Nível ${nivel.nivel}`}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {loading ? '' : `${xp} / ${nivel.xp_max} XP`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-[#0ea5e9] rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
              style={{ width: `${Math.max(progresso, 2)}%` }}
            ></div>
          </div>
        </div>

        {/* Optional Page Title */}
        {title && (
          <div className="ml-2 sm:ml-4 min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white truncate">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-slate-400 truncate">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Compact Profile Completion Ring */}
        <Link href="/perfil" className="flex items-center gap-2 group" title={`Perfil ${completion}% completo`}>
          <div className="relative size-9 sm:size-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle className="text-white/5" cx="18" cy="18" fill="transparent" r="15" stroke="currentColor" strokeWidth="3"></circle>
              <circle 
                className="transition-all duration-1000 ease-out"
                cx="18" cy="18" fill="transparent" r="15" 
                stroke={completion === 100 ? '#10b981' : '#f59e0b'}
                strokeDasharray="94.2" 
                strokeDashoffset={94.2 - (94.2 * completion) / 100} 
                strokeWidth="3"
                strokeLinecap="round"
              ></circle>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white group-hover:text-[#0ea5e9] transition-colors">
              {completion}%
            </span>
          </div>
        </Link>

        {/* Bell */}
        <button className="size-9 sm:size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-white/10">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>

        {/* Ver Perfil Button (desktop only) */}
        <Link href="/perfil" className="hidden sm:block px-5 py-2 rounded-full shimmer-btn text-white text-sm font-bold tracking-tight shadow-lg shadow-[#0ea5e9]/20">
          Ver Perfil
        </Link>
      </div>
    </header>
  )
}

