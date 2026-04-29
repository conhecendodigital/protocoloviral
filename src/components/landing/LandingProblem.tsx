import { X, CheckCircle } from 'lucide-react'

const BEFORE = [
  'Você posta. Posta. Posta. E no final do mês o faturamento não muda.',
  'Você vê um concorrente com metade do seu conhecimento vendendo o dobro. E não entende por quê.',
  'Você cria conteúdo de valor. As pessoas salvam. Agradecem. E compram de outro.',
  'Você investe horas num vídeo que não converte nada. De novo.',
]

const AFTER = [
  'Cada vídeo que você publica tem uma função. Atrair. Qualificar. Ou converter. Nunca à toa.',
  'Você para de falar pra todo mundo e começa a falar com quem pode te pagar. A diferença é enorme.',
  'Seu conteúdo passa a gerar DM, lead e venda mesmo nos dias que você não posta.',
  'Em 15 minutos você sai com roteiro pronto. Gancho, argumento e CTA testados em virais reais.',
]

export function LandingProblem() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-4">O problema que ninguém fala</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6">
          Seguidores não pagam seu aluguel.
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          Você não tem problema de audiência. Você tem problema de mensagem. Existe uma diferença entre criar conteúdo e criar conteúdo que vende. Essa diferença é estrutura.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-red-500/[0.04] border border-red-500/15 rounded-3xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.05]">
            <div className="size-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <X size={22} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Sem sistema</h3>
              <p className="text-xs text-red-400/60 font-medium mt-0.5">O que acontece hoje</p>
            </div>
          </div>
          <ul className="space-y-5">
            {BEFORE.map(b => (
              <li key={b} className="flex items-start gap-3">
                <X size={16} className="text-red-400/60 mt-0.5 shrink-0" />
                <p className="text-white/55 text-sm leading-relaxed">{b}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative bg-[#0ea5e9]/[0.05] border border-[#0ea5e9]/20 rounded-3xl p-8 md:p-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/8 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.06] relative">
            <div className="size-12 rounded-2xl bg-[#0ea5e9]/15 flex items-center justify-center">
              <CheckCircle size={22} className="text-[#0ea5e9]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Com o Mapa</h3>
              <p className="text-xs text-[#0ea5e9]/60 font-medium mt-0.5">O que passa a acontecer</p>
            </div>
          </div>
          <ul className="space-y-5 relative">
            {AFTER.map(a => (
              <li key={a} className="flex items-start gap-3">
                <CheckCircle size={16} className="text-[#0ea5e9] mt-0.5 shrink-0" />
                <p className="text-white/80 text-sm leading-relaxed">{a}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 p-7 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
        <p className="text-white/80 text-base leading-relaxed text-center max-w-3xl mx-auto">
          <span className="text-white font-black">A verdade incômoda:</span> criadores que vendem com conteúdo não têm mais talento que você. Eles têm um sistema. O sistema define o que falar, como falar e pra quem falar antes de abrir a câmera. Isso é o que o Mapa faz.
        </p>
      </div>
    </section>
  )
}
