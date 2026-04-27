'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Settings, Crown, LogOut,
  Moon, Sun, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const supabase = createClient()

interface SidebarAvatarMenuProps {
  hovered?: boolean
  isHeader?: boolean
}

export function SidebarAvatarMenu({ hovered = true, isHeader = false }: SidebarAvatarMenuProps) {
  const { profile } = useProfile()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isDark = theme === 'dark'

  // Fecha ao clicar fora
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // Fecha automaticamente quando a sidebar colapsa
  useEffect(() => {
    if (!hovered) setOpen(false)
  }, [hovered])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getDisplayName = () => {
    if (profile?.nome_completo) return profile.nome_completo.split(' ')[0]
    if (!profile?.email) return 'Usuário'
    return profile.email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase())
  }

  const getInitials = () => {
    const name = profile?.nome_completo || profile?.email?.split('@')[0] || 'U'
    const parts = name.split(/[\s.]+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const MENU_ITEMS = [
    { label: 'Meu Perfil',     href: '/perfil',        icon: User },
    { label: 'Configurações',  href: '/configuracoes',  icon: Settings },
    { label: 'Assinatura',     href: '/assinatura',     icon: Crown },
  ]

  return (
    <div ref={menuRef} className="relative">

      {/* ── Pop-up menu (acima do avatar) ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: isHeader ? -8 : 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isHeader ? -8 : 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute z-50 min-w-[196px]',
              isHeader ? 'top-full mt-2 right-0' : 'bottom-full mb-2',
              !isHeader && (hovered ? 'left-0' : 'left-1/2 -translate-x-1/2')
            )}
          >
            <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl shadow-black/20 backdrop-blur-xl">

              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {getDisplayName()}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-white/40 truncate">
                  {profile?.email}
                </p>
              </div>

              {/* Navigation links */}
              <div className="p-1.5 space-y-0.5">
                {MENU_ITEMS.map(item => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white transition-all duration-150"
                    >
                      <Icon size={16} className="shrink-0 text-slate-400 dark:text-white/40" />
                      {item.label}
                    </Link>
                  )
                })}

                {/* Theme toggle row */}
                <button
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white transition-all duration-150"
                >
                  {isDark
                    ? <Sun size={16} className="shrink-0 text-amber-400" />
                    : <Moon size={16} className="shrink-0 text-slate-400" />
                  }
                  <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
                  {/* Visual toggle pill */}
                  <span className={cn(
                    'ml-auto w-8 h-4.5 rounded-full flex items-center transition-colors duration-200 px-0.5',
                    isDark ? 'bg-[#0ea5e9]' : 'bg-slate-200'
                  )}>
                    <span className={cn(
                      'w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200',
                      isDark ? 'translate-x-3.5' : 'translate-x-0'
                    )} />
                  </span>
                </button>
              </div>

              {/* Divider + Sair */}
              <div className="p-1.5 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-150"
                >
                  <LogOut size={16} className="shrink-0" />
                  Sair
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Avatar trigger ── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-200',
          !isHeader && 'hover:bg-slate-100 dark:hover:bg-white/5',
          !isHeader && open && 'bg-slate-100 dark:bg-white/5'
        )}
      >
        {/* Avatar */}
        <div className="size-9 rounded-full overflow-hidden ring-2 ring-[#0ea5e9]/20 hover:ring-[#0ea5e9]/50 transition-all shrink-0">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} width={36} height={36} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#0ea5e9] to-indigo-500 flex items-center justify-center">
              <span className="text-[11px] font-black text-white">{getInitials()}</span>
            </div>
          )}
        </div>

        {/* Name + email (só aparece quando sidebar expandida) */}
        {hovered && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
              {getDisplayName()}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/40 truncate leading-tight">
              {profile?.email}
            </p>
          </div>
        )}

        {/* Chevron indicator */}
        {hovered && (
          <ChevronUp
            size={14}
            className={cn(
              'shrink-0 text-slate-400 transition-transform duration-200',
              !open && 'rotate-180'
            )}
          />
        )}
      </button>

    </div>
  )
}
