'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/use-profile'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState, useEffect, useRef } from 'react'
import {
  Home, Clapperboard, FileEdit, Bot, MonitorPlay,
  FileText, Anchor, Camera, BarChart3, Calculator, User, Compass,
  Calendar, Mic2, Crown, ChevronDown, LogOut, Mail, Map
} from 'lucide-react'
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
    icon: Home,
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
      { label: 'Jornada',      href: '/jornada',      icon: Compass },
      { label: 'Rotina',       href: '/rotina',       icon: Calendar },
      { label: 'Meus Roteiros', href: '/roteiros',    icon: FileText },
      { label: 'Analisador',   href: '/bio-analyzer', icon: BarChart3 },
      { label: 'Ganchos Virais', href: '/ganchos',   icon: Anchor, badge: '100' },
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

interface SidebarProps {
  className?: string
}

// Supabase client outside component
const supabase = createClient()

export function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()
  const { profile } = useProfile()
  const [hovered, setHovered] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setHovered(true)
  }

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(false), 120)
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
    const ItemIcon = item.icon

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item',
          isActive
            ? 'bg-[#0ea5e9]/15 text-[#0ea5e9]'
            : 'text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/6 hover:text-slate-900 dark:hover:text-white'
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0ea5e9] rounded-full" />
        )}

        <ItemIcon size={20} className="shrink-0" />

        <span className={cn(
          'font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-200',
          hovered ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
        )}>
          {item.label}
        </span>

        {item.badge && hovered && (
          <span className={cn(
            'ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0',
            item.badgeHot
              ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white'
              : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white/70'
          )}>
            {item.badge}
          </span>
        )}

        {/* Tooltip when collapsed */}
        {!hovered && (
          <span className="pointer-events-none absolute left-full ml-3 z-50 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity shadow-xl border border-white/10">
            {item.label}
            {item.badge && <span className="ml-1.5 text-amber-400">{item.badge}</span>}
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800" />
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r border-slate-200 dark:border-white/[0.08]',
        'bg-white/80 dark:bg-gradient-to-b dark:from-[#0B0F19] dark:to-black backdrop-blur-md shrink-0 z-40',
        'transition-all duration-200 ease-in-out',
        hovered ? 'w-60' : 'w-[72px]',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── LOGO ── */}
      <div className="h-16 flex items-center px-4 shrink-0 overflow-hidden transition-all duration-200">
        <div className="size-9 bg-[#0ea5e9] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#0ea5e9]/20">
          <Map size={18} />
        </div>
        <span className={cn(
          'ml-3 font-bold text-sm tracking-tight text-slate-900 dark:text-white whitespace-nowrap overflow-hidden transition-all duration-200',
          hovered ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
        )}>
          Mapa do Engajamento
        </span>
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_SECTIONS.map(section => {
          const SectionIcon = section.icon
          return (
            <div key={section.id} className="mb-1">
              {section.id !== 'menu' && (
                <div className="px-3 pt-2 pb-1">
                  <div className="h-px bg-slate-200 dark:bg-white/5 transition-colors" />
                </div>
              )}

              {section.collapsible ? (
                <div>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      'w-full relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/toggle',
                      expandedSections[section.id]
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    )}
                  >
                    <SectionIcon size={20} className="shrink-0" />
                    <span className={cn(
                      'font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-200 text-left flex-1',
                      hovered ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0'
                    )}>
                      {section.label}
                    </span>
                    {hovered && (
                      <ChevronDown size={14} className={cn('shrink-0 transition-transform duration-200', expandedSections[section.id] && 'rotate-180')} />
                    )}
                    {!hovered && (
                      <span className="pointer-events-none absolute left-full ml-3 z-50 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover/toggle:opacity-100 transition-opacity shadow-xl border border-white/10">
                        {section.label}
                        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800" />
                      </span>
                    )}
                  </button>
                  {expandedSections[section.id] && (
                    <div className={cn('space-y-0.5 mt-0.5', hovered && 'pl-2')}>
                      {section.items.map(renderNavItem)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {section.items.map(renderNavItem)}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* ── FOOTER ── */}
      <div className="px-2 pb-4 space-y-2 shrink-0">
        <div className="flex justify-center px-1">
          <ThemeToggle />
        </div>

        {hovered && (
          <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Suporte</p>
            <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed mb-2">Precisa de ajuda?</p>
            <a
              href="mailto:suporte@protocoloviral.com.br?subject=Suporte Roteirista VIP"
              className="text-xs font-bold text-[#0ea5e9] hover:underline flex items-center gap-1"
            >
              <Mail size={12} />
              Abrir Ticket
            </a>
          </div>
        )}

        <div className="flex items-center gap-2.5 px-1 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200">
          <Link href="/perfil" className="shrink-0">
            <div className="size-9 rounded-full overflow-hidden ring-2 ring-[#0ea5e9]/20 hover:ring-[#0ea5e9]/50 transition-all">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} width={36} height={36} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#0ea5e9] to-indigo-500 flex items-center justify-center">
                  <span className="text-[11px] font-black text-white">{getInitials()}</span>
                </div>
              )}
            </div>
          </Link>

          <div className={cn(
            'flex-1 min-w-0 overflow-hidden transition-all duration-200',
            hovered ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0'
          )}>
            <Link href="/perfil">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate hover:text-[#0ea5e9] transition-colors">
                {getDisplayName()}
              </p>
            </Link>
          </div>

          {hovered && (
            <button
              onClick={handleLogout}
              className="shrink-0 text-slate-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
