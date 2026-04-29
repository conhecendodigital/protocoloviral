import Link from 'next/link'
import { CheckCircle, Shield, Zap } from 'lucide-react'

const PLANS = [
  {
    id: 'mensal', label: 'Mensal', price: 'R$97', period: '/mês',
    desc: 'Acesso completo, sem limitações.',
    features: ['Roteirista IA ilimitado', 'Banco de 100+ ganchos', '15+ formatos virais', 'Tom de Voz personalizado', 'Analisar vídeos virais'],
    highlight: false, cta: 'Começar agora',
  },
  {
    id: 'semestral', label: 'Semestral', price: 'R$297', period: '/6 meses',
    per: 'R$49/mês',
    desc: 'O mais escolhido pelos criadores.',
    features: ['Tudo do Mensal', 'Agentes de IA por nicho', 'Analisador de Bio', 'Planejador de Rotina', 'Suporte prioritário'],
    highlight: true, badge: 'Economiza 49%', cta: 'Quero o Semestral',
  },
  {
    id: 'anual', label: 'Anual', price: 'R$497', period: '/ano',
    per: 'R$41/mês',
    desc: 'Para criadores que jogam pra ganhar.',
    features: ['Tudo do Semestral', 'Mentoria em grupo trimestral', 'Acesso antecipado a novidades', 'Badge de fundador'],
    highlight: false, cta: 'Garantir Anual',
  },
]

export function LandingPricing() {
  return (
    <section id="precos" className="max-w-7xl mx-auto px-6 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-3">Planos</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Comece grátis. Escale quando quiser.
        </h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          5 roteiros por dia no plano gratuito, sem cartão. Quando quiser sem limite, escolha um plano.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-8 flex flex-col transition-all ${
              plan.highlight
                ? 'bg-gradient-to-b from-white/[0.09] to-white/[0.04] border border-[#0ea5e9]/30 md:-mt-4'
                : 'bg-white/[0.03] border border-white/[0.07]'
            }`}
            style={plan.highlight ? { boxShadow: '0 0 60px -20px rgba(14,165,233,0.3)' } : {}}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap uppercase tracking-wider">
                {plan.badge}
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-bold text-white/50 mb-1">{plan.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-white/40 text-sm mb-1">{plan.period}</span>
              </div>
              {plan.per && (
                <p className="text-xs text-[#0ea5e9] font-bold mt-1">≈ {plan.per}</p>
              )}
              <p className="text-xs text-white/40 mt-2">{plan.desc}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                  <CheckCircle size={15} className="text-[#0ea5e9] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={`/login?plan=${plan.id}&mode=signup`}
              className={`w-full text-center rounded-2xl px-6 py-3.5 font-bold transition-all text-sm ${
                plan.highlight
                  ? 'bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white hover:scale-[1.02] shadow-lg shadow-[#0ea5e9]/20'
                  : 'bg-white/[0.07] border border-white/10 text-white hover:bg-white/[0.12]'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Guarantee + Free note */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-4">
          <Shield size={20} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-white/60">
            <span className="text-white font-bold">Garantia 7 dias incondicional</span> — Se não valer, devolvemos 100%. Sem perguntas.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-4">
          <Zap size={20} className="text-[#0ea5e9] shrink-0" />
          <p className="text-sm text-white/60">
            Quer testar antes?{' '}
            <Link href="/login?mode=signup" className="text-[#0ea5e9] font-bold hover:underline">
              Crie uma conta grátis
            </Link>{' '}
            — 5 roteiros por dia, sem cartão.
          </p>
        </div>
      </div>
    </section>
  )
}
