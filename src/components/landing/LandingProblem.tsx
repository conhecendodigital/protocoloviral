import { X, CheckCircle } from 'lucide-react'

const BEFORE = [
  'Você posta todo dia e os seguidores não viram clientes. Likes não pagam conta.',
  'Cria conteúdo "de valor" mas quando lança, ninguém compra. Engajamento vazio.',
  'Vê concorrentes com metade do seu conhecimento vendendo o dobro — e não entende por quê.',
  'Passa horas editando um vídeo que não converte nada. Cansativo e frustrante.',
]

const AFTER = [
  'Cada vídeo é projetado pra uma função: atrair o cliente certo, qualificar ou converter. Nada é por acaso.',
  'Você para de falar pra todo mundo e começa a falar com a pessoa que tem dinheiro pra te pagar.',
  'Seu conteúdo passa a funcionar enquanto você dorme — gerando DMs, leads e vendas no automático.',
  'Em menos de 15 minutos você sai com um roteiro que tem gancho, argumento e CTA testados.',
]

export function LandingProblem() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">O problema real</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Seguidores não pagam seu aluguel.
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          Você não precisa de mais views. Você precisa que o conteúdo certo chegue na pessoa certa com a mensagem certa. Isso tem estrutura.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Before */}
        <div className="bg-red-500/[0.04] border border-red-500/15 rounded-3xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.05]">
            <div className="size-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <X size={22} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Criando no escuro</h3>
              <p className="text-xs text-red-400/70 font-medium mt-0.5">O que acontece sem sistema</p>
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

        {/* After */}
        <div className="relative bg-[#0ea5e9]/[0.05] border border-[#0ea5e9]/20 rounded-3xl p-8 md:p-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/8 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.06] relative">
            <div className="size-12 rounded-2xl bg-[#0ea5e9]/15 flex items-center justify-center">
              <CheckCircle size={22} className="text-[#0ea5e9]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Com o Mapa do Engajamento</h3>
              <p className="text-xs text-[#0ea5e9]/70 font-medium mt-0.5">Conteúdo com intenção = vendas</p>
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

      {/* Insight box */}
      <div className="mt-6 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-4">
        <span className="text-2xl shrink-0">💡</span>
        <p className="text-sm text-white/60 leading-relaxed">
          <strong className="text-white">A verdade que ninguém fala:</strong> criadores que vendem com conteúdo não têm mais talento. Eles têm um sistema. O sistema define o que falar, como falar e pra quem falar — antes de abrir a câmera. É exatamente isso que o Mapa resolve.
        </p>
      </div>
    </section>
  )
}
