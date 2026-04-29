import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export function LandingNav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#080b12]/70 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex justify-between items-center px-6 md:px-10 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#6d28d9] flex items-center justify-center shadow-lg shadow-[#0ea5e9]/20">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-black tracking-tight text-white">
            Mapa do <span className="text-[#0ea5e9]">Engajamento</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            ['#como-funciona', 'O sistema'],
            ['#ferramentas', 'Ferramentas'],
            ['#depoimentos', 'Resultados'],
            ['#precos', 'Planos'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-sm font-medium text-white/50 hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block text-sm font-semibold text-white/40 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link
            href="/login?mode=signup"
            className="bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-[#0ea5e9]/20"
          >
            Começar agora
          </Link>
        </div>
      </div>
    </nav>
  )
}
