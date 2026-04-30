import { X, CheckCircle } from 'lucide-react'

const BEFORE = [
  'Você abre a câmera sem saber o que falar. Improvisa. O vídeo não engaja.',
  'Você tenta criar formatos do zero. Investe horas. Ninguém assiste até o final.',
  'Você vê um vídeo viral de outro criador e não sabe por que funcionou. Tenta copiar. Não funciona igual.',
  'Você posta. Posta. Posta. E no final do mês o resultado é o mesmo.',
]

const AFTER = [
  'Você entra na biblioteca, escolhe o formato que já viralizou no seu nicho e adapta pro seu conteúdo. Simples.',
  'Você para de criar estrutura do zero. Usa o que já foi testado, validado e documentado por outros criadores.',
  'Você entende por que cada formato funciona. O gancho. A estrutura. O CTA. E aplica com intenção.',
  'A IA pega o formato que você escolheu e escreve o roteiro no seu tom de voz. Em 30 segundos.',
]

export function LandingProblem() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-4">O erro que todo mundo comete</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6">
          Criar do zero é o problema.
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          Os maiores criadores do mundo não inventam formato novo toda semana. Eles estudam o que já funciona e executam com consistência. O Mapa faz esse estudo pra você.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-red-500/[0.04] border border-red-500/15 rounded-3xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.05]">
            <div className="size-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <X size={22} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Criando no escuro</h3>
              <p className="text-xs text-red-400/60 font-medium mt-0.5">Sem biblioteca, sem referência</p>
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
              <h3 className="text-xl font-black text-white">Com o Mapa do Engajamento</h3>
              <p className="text-xs text-[#0ea5e9]/60 font-medium mt-0.5">Execute o que já foi validado</p>
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
          <span className="text-white font-black">O que os melhores criadores têm em comum:</span> eles não criam formato novo todo dia. Eles têm uma biblioteca de referências que funcionam e executam com consistência. O Mapa é essa biblioteca.
        </p>
      </div>
    </section>
  )
}
