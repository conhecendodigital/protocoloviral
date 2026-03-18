'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

// Using Material Icons strings instead of Lucide icons to match Stitch UI
interface NavItem {
  label: string
  href: string
  icon?: string
  badge?: string
  badgeHot?: boolean
  section: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: 'home', section: 'Menu' },
  { label: 'Jornada', href: '/jornada', icon: 'explore', badge: '🎮', badgeHot: true, section: 'Menu' },
  { label: 'Geradores', href: '/prompts', icon: 'auto_awesome', section: 'Ferramentas' },
  { label: 'Formatos', href: '/formatos', icon: 'movie_filter', badge: '🔥', badgeHot: true, section: 'Ferramentas' },
  { label: 'Ganchos Virais', href: '/ganchos', icon: 'anchor', badge: '50', section: 'Ferramentas' },
  { label: 'Stories', href: '/stories', icon: 'video_camera_front', badge: '🔥', badgeHot: true, section: 'Ferramentas' },
  { label: 'Rotina', href: '/rotina', icon: 'calendar_today', section: 'Ferramentas' },
  { label: 'Analisador', href: '/bio-analyzer', icon: 'monitoring', badge: 'Novo', section: 'Ferramentas' },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className={cn("hidden lg:flex w-20 lg:w-64 flex-col border-r border-white/5 bg-black/50 backdrop-blur-md shrink-0 transition-all z-40", className)}>
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-[#0ea5e9] rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#0ea5e9]/20">
          <span className="material-symbols-outlined">map</span>
        </div>
        <span className="font-bold text-lg tracking-tight hidden lg:block text-white">Mapa do Engajamento</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-xl transition-all",
                isActive 
                  ? "bg-[#0ea5e9]/20 text-[#0ea5e9]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
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
                    ? "bg-gradient-to-r from-amber-500 to-red-500 text-white animate-pulse"
                    : "bg-white/10 text-white/70"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        {/* Support Box */}
        <div className="bg-white/5 p-4 rounded-xl hidden lg:block border border-white/5">
          <p className="text-xs font-semibold text-[#0ea5e9] uppercase tracking-widest mb-2">Suporte</p>
          <p className="text-xs text-slate-400 leading-relaxed">Precisa de ajuda com sua estratégia?</p>
          <button className="mt-3 text-xs font-bold text-white flex items-center gap-1 hover:underline">
            Abrir Ticket <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* Profile / Logout */}
        <div className="flex items-center gap-3 lg:px-2 pt-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
          >
            <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 ring-2 ring-[#0ea5e9]/20 hover:bg-slate-700">
               <span className="material-symbols-outlined">logout</span>
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <p className="text-sm font-bold text-white">Sair da Conta</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Até logo</p>
            </div>
          </button>
        </div>
      </div>
    </aside>
  )
}
