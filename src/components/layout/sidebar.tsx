'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState, useEffect } from 'react'

interface NavItem {
  label: string
  href: string
  icon?: string
  badge?: string
  badgeHot?: boolean
}

interface NavSection {
  id: string
  label: string
  icon: string
  collapsible?: boolean
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'menu',
    label: 'Menu',
    icon: 'menu',
    collapsible: false,
    items: [
      { label: 'Início', href: '/', icon: 'home' },
      { label: 'Formatos', href: '/formatos', icon: 'movie_filter', badge: '🔥', badgeHot: true },
      { label: 'Roteirista', href: '/roteirista', icon: 'edit_note', badge: '⭐', badgeHot: true },
      { label: 'Escritório de IA', href: '/agentes', icon: 'smart_toy', badge: 'IA', badgeHot: true },
    ],
  },
  {
    id: 'estudio',
    label: 'Estúdio',
    icon: 'tv_gen',
    collapsible: true,
    items: [
      { label: 'Meus Roteiros', href: '/roteiros', icon: 'description' },
      { label: 'Ganchos Virais', href: '/ganchos', icon: 'anchor', badge: '50' },
      { label: 'Stories', href: '/stories', icon: 'video_camera_front' },
      { label: 'Analisador', href: '/bio-analyzer', icon: 'monitoring' },
      { label: 'Calculadora', href: '/calculadora', icon: 'calculate' },
      { label: 'Meu Perfil', href: '/perfil', icon: 'person' },
      { label: 'Jornada', href: '/jornada', icon: 'explore' },
      { label: 'Rotina', href: '/rotina', icon: 'calendar_today' },
    ],
  },
  {
    id: 'voz',
    label: 'Tom de Voz',
    icon: 'record_voice_over',
    collapsible: false,
    items: [
      { label: 'Tom de Voz', href: '/tom-de-voz', icon: 'record_voice_over', badge: '⭐', badgeHot: true },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const { profile } = useProfile()

  // Check if current route is inside a section to auto-expand it
  const isInsideEstudio = NAV_SECTIONS
    .find(s => s.id === 'estudio')
    ?.items.some(item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    estudio: isInsideEstudio || false,
  })

  // Auto-expand when navigating into an estudio page
  useEffect(() => {
    if (isInsideEstudio) {
      setExpandedSections(prev => ({ ...prev, estudio: true }))
    }
  }, [isInsideEstudio])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const getDisplayName = () => {
    if (profile?.nome_completo) return profile.nome_completo
    if (!profile?.email) return 'Usuário'
    return profile.email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase())
  }

  const getInitials = () => {
    const name = profile?.nome_completo || profile?.email?.split('@')[0] || 'U'
    const parts = name.split(/[\s.]+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-4 px-3 py-3 rounded-xl transition-all",
          isActive 
            ? "bg-[#0ea5e9]/20 text-[#0ea5e9]"
            : "text-slate-800 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
        )}
      >
        <span className={cn("material-symbols-outlined", isActive && "fill-1")}>
          {item.icon}
        </span>
        <span className="font-medium hidden lg:block flex-1 whitespace-nowrap">{item.label}</span>
        
        {item.badge && (
          <span className={cn(
            "hidden lg:block px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
            item.badgeHot
              ? "bg-gradient-to-r from-amber-500 to-red-500 text-slate-900 dark:text-white animate-pulse"
              : "bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white/80"
          )}>
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className={cn("hidden lg:flex w-20 lg:w-64 flex-col border-r border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-gradient-to-b dark:from-[#0B0F19] dark:to-black backdrop-blur-md shrink-0 transition-all z-40", className)}>
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-[#0ea5e9] rounded-lg flex items-center justify-center text-slate-900 dark:text-white shrink-0 shadow-lg shadow-[#0ea5e9]/20">
          <span className="material-symbols-outlined">map</span>
        </div>
        <span className="font-bold text-lg tracking-tight hidden lg:block text-slate-900 dark:text-white">Mapa do Engajamento</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto">
        {NAV_SECTIONS.map(section => (
          <div key={section.id}>
            {/* Section Header (collapsible) */}
            {section.collapsible ? (
              <button
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                  expandedSections[section.id]
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {section.icon}
                </span>
                <span className="font-semibold text-sm hidden lg:block flex-1 text-left">
                  {section.label}
                </span>
                <span className={cn(
                  "material-symbols-outlined text-[18px] hidden lg:block transition-transform duration-200",
                  expandedSections[section.id] ? "rotate-180" : ""
                )}>
                  expand_more
                </span>
              </button>
            ) : (
              <div className="px-3 pt-2 pb-1 hidden lg:block">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">
                  {section.label}
                </span>
              </div>
            )}

            {/* Section Items */}
            {(!section.collapsible || expandedSections[section.id]) && (
              <div className={cn(
                "space-y-1",
                section.collapsible && "lg:pl-2 lg:ml-2 lg:border-l lg:border-slate-200 dark:lg:border-white/10",
                section.collapsible && "animate-in slide-in-from-top-2 fade-in duration-200"
              )}>
                {section.items.map(renderNavItem)}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        {/* Theme Toggle */}
        <div className="flex justify-center lg:justify-start">
          <ThemeToggle />
        </div>

        {/* Support Box */}
        <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl hidden lg:block border border-slate-200 dark:border-white/10">
          <p className="text-xs font-semibold text-[#0ea5e9] uppercase tracking-widest mb-2">Suporte</p>
          <p className="text-xs text-slate-800 dark:text-white/90 leading-relaxed">Precisa de ajuda com sua estratégia?</p>
          <button className="mt-3 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 hover:underline">
            Abrir Ticket <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* User Profile + Logout */}
        <div className="flex items-center gap-3 lg:px-2 pt-2">
          {/* Avatar */}
          <Link href="/perfil" className="shrink-0">
            <div className="size-10 rounded-full overflow-hidden ring-2 ring-[#0ea5e9]/20 hover:ring-[#0ea5e9]/50 transition-all">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} width={40} height={40} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#0ea5e9] to-indigo-500 flex items-center justify-center">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{getInitials()}</span>
                </div>
              )}
            </div>
          </Link>

          {/* Name + Sair */}
          <div className="hidden lg:flex flex-1 items-center justify-between min-w-0">
            <Link href="/perfil" className="truncate">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-[#0ea5e9] transition-colors">{getDisplayName()}</p>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-slate-700 dark:text-white/90 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10 shrink-0"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
