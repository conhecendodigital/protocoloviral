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
  const { profile, loading } = useProfile()
  
  const xp = profile?.xp || 0
  const nivel = getNivelByXP(xp)
  const progresso = getProgressoNivel(xp)

  return (
    <header className={`glass-header px-6 py-4 flex items-center justify-between ${hideOnDesktop ? 'lg:hidden' : ''} ${className}`}>
      <div className="flex items-center gap-8 flex-1">
        <MobileNav />
        
        {/* Level Progress (hidden on strictly mobile) */}
        <div className="hidden md:flex flex-col min-w-[240px]">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0ea5e9]">
              {loading ? 'Carregando...' : `Nível ${nivel.nivel}`}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {loading ? '-- / -- XP' : `${xp} / ${nivel.xp_max} XP`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-[#0ea5e9] rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
              style={{ width: `${Math.max(progresso, 2)}%` }}
            ></div>
          </div>
        </div>

        {/* Optional Page Title (used when needed) */}
        {title && (
          <div className="ml-4">
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-white/10">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <Link href="/perfil" className="hidden sm:block px-6 py-2.5 rounded-full shimmer-btn text-white text-sm font-bold tracking-tight shadow-lg shadow-[#0ea5e9]/20">
          Ver Perfil
        </Link>
      </div>
    </header>
  )
}
