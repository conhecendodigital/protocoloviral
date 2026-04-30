'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'O que exatamente é a biblioteca de formatos?',
    a: 'São estruturas extraídas de vídeos virais reais de criadores de conteúdo. Cada formato documenta o tipo de gancho usado, como o desenvolvimento foi construído e qual CTA converteu. Não é teoria. É o que funcionou na prática, desmontado e documentado pra você adaptar.',
  },
  {
    q: 'Posso analisar qualquer vídeo que eu quiser?',
    a: 'Sim, no plano Pro. Você cola a URL de um Reels ou TikTok e a IA extrai a estrutura do vídeo e salva como um novo formato na sua biblioteca. Funciona com qualquer criador, qualquer nicho, qualquer idioma.',
  },
  {
    q: 'Os formatos funcionam pra qualquer nicho?',
    a: 'Sim. Storytelling, Lista Chocante, Problema e Solução, Curiosidade. Esses mecanismos funcionam porque trabalham com atenção humana, não com um nicho específico. Você adapta o tema. A estrutura já foi validada.',
  },
  {
    q: 'A IA gera o roteiro ou só a estrutura?',
    a: 'Gera o roteiro completo. Você descreve o tema, escolhe o formato da biblioteca e a IA escreve o roteiro inteiro no formato escolhido, no seu tom de voz. Gancho, desenvolvimento, CTA. Pronto pra gravar em 30 segundos.',
  },
  {
    q: 'Funciona sem ter muitos seguidores?',
    a: 'Funciona melhor quanto menor for sua audiência. Com seguidores grandes você sobrevive com consistência. Com seguidores pequenos, cada vídeo precisa ser o mais eficiente possível. Os formatos virais garantem que você não está apostando no escuro.',
  },
  {
    q: 'Qual a diferença do ChatGPT pra isso?',
    a: 'O ChatGPT gera texto. O Mapa tem uma biblioteca de formatos virais específicos, aplica o formato correto pro objetivo do vídeo e escreve no seu tom de voz. Não é a mesma coisa que pedir "escreva um roteiro" pra um chat genérico.',
  },
]

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="max-w-3xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-4">Dúvidas</p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
          Perguntas comuns.
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-colors"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-6 text-left"
            >
              <span className="text-sm font-bold text-white">{faq.q}</span>
              <ChevronDown
                size={16}
                className={`text-white/30 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && (
              <div className="px-6 pb-6">
                <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
