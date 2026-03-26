'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Menu, LogOut } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Início', href: '/', msIcon: 'home' },
  { label: 'Meu Perfil', href: '/perfil', msIcon: 'person' },
  { label: 'Minha Jornada', href: '/jornada', msIcon: 'explore' },
  { label: 'Geradores', href: '/prompts', msIcon: 'auto_awesome' },
  { label: 'Formatos', href: '/formatos', msIcon: 'movie_filter' },
  { label: 'Ganchos Virais', href: '/ganchos', msIcon: 'anchor' },
  { label: 'Rotina Semanal', href: '/rotina', msIcon: 'calendar_today' },
  { label: 'Stories', href: '/stories', msIcon: 'video_camera_front' },
  { label: 'Analisar Bio', href: '/bio-analyzer', msIcon: 'monitoring' },
]

export function MobileNav() {
  const pathname = usePathname()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors">
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gradient-sidebar border-slate-800 p-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-sky-400 to-violet-500 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
          <span className="text-xs font-extrabold text-white tracking-wider uppercase">
            Mapa do Engajamento
          </span>
        </div>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive ? "bg-linear-to-r from-sky-500/20 to-violet-500/20 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}>
                <span className="material-symbols-outlined text-xl">{item.msIcon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
