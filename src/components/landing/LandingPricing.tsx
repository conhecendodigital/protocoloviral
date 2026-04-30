'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, Flame, Zap, Bot } from 'lucide-react'

type Ciclo = 'mensal' | 'semestral' | 'anual'

const CICLOS: { id: Ciclo; label: string; desc: string }[] = [
  { id: 'mensal', label: 'Mensal', desc: '' },
  { id: 'semestral', label: 'Semestral', desc: 'Economiza ~10%' },
  { id: 'anual', label: 'Anual', desc: 'Maior economia' },
]

interface PlanPrice {
  priceMonth: number
  totalLabel: string
  economy: string | null
  planId: string
}

const PLANS = [
  {
    key: 'mapa',
    name: 'Mapa do Engajamento',
    icon: null,
    desc: 'Biblioteca de formatos virais, roteirista IA e banco de ganchos. Tudo que você precisa pra criar com consistência.',
    badge: null,
    accent: '#0ea5e9',
    primary: false,
    items: [
      'Roteiros ilimitados',
      'Biblioteca de formatos virais',
      'Analisar vídeos virais',
      'Tom de voz personalizado',
      'Banco de ganchos virais',
      'Jornada de conteúdo',
      'Rotina semanal NOEIXO',
    ],
    prices: {
      mensal: { priceMonth: 97, totalLabel: 'R$97/mês', economy: null, planId: 'mensal' },
      semestral: { priceMonth: 87, totalLabel: 'R$522 a cada 6 meses', economy: 'Economiza R$60 no semestre', planId: 'semestral' },
      anual: { priceMonth: 77, totalLabel: 'R$924/ano', economy: 'Economiza R$240 por ano', planId: 'anual' },
    } as Record<Ciclo, PlanPrice>,
    cta: 'Começar agora',
    href: (planId: string) => `/assinatura?plan=${planId}`,
  },
  {
    key: 'escritorio',
    name: 'Escritório de IA',
    icon: Bot,
    desc: 'Tudo do plano Mapa mais 6 agentes especialistas: Retenção, Criativo, Edição, Mapeamento, Vendas e Negócios.',
    badge: 'Com 6 agentes de IA',
    accent: '#a78bfa',
    primary: true,
    items: [
      'Tudo do plano Mapa',
      '6 agentes especialistas de IA',
      'Agente de Retenção',
      'Agente Criativo',
      'Agente de Edição',
      'Agente de Mapeamento',
      'Agente de Vendas',
      'Agente de Negócios',
    ],
    prices: {
      mensal: { priceMonth: 147, totalLabel: 'R$147/mês', economy: null, planId: 'escritorio-mensal' },
      semestral: { priceMonth: 119.90, totalLabel: 'R$719,40 a cada 6 meses', economy: 'Economiza R$162 no semestre', planId: 'escritorio-semestral' },
      anual: { priceMonth: 99.90, totalLabel: 'R$1.198,80/ano', economy: 'Economiza R$566 por ano', planId: 'escritorio-anual' },
    } as Record<Ciclo, PlanPrice>,
    cta: 'Montar meu escritório',
    href: (planId: string) => `/assinatura?plan=${planId}`,
  },
]

export function LandingPricing() {
  const [ciclo, setCiclo] = useState<Ciclo>('mensal')

  return (
    <section id="precos" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-4">Planos</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Escolha o que faz sentido pra você.
        </h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Quanto maior o ciclo, menos você paga por mês. Todos os planos têm acesso completo.
        </p>
      </div>

      {/* Ciclo toggle */}
      <div className="flex items-center justify-center gap-2 mb-12">
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
          {CICLOS.map(c => (
            <button
              key={c.id}
              onClick={() => setCiclo(c.id)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                ciclo === c.id
                  ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/25'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {c.label}
              {c.desc && ciclo !== c.id && (
                <span className="absolute -top-2.5 -right-2 text-[9px] font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {c.desc}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price comparison bar */}
      <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
        {PLANS.map(p => {
          const price = p.prices[ciclo]
          return (
            <div key={p.key} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${p.primary ? 'bg-violet-500/10 border-violet-500/30 text-white' : 'bg-white/[0.04] border-white/[0.08] text-white/70'}`}>
              <span className="font-black">R${price.priceMonth.toFixed(2).replace('.', ',')}</span>
              <span className="text-xs opacity-50">/mês · {p.name}</span>
            </div>
          )
        })}
        {ciclo !== 'mensal' && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/8 border border-emerald-400/20 px-3 py-2 rounded-xl">
            <Zap size={12} />
            Você economiza comparado ao mensal
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {PLANS.map(p => {
          const price = p.prices[ciclo]
          return (
            <div
              key={p.key}
              className={`relative rounded-3xl p-8 flex flex-col ${
                p.primary
                  ? 'bg-gradient-to-b from-violet-500/15 to-violet-500/5 border-2 border-violet-500/40'
                  : 'bg-white/[0.04] border border-white/[0.08]'
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg shadow-violet-500/25">
                  <Bot size={11} />
                  {p.badge}
                </div>
              )}

              {/* Plan name */}
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: p.accent }}>
                  {p.name}
                </p>
                <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-end gap-1">
                  <span className="text-sm font-bold text-white/50 mb-2">R$</span>
                  <span className="text-5xl font-black text-white tracking-tighter leading-none">
                    {Math.floor(price.priceMonth)}
                  </span>
                  {!Number.isInteger(price.priceMonth) && (
                    <span className="text-2xl font-black text-white/80 mb-1">
                      ,{(price.priceMonth % 1).toFixed(2).slice(2)}
                    </span>
                  )}
                  <span className="text-sm font-medium text-white/40 mb-1">/mês</span>
                </div>
                <p className="text-xs text-white/30 font-medium mt-1">{price.totalLabel}</p>
              </div>

              {/* Economy badge */}
              {price.economy && (
                <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 self-start">
                  <Zap size={11} className="text-emerald-400" />
                  <span className="text-xs font-black text-emerald-400">{price.economy}</span>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {p.items.map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-white/65">
                    <Check size={13} style={{ color: p.accent }} className="shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={p.href(price.planId)}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm transition-all ${
                  p.primary
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/25 hover:scale-[1.02]'
                    : 'bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90 shadow-lg shadow-[#0ea5e9]/25 hover:scale-[1.02]'
                }`}
              >
                {p.cta}
                <ArrowRight size={15} />
              </Link>
            </div>
          )
        })}
      </div>

      {/* Free tier */}
      <div className="mt-8 text-center">
        <p className="text-white/30 text-sm font-medium">
          Quer testar antes de assinar?{' '}
          <Link href="/login?mode=signup" className="text-[#0ea5e9] font-bold hover:underline">
            Crie uma conta grátis
          </Link>{' '}
          e use 5 roteiros por dia sem cartão.
        </p>
      </div>
    </section>
  )
}
