import { Target, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    Icon: Target,
    color: '#0ea5e9',
    title: 'Você define pra quem quer vender',
    desc: 'Conta pra IA quem é seu cliente ideal. O que ele sente. O que ele quer comprar. O que o impede de comprar. A IA passa a escrever pra essa pessoa específica. Não pra todo mundo.',
    tag: '2 minutos. Uma vez só.',
  },
  {
    n: '02',
    Icon: MessageSquare,
    color: '#7c3aed',
    title: 'Você descreve o tema do vídeo',
    desc: 'Fala o que quer abordar em linguagem normal. A IA identifica o objetivo do vídeo, atrair, qualificar ou converter, e monta a estrutura certa pra esse objetivo.',
    tag: null,
  },
  {
    n: '03',
    Icon: TrendingUp,
    color: '#a78bfa',
    title: 'Você recebe o vídeo pronto pra vender',
    desc: 'Gancho que para o scroll. Argumento que quebra objeção. CTA que direciona pra compra. Cada parte com função. Você grava. O cliente aparece.',
    tag: 'Menos de 30 segundos',
  },
]

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="relative border-y border-white/[0.05] bg-white/[0.02] py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/4 via-transparent to-violet-600/4 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-4">O sistema</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
            3 etapas. Um vídeo com destino.
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Não é sobre criar mais conteúdo. É sobre criar o conteúdo certo com a mensagem certa pra pessoa certa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-16 left-[22%] right-[22%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {STEPS.map((step, i) => (
            <div key={step.n} className="relative bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 hover:bg-white/[0.06] transition-colors">
              <span className="absolute top-6 right-6 text-5xl font-black text-white/[0.06] leading-none select-none">{step.n}</span>

              <div
                className="size-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                style={{ background: `${step.color}20`, border: `1px solid ${step.color}30` }}
              >
                <step.Icon size={22} style={{ color: step.color }} />
              </div>

              {step.tag && (
                <span
                  className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 border"
                  style={{ color: step.color, background: `${step.color}10`, borderColor: `${step.color}25` }}
                >
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
