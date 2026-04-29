import { X, CheckCircle } from 'lucide-react'

const BEFORE = [
  'Abre o celular, fica 20 minutos olhando a câmera sem saber o que falar.',
  'Posta na esperança — sem saber se aquele vídeo vai atrair cliente ou só view vazia.',
  'Passa horas editando um vídeo que não converte nada. Burnout real.',
  'Copia o formato de um viral e o resultado é completamente diferente.',
]

const AFTER = [
  'Abre o Mapa, descreve o tema, escolhe o formato — roteiro pronto em menos de 30 segundos.',
  'Cada vídeo tem intenção clara: atrair, qualificar ou converter. A IA sabe a diferença.',
  'Você grava com confiança porque o roteiro já foi testado em formatos que funcionam.',
  'O roteiro sai no seu tom de voz, não como um robô genérico. Parece que você mesmo escreveu.',
]

export function LandingProblem() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-3">O problema real</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Você reconhece esse loop?
        </h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          A maioria dos criadores trava no mesmo lugar. Não é falta de talento — é falta de sistema.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Before */}
        <div className="bg-red-500/[0.04] border border-red-500/15 rounded-3xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.05]">
            <div className="size-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <X size={22} className="text-red-400" />
            </div>
            <h3 className="text-2xl font-black text-white">Sem direção</h3>
          </div>
          <ul className="space-y-5">
            {BEFORE.map(b => (
              <li key={b} className="flex items-start gap-3">
                <X size={16} className="text-red-400/70 mt-0.5 shrink-0" />
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
            <h3 className="text-2xl font-black text-white">Com o Mapa</h3>
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
    </section>
  )
}
