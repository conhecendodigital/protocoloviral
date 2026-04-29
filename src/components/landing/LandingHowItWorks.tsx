import { Target, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    Icon: Target,
    color: 'from-[#0ea5e9] to-[#2563eb]',
    shadow: 'rgba(14,165,233,0.3)',
    title: 'Define quem você quer atrair',
    desc: 'Você conta pra IA quem é seu cliente ideal, o que ele sente, o que ele quer e o que ele compra. A IA passa a escrever pra essa pessoa — não pra todo mundo.',
    tag: '2 minutos. 1x só.',
  },
  {
    n: '02',
    Icon: MessageSquare,
    color: 'from-[#3b82f6] to-[#7c3aed]',
    shadow: 'rgba(124,58,237,0.3)',
    title: 'Descreve o tema que quer abordar',
    desc: 'Fala em linguagem natural o que quer ensinar, mostrar ou vender. A IA identifica o objetivo do vídeo (atrair, qualificar ou converter) e monta a estrutura certa pra isso.',
    tag: null,
  },
  {
    n: '03',
    Icon: TrendingUp,
    color: 'from-[#7c3aed] to-[#a78bfa]',
    shadow: 'rgba(167,139,250,0.3)',
    title: 'Recebe o vídeo estruturado pra vender',
    desc: 'Gancho que prende, argumento que convence, CTA que direciona pra compra. Cada parte tem função. Você grava. O cliente chega.',
    tag: '< 30 segundos',
  },
]

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="relative border-y border-white/[0.05] bg-white/[0.02] py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/4 via-transparent to-violet-600/4 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-3">O sistema</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
            3 etapas. Um vídeo com destino.
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Não é sobre criar mais conteúdo. É sobre criar o conteúdo certo, com a mensagem certa, pra pessoa certa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-16 left-[22%] right-[22%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {STEPS.map((step, i) => (
            <div key={step.n} className="relative bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 hover:bg-white/[0.06] transition-colors">
              <span className="absolute top-6 right-6 text-5xl font-black text-white/[0.06] leading-none select-none">{step.n}</span>

              <div
                className="size-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${step.color.split(' ')[0].replace('from-[', '').replace(']', '')}, ${step.color.split(' ')[1].replace('to-[', '').replace(']', '')})`, boxShadow: `0 8px 32px ${step.shadow}` }}
              >
                <step.Icon size={22} className="text-white" />
              </div>

              {step.tag && (
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#0ea5e9] bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 px-2.5 py-1 rounded-full mb-3">
                  {step.tag}
                </span>
              )}

              <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>

              {i < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight size={16} className="text-white/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
