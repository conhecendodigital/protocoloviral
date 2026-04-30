import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: 'R$0',
    period: 'pra começar',
    cta: 'Criar conta grátis',
    href: '/login?mode=signup',
    accent: 'white',
    items: [
      '5 roteiros por dia',
      'Biblioteca de formatos completa',
      'Banco de ganchos virais',
      'Jornada de conteúdo',
    ],
    limit: 'Limite de 5 usos por dia.',
    primary: false,
  },
  {
    name: 'Pro',
    price: 'R$47',
    period: 'por mês',
    cta: 'Quero usar sem limite',
    href: '/login?mode=signup&plan=pro',
    accent: '#0ea5e9',
    items: [
      'Roteiros ilimitados',
      'Biblioteca de formatos completa',
      'Analisar qualquer vídeo viral',
      'Tom de voz personalizado',
      'Agentes especialistas por nicho',
      'Banco de ganchos virais',
      'Jornada de conteúdo',
      'Rotina semanal NOEIXO',
    ],
    limit: null,
    primary: true,
  },
]

export function LandingPricing() {
  return (
    <section id="precos" className="max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-4">Planos</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Simples. Sem enrolação.
        </h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Comece grátis. Se sentir que precisa de mais, assina. 7 dias de garantia incondicional. Não funcionou, devolve o dinheiro sem pergunta.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {PLANS.map(p => (
          <div
            key={p.name}
            className={`relative rounded-3xl p-8 flex flex-col ${p.primary ? 'bg-gradient-to-b from-[#0ea5e9]/15 to-[#0ea5e9]/5 border-2 border-[#0ea5e9]/40' : 'bg-white/[0.04] border border-white/[0.08]'}`}
          >
            {p.primary && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0ea5e9] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                Mais escolhido
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-widest text-white/40 mb-2">{p.name}</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">{p.price}</span>
                <span className="text-white/40 text-sm mb-1">{p.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {p.items.map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                  <Check size={14} className="text-[#0ea5e9] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {p.limit && (
              <p className="text-[11px] text-white/30 mb-4 font-medium">{p.limit}</p>
            )}

            <Link
              href={p.href}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${p.primary ? 'bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90 shadow-lg shadow-[#0ea5e9]/25' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'}`}
            >
              {p.cta}
              <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-white/25 text-xs font-medium mt-8">
        Cancela quando quiser. Sem multa. Sem formulário. Garantia de 7 dias.
      </p>
    </section>
  )
}
