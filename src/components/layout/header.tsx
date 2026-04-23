'use client'

import { MobileNav } from './mobile-nav'
import { useProfile } from '@/hooks/use-profile'
import { getNivelByXP, getProgressoNivel } from '@/data/niveis'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationPanel } from '@/components/shared/NotificationPanel'
import Link from 'next/link'

interface HeaderProps {
  title?: string
  subtitle?: string
  hideOnDesktop?: boolean
  className?: string
}

export function Header({ title, subtitle, hideOnDesktop = false, className = '' }: HeaderProps) {
  const { profile, loading, getCompletionPercent, userId } = useProfile()
  
  const xp = profile?.xp || 0
  const nivel = getNivelByXP(xp)
  const progresso = getProgressoNivel(xp)
  const completion = getCompletionPercent()

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({
    completion,
    hasAvatar: !!profile?.avatar_url,
    userName: profile?.nome_completo || '',
    onboardingCompleted: !!profile?.onboarding_completed,
    xp,
    level: nivel.nivel,
    conquistasCount: profile?.conquistas?.length || 0,
    userId,
  })

  return (
    <header className={`glass-header px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between ${hideOnDesktop ? 'lg:hidden' : ''} ${className}`}>
      <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0">
        <MobileNav />
        
        {/* Level Progress (hidden on mobile) */}
        <div className="hidden md:flex flex-col min-w-[200px]">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#0ea5e9]">
              {loading ? '...' : `Nível ${nivel.nivel}`}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-white/70">
              {loading ? '' : `${xp.toLocaleString()} / ${nivel.xp_max.toLocaleString()} XP`}
            </span>
          </div>
          <div className="h-2.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                width: `${Math.max(progresso, 2)}%`,
                background: completion === 100
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #0ea5e9, #8b5cf6)',
              }}
            />
          </div>
        </div>

        {/* Optional Page Title */}
        {title && (
          <div className="ml-2 sm:ml-4 min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-slate-800 dark:text-white/90 truncate">{subtitle}</p>}
          </div>
        )}
      </div>

        {/* Notification Bell + Panel */}
        <NotificationPanel 
          notifications={notifications}
          unreadCount={unreadCount}
          onRead={markAsRead}
          onReadAll={markAllAsRead}
        />
      </div>
    </header>
  )
}

