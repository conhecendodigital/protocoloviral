'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, Bot, Zap, TrendingDown } from 'lucide-react'

type Ciclo = 'mensal' | 'semestral' | 'anual'

interface PlanPrice {
  priceMonth: number
  totalLabel: string
  economy: string | null
  planId: string
}

const CICLOS: { id: Ciclo; label: string; saving: string | null }[] = [
  { id: 'mensal', label: 'Mensal', saving: null },
  { id: 'semestral', label: 'Semestral', saving: '−10%' },
  { id: 'anual', label: 'Anual', saving: '−20%' },
]

const PLANS = [
  {
    key: 'mapa',
    name: 'Mapa do Engajamento',
    tagline: 'Biblioteca de formatos virais + roteirista IA + banco de ganchos.',
    badge: null,
    accentFrom: '#0ea5e9',
    accentTo: '#38bdf8',
    primary: false,
    items: [
      'Roteiros ilimitados',
      'Biblioteca de formatos virais',
      'Analisar até 10 vídeos virais/mês',
      'Tom de voz personalizado',
      'Banco de ganchos virais',
      'Jornada de conteúdo',
      'Rotina semanal NOEIXO',
    ],
    prices: {
      mensal:    { priceMonth: 97,     totalLabel: 'cobrado mensalmente',               economy: null,                 planId: 'mensal' },
      semestral: { priceMonth: 87,     totalLabel: 'R$522 cobrado a cada 6 meses',      economy: 'Economiza R$60',    planId: 'semestral' },
      anual:     { priceMonth: 77,     totalLabel: 'R$924 cobrado anualmente',           economy: 'Economiza R$240',   planId: 'anual' },
    } as Record<Ciclo, PlanPrice>,
    cta: 'Começar agora',
    href: (planId: string) => `/assinatura?plan=${planId}`,
  },
  {
    key: 'escritorio',
    name: 'Escritório de IA',
    tagline: 'Tudo do plano Mapa mais 6 agentes especialistas com personas dedicadas.',
    badge: '6 Agentes de IA',
    accentFrom: '#a78bfa',
    accentTo: '#818cf8',
    primary: true,
    items: [
      'Tudo do plano Mapa',
      'Agente de Retenção',
      'Agente Criativo',
      'Agente de Edição',
      'Agente de Mapeamento',
      'Agente de Vendas',
      'Agente de Negócios',
    ],
    prices: {
      mensal:    { priceMonth: 147,    totalLabel: 'cobrado mensalmente',               economy: null,                 planId: 'escritorio-mensal' },
      semestral: { priceMonth: 119.90, totalLabel: 'R$719,40 cobrado a cada 6 meses',  economy: 'Economiza R$162',   planId: 'escritorio-semestral' },
      anual:     { priceMonth: 99.90,  totalLabel: 'R$1.198,80 cobrado anualmente',    economy: 'Economiza R$566',   planId: 'escritorio-anual' },
    } as Record<Ciclo, PlanPrice>,
    cta: 'Montar meu escritório',
    href: (planId: string) => `/assinatura?plan=${planId}`,
  },
]

function formatPrice(n: number) {
  const int = Math.floor(n)
  const dec = Math.round((n - int) * 100)
  return { int: int.toString(), dec: dec > 0 ? dec.toString().padStart(2, '0') : null }
}

export function LandingPricing() {
  const [ciclo, setCiclo] = useState<Ciclo>('mensal')

  return (
    <section id="precos" className="max-w-6xl mx-auto px-6 py-24">

      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-4">Planos</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Escolha o seu plano.
        </h2>
        <p className="text-white/45 text-lg max-w-lg mx-auto">
          Quanto mais longo o ciclo, menos você paga. Acesso completo em todos.
        </p>
      </div>

      {/* Ciclo toggle — clean pill */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1 gap-1">
          {CICLOS.map(c => (
            <button
              key={c.id}
              onClick={() => setCiclo(c.id)}
              className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-200 ${
                ciclo === c.id
                  ? 'bg-white text-[#080b12] shadow-md'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {c.label}
              {c.saving && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  ciclo === c.id
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {c.saving}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {PLANS.map(p => {
          const price = p.prices[ciclo]
          const { int, dec } = formatPrice(price.priceMonth)

          return (
            <div
              key={p.key}
              className={`relative flex flex-col rounded-3xl overflow-hidden border transition-all ${
                p.primary
                  ? 'border-violet-500/30 bg-gradient-to-b from-violet-950/60 to-[#0d0916]/80'
                  : 'border-white/[0.08] bg-white/[0.03]'
              }`}
            >
              {/* Top glow strip */}
              <div
                className="h-0.5 w-full"
                style={{ background: `linear-gradient(90deg, transparent, ${p.accentFrom}, ${p.accentTo}, transparent)` }}
              />

              <div className="p-8 flex flex-col flex-1">

                {/* Plan header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-base font-black text-white mb-1">{p.name}</p>
                    <p className="text-sm text-white/40 leading-relaxed">{p.tagline}</p>
                  </div>
                  {p.badge && (
                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10">
                      <Bot size={12} className="text-violet-400" />
                      <span className="text-[11px] font-black text-violet-300 whitespace-nowrap">{p.badge}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-end gap-1">
                    <span className="text-lg font-bold text-white/40 mb-2">R$</span>
                    <span className="text-6xl font-black text-white tracking-tighter leading-none">{int}</span>
                    {dec && (
                      <span className="text-2xl font-black text-white/60 mb-1.5">,{dec}</span>
                    )}
                    <span className="text-sm font-medium text-white/35 mb-1.5 ml-0.5">/mês</span>
                  </div>
                  <p className="text-xs text-white/30 font-medium mt-1.5">{price.totalLabel}</p>
                </div>

                {/* Economy pill */}
                <div className="h-8 mb-6 flex items-center">
                  {price.economy ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <TrendingDown size={11} className="text-emerald-400" />
                      <span className="text-xs font-black text-emerald-400">{price.economy} vs mensal</span>
                    </div>
                  ) : (
                    <span className="text-xs text-white/20 font-medium">Cancela quando quiser</span>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.06] mb-6" />

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {p.items.map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                      <div
                        className="size-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${p.accentFrom}18` }}
                      >
                        <Check size={10} style={{ color: p.accentFrom }} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={p.href(price.planId)}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.99] ${
                    p.primary
                      ? 'text-white shadow-lg shadow-violet-500/20'
                      : 'text-white shadow-lg shadow-sky-500/15'
                  }`}
                  style={{
                    background: p.primary
                      ? `linear-gradient(135deg, ${p.accentFrom}, ${p.accentTo})`
                      : `linear-gradient(135deg, ${p.accentFrom}, ${p.accentTo})`,
                  }}
                >
                  {p.cta}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Free tier */}
      <div className="mt-10 text-center">
        <p className="text-white/25 text-sm">
          Quer testar antes?{' '}
          <Link href="/login?mode=signup" className="text-[#0ea5e9] font-bold hover:underline underline-offset-2">
            Conta grátis com 5 roteiros por dia.
          </Link>{' '}
          Sem cartão.
        </p>
      </div>
    </section>
  )
}
