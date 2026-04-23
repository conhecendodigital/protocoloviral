'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Menu, LogOut, Home, Clapperboard, FileEdit, Bot, MonitorPlay,
  FileText, Anchor, Camera, BarChart3, Calculator, User, Compass,
  Calendar, Mic2, Crown, ChevronDown, Map
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  badgeHot?: boolean
}

interface NavSection {
  id: string
  label: string
  icon: LucideIcon
  collapsible?: boolean
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'menu',
    label: 'Menu',
    icon: Menu,
    collapsible: false,
    items: [
      { label: 'Início', href: '/', icon: Home },
      { label: 'Formatos', href: '/formatos', icon: Clapperboard, badge: 'HOT', badgeHot: true },
      { label: 'Roteirista', href: '/roteirista', icon: FileEdit, badge: 'NEW', badgeHot: true },
      { label: 'Escritório de IA', href: '/agentes', icon: Bot, badge: 'IA', badgeHot: true },
    ],
  },
  {
    id: 'estudio',
    label: 'Estúdio',
    icon: MonitorPlay,
    collapsible: true,
    items: [
      { label: 'Jornada',       href: '/jornada',      icon: Compass },
      { label: 'Rotina',        href: '/rotina',       icon: Calendar },
      { label: 'Meus Roteiros', href: '/roteiros',     icon: FileText },
      { label: 'Analisador',    href: '/bio-analyzer', icon: BarChart3 },
      { label: 'Ganchos Virais', href: '/ganchos',    icon: Anchor, badge: '100' },
      // { label: 'Stories',     href: '/stories',      icon: Camera },      // oculto
      // { label: 'Calculadora', href: '/calculadora',  icon: Calculator },  // oculto
      // { label: 'Meu Perfil',  href: '/perfil',       icon: User },        // oculto
    ],
  },
  {
    id: 'voz',
    label: 'Tom de Voz',
    icon: Mic2,
    collapsible: false,
    items: [
      { label: 'Tom de Voz', href: '/tom-de-voz', icon: Mic2, badge: 'NEW', badgeHot: true },
    ],
  },
  {
    id: 'assinatura',
    label: 'Premium',
    icon: Crown,
    collapsible: false,
    items: [
      { label: 'Assinatura', href: '/assinatura', icon: Crown, badge: 'PRO', badgeHot: true },
    ],
  },
]

// Supabase client outside component
const supabase = createClient()

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isInsideEstudio = NAV_SECTIONS
    .find(s => s.id === 'estudio')
    ?.items.some(item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    estudio: isInsideEstudio || false,
  })

  useEffect(() => {
    if (isInsideEstudio) setExpandedSections(prev => ({ ...prev, estudio: true }))
  }, [isInsideEstudio])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
        <Menu size={20} className="text-slate-700 dark:text-white/80" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-slate-50 dark:bg-gradient-to-b dark:from-[#0B0F19] dark:to-black border-slate-200 dark:border-white/[0.08] p-0">

        {/* ── Logo unificado com Sidebar ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="size-9 bg-[#0ea5e9] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#0ea5e9]/20">
            <Map size={18} />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Mapa do Engajamento
          </span>
        </div>

        {/* ── Nav ── */}
        <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {NAV_SECTIONS.map(section => {
            const SectionIcon = section.icon
            return (
              <div key={section.id} className="mb-1">
                {section.collapsible ? (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm',
                      expandedSections[section.id]
                        ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5'
                        : 'text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    )}
                  >
                    <SectionIcon size={18} className="shrink-0" />
                    <span className="font-semibold flex-1 text-left">{section.label}</span>
                    <ChevronDown size={14} className={cn('transition-transform duration-200 shrink-0', expandedSections[section.id] && 'rotate-180')} />
                  </button>
                ) : (
                  <div className="px-3 pt-3 pb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">{section.label}</span>
                  </div>
                )}

                {(!section.collapsible || expandedSections[section.id]) && (
                  <div className={cn('space-y-0.5', section.collapsible && 'pl-2 ml-2 border-l border-slate-200 dark:border-white/10 animate-in slide-in-from-top-2 fade-in duration-200')}>
                    {section.items.map(item => {
                      const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                      const ItemIcon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                            isActive
                              ? 'bg-[#0ea5e9]/15 text-[#0ea5e9]'
                              : 'text-slate-700 dark:text-white/80 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5'
                          )}
                        >
                          {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0ea5e9] rounded-full" />}
                          <ItemIcon size={18} className="shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0',
                              item.badgeHot
                                ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white'
                                : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white/70'
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
            )
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#0B0F19]">
          <ThemeToggle className="shrink-0" />
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
            className="flex flex-1 items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
