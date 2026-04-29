import Link from 'next/link'
import { Zap } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#060810] py-14 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#6d28d9] flex items-center justify-center">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <span className="text-[15px] font-black text-white">
                Mapa do <span className="text-[#0ea5e9]">Engajamento</span>
              </span>
            </div>
            <p className="text-sm text-white/35 leading-relaxed">
              Roteirista IA para criadores de conteúdo que querem crescer com intenção, não com sorte.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Plataforma</p>
              <ul className="space-y-3">
                {[
                  ['#como-funciona', 'Como funciona'],
                  ['#ferramentas', 'Ferramentas'],
                  ['#precos', 'Preços'],
                ].map(([href, label]) => (
                  <li key={label}>
                    <a href={href} className="text-sm text-white/45 hover:text-white transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Conta</p>
              <ul className="space-y-3">
                {[
                  ['/login', 'Entrar'],
                  ['/login?mode=signup', 'Criar conta grátis'],
                ].map(([href, label]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-white/45 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Legal</p>
              <ul className="space-y-3">
                {[
                  ['/termos', 'Termos de Uso'],
                  ['/privacidade', 'Privacidade'],
                  ['mailto:suporte@mapadoengajamento.com.br', 'Suporte'],
                ].map(([href, label]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-white/45 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Mapa do Engajamento. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/20">
            Feito com IA, testado com criadores reais.
          </p>
        </div>
      </div>
    </footer>
  )
}
