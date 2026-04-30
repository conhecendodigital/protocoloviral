'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, Check, Flame, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PLANS = [
  {
    id: 'mensal',
    name: 'Mensal',
    priceMonth: 97,
    total: null,
    totalLabel: null,
    economy: null,
    desc: 'Acesso completo. Cancela quando quiser.',
    cta: 'Começar agora',
    href: '/assinatura?plan=mensal',
    primary: false,
    badge: null,
  },
  {
    id: 'semestral',
    name: 'Semestral',
    priceMonth: 87,
    total: 522,
    totalLabel: 'R$522 no semestre',
    economy: 'Economiza R$60 no semestre',
    desc: 'R$87 por mês, cobrado uma vez a cada 6 meses.',
    cta: 'Assinar semestral',
    href: '/assinatura?plan=semestral',
    primary: false,
    badge: null,
  },
  {
    id: 'anual',
    name: 'Anual',
    priceMonth: 77,
    total: 924,
    totalLabel: 'R$924 no ano',
    economy: 'Economiza R$240 por ano',
    desc: 'R$77 por mês, cobrado uma vez por ano.',
    cta: 'Assinar anual',
    href: '/assinatura?plan=anual',
    primary: true,
    badge: 'Melhor valor',
  },
]

const ITEMS = [
  'Roteiros ilimitados',
  'Biblioteca de formatos virais',
  'Analisar qualquer vídeo viral',
  'Tom de voz personalizado',
  'Banco de ganchos virais',
  'Agentes especialistas por nicho',
  'Jornada de conteúdo',
  'Rotina semanal NOEIXO',
  'Novos formatos adicionados toda semana',
]

export function LandingPricing() {
  return (
    <section id="precos" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-4">Planos</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Quanto mais tempo, menos você paga.
        </h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Todos os planos dão acesso completo. A diferença é só o ciclo de cobrança.
        </p>
      </div>

      {/* Price comparison visual */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
        {PLANS.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border ${p.primary ? 'bg-[#0ea5e9]/15 border-[#0ea5e9]/40 text-white' : 'bg-white/[0.04] border-white/[0.08] text-white/60'}`}>
              <span className="font-black text-lg" style={{ color: p.primary ? '#fff' : undefined }}>
                R${p.priceMonth}<span className="text-sm font-medium">/mês</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">{p.name}</span>
            </div>
            {i < PLANS.length - 1 && (
              <ArrowRight size={14} className="text-white/20 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Main pricing cards */}
      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {PLANS.map(p => (
          <div
            key={p.id}
            className={`relative rounded-3xl p-8 flex flex-col ${p.primary
              ? 'bg-gradient-to-b from-[#0ea5e9]/15 to-[#0ea5e9]/5 border-2 border-[#0ea5e9]/50'
              : 'bg-white/[0.04] border border-white/[0.08]'
            }`}
          >
            {p.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-[#0ea5e9] to-violet-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
                <Flame size={12} />
                {p.badge}
              </div>
            )}

            {/* Plan name & price */}
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">{p.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-sm font-bold text-white/50 mb-1.5">R$</span>
                <span className="text-5xl font-black text-white tracking-tighter leading-none">{p.priceMonth}</span>
                <span className="text-sm font-medium text-white/40 mb-1">/mês</span>
              </div>
              {p.totalLabel ? (
                <p className="text-xs text-white/40 font-medium mt-1">{p.totalLabel}</p>
              ) : (
                <p className="text-xs text-white/40 font-medium mt-1">cobrado mensalmente</p>
              )}
            </div>

            {/* Economy badge */}
            {p.economy && (
              <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 self-start">
                <Zap size={12} className="text-emerald-400" />
                <span className="text-xs font-black text-emerald-400">{p.economy}</span>
              </div>
            )}

            {/* What's included */}
            <ul className="space-y-2.5 mb-8 flex-1">
              {ITEMS.map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/65">
                  <Check size={13} className="text-[#0ea5e9] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href={p.href}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm transition-all ${
                p.primary
                  ? 'bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90 shadow-lg shadow-[#0ea5e9]/25 hover:scale-[1.02]'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              {p.cta}
              <ArrowRight size={15} />
            </Link>
          </div>
        ))}
      </div>

      {/* Free tier mention */}
      <div className="mt-8 text-center">
        <p className="text-white/30 text-sm font-medium">
          Quer testar antes? <Link href="/login?mode=signup" className="text-[#0ea5e9] font-bold hover:underline">Crie uma conta grátis</Link> e use 5 roteiros por dia sem cartão.
        </p>
      </div>
    </section>
  )
}
