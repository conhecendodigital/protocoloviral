import Link from 'next/link'
import { CheckCircle, Shield, ArrowRight } from 'lucide-react'

const PLANS = [
  {
    id: 'mensal', label: 'Mensal', price: 'R$97', period: '/mês',
    desc: 'Acesso completo. Sem limitações.',
    features: [
      'Roteirista IA ilimitado',
      'Banco de 100 ganchos prontos',
      '15 formatos virais com estrutura de venda',
      'Tom de voz personalizado',
      'Engenharia reversa de virais',
    ],
    highlight: false, cta: 'Começar agora',
  },
  {
    id: 'semestral', label: 'Semestral', price: 'R$297', period: '/6 meses',
    per: 'R$49 por mês',
    desc: 'O plano que a maioria escolhe.',
    features: [
      'Tudo do plano Mensal',
      'Agentes de IA por nicho',
      'Analisador de Bio',
      'Planejador de Rotina de Conteúdo',
      'Suporte prioritário',
    ],
    highlight: true, badge: 'Economiza 49%', cta: 'Quero o Semestral',
  },
  {
    id: 'anual', label: 'Anual', price: 'R$497', period: '/ano',
    per: 'R$41 por mês',
    desc: 'Para quem joga pra vencer.',
    features: [
      'Tudo do Semestral',
      'Mentoria em grupo trimestral',
      'Acesso antecipado a novas ferramentas',
      'Badge de fundador',
    ],
    highlight: false, cta: 'Garantir Anual',
  },
]

export function LandingPricing() {
  return (
    <section id="precos" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-4">Planos</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Escolha e comece hoje.
        </h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Você pode criar uma conta e testar. Mas os resultados aparecem de verdade quando você usa sem limite. Os planos pagos existem pra isso.
        </p>
      </div>

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
                <p className="text-xs text-[#0ea5e9] font-bold mt-1">{plan.per}</p>
              )}
              <p className="text-xs text-white/40 mt-2">{plan.desc}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/65">
                  <CheckCircle size={15} className="text-[#0ea5e9] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={`/login?plan=${plan.id}&mode=signup`}
              className={`w-full text-center rounded-2xl px-6 py-3.5 font-bold transition-all text-sm flex items-center justify-center gap-2 ${
                plan.highlight
                  ? 'bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white hover:scale-[1.02] shadow-lg shadow-[#0ea5e9]/20'
                  : 'bg-white/[0.07] border border-white/10 text-white hover:bg-white/[0.12]'
              }`}
            >
              {plan.cta}
              <ArrowRight size={15} />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-5 text-center">
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-4 max-w-md">
          <Shield size={20} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-white/60 text-left">
            <span className="text-white font-bold">Garantia 7 dias.</span> Se você usar e não gostar, devolvemos 100%. Sem perguntas. Sem formulário de cancelamento complicado.
          </p>
        </div>
      </div>
    </section>
  )
}
