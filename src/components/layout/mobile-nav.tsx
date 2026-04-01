'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Menu, LogOut } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

interface NavItem {
  label: string
  href: string
  msIcon: string
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
      { label: 'Início', href: '/', msIcon: 'home' },
      { label: 'Meu Perfil', href: '/perfil', msIcon: 'person' },
      { label: 'Minha Jornada', href: '/jornada', msIcon: 'explore' },
      { label: 'Geradores', href: '/prompts', msIcon: 'auto_awesome' },
      { label: 'Formatos', href: '/formatos', msIcon: 'movie_filter' },
      { label: 'Rotina Semanal', href: '/rotina', msIcon: 'calendar_today' },
    ],
  },
  {
    id: 'estudio',
    label: 'Estúdio',
    icon: 'tv_gen',
    collapsible: true,
    items: [
      { label: 'Meus Roteiros', href: '/roteiros', msIcon: 'description', badge: 'Novo' },
      { label: 'Ganchos Virais', href: '/ganchos', msIcon: 'anchor', badge: '50' },
      { label: 'Stories', href: '/stories', msIcon: 'video_camera_front', badge: '🔥', badgeHot: true },
      { label: 'Analisador', href: '/bio-analyzer', msIcon: 'monitoring', badge: 'Novo' },
      { label: 'Calculadora', href: '/calculadora', msIcon: 'calculate', badge: 'Novo' },
    ],
  },
  {
    id: 'ia',
    label: 'IA',
    icon: 'smart_toy',
    collapsible: false,
    items: [
      { label: 'Escritório de IA', href: '/agentes', msIcon: 'smart_toy', badge: 'IA', badgeHot: true },
    ],
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const isInsideEstudio = NAV_SECTIONS
    .find(s => s.id === 'estudio')
    ?.items.some(item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    estudio: isInsideEstudio || false,
  })

  useEffect(() => {
    if (isInsideEstudio) {
      setExpandedSections(prev => ({ ...prev, estudio: true }))
    }
  }, [isInsideEstudio])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors">
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-slate-50 dark:bg-gradient-to-b dark:from-[#0B0F19] dark:to-black border-slate-200 dark:border-slate-800 p-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-300/10 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-sky-400 to-violet-500 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-wider uppercase">
            Mapa do Engajamento
          </span>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {NAV_SECTIONS.map(section => (
            <div key={section.id}>
              {/* Section Header */}
              {section.collapsible ? (
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                    expandedSections[section.id]
                      ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5"
                      : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {section.icon}
                  </span>
                  <span className="font-semibold text-sm flex-1 text-left">
                    {section.label}
                  </span>
                  <span className={cn(
                    "material-symbols-outlined text-[18px] transition-transform duration-200",
                    expandedSections[section.id] ? "rotate-180" : ""
                  )}>
                    expand_more
                  </span>
                </button>
              ) : (
                <div className="px-3 pt-3 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">
                    {section.label}
                  </span>
                </div>
              )}

              {/* Section Items */}
              {(!section.collapsible || expandedSections[section.id]) && (
                <div className={cn(
                  "space-y-1",
                  section.collapsible && "pl-2 ml-2 border-l border-slate-200 dark:border-white/10",
                  section.collapsible && "animate-in slide-in-from-top-2 fade-in duration-200"
                )}>
                  {section.items.map(item => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                          isActive
                            ? "bg-linear-to-r from-sky-500/20 to-violet-500/20 text-slate-900 dark:text-white"
                            : "text-slate-800 dark:text-white/90 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5"
                        )}
                      >
                        <span className="material-symbols-outlined text-xl">{item.msIcon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                            item.badgeHot
                              ? "bg-gradient-to-r from-amber-500 to-red-500 text-white animate-pulse"
                              : "bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white/80"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 border-t border-slate-300/10 dark:border-white/10">
          <ThemeToggle className="shrink-0" />
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }} className="flex flex-1 items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-slate-900 dark:text-white hover:bg-slate-200/5 dark:bg-white/5">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
