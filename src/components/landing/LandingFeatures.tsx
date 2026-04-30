import { Library, Sparkles, Play, Brain, Mic2, Route } from 'lucide-react'

const FEATURES = [
  {
    Icon: Library, color: '#0ea5e9', span: 2,
    title: 'Biblioteca de Formatos Virais',
    tag: 'O coração do produto',
    desc: 'Centenas de vídeos virais foram estudados, desmontados e documentados. Cada formato na biblioteca tem a estrutura do gancho, o desenvolvimento e o CTA que fizeram funcionar. Você não precisa descobrir por que um vídeo virou viral. Isso já foi feito. Você só adapta pro seu nicho e grava.',
    detail: null,
  },
  {
    Icon: Play, color: '#a78bfa', span: 1,
    title: 'Analisar Qualquer Vídeo Viral',
    tag: null,
    desc: 'Cole a URL de um Reels ou TikTok que você quer estudar. A IA desmonta o vídeo, extrai a estrutura e salva como formato na sua biblioteca. Você transforma referência em método.',
    detail: null,
  },
  {
    Icon: Sparkles, color: '#22d3ee', span: 1,
    title: 'Roteirista IA',
    tag: null,
    desc: 'Escolheu o formato. A IA escreve o roteiro completo no formato escolhido, no seu tom de voz. Em 30 segundos. Você grava.',
    detail: 'Claude Sonnet e GPT-4o com fallback automático.',
  },
  {
    Icon: Brain, color: '#34d399', span: 1,
    title: 'Banco de Ganchos',
    tag: null,
    desc: '100 aberturas extraídas de vídeos virais reais. Organizadas por gatilho: medo, curiosidade, contraste, promessa. Você não começa o vídeo do zero nunca mais.',
    detail: null,
  },
  {
    Icon: Mic2, color: '#fb923c', span: 1,
    title: 'Tom de Voz',
    tag: null,
    desc: 'Configura uma vez. A IA aprende como você fala e escreve no seu estilo. O roteiro parece que você escreveu, não um robô.',
    detail: null,
  },
  {
    Icon: Route, color: '#f472b6', span: 1,
    title: 'Agentes Especialistas',
    tag: 'Pro',
    desc: 'Consultores de IA treinados por nicho. Cada um adaptado pra falar com o cliente do seu mercado da maneira que ele responde.',
    detail: null,
  },
]

export function LandingFeatures() {
  return (
    <section id="ferramentas" className="max-w-7xl mx-auto px-6 py-24">
      <div className="mb-14">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-4">O que tem dentro</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Tudo começa com os formatos.
        </h2>
        <p className="text-white/50 text-lg max-w-2xl">
          A biblioteca é o centro. O roteirista, os ganchos e os agentes existem pra executar os formatos que já foram validados. Nada é feature isolada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map(f => (
          <div
            key={f.title}
            className={`${f.span === 2 ? 'md:col-span-2' : ''} relative group bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 overflow-hidden`}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" style={{ background: `radial-gradient(400px at 50% 50%, ${f.color}08, transparent)` }} />

            {f.tag && (
              <span className="absolute top-6 right-6 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ color: f.color, background: `${f.color}15`, borderColor: `${f.color}30` }}>
                {f.tag}
              </span>
            )}

            <div className="size-12 rounded-2xl flex items-center justify-center mb-5 border border-white/[0.06]" style={{ background: `${f.color}12` }}>
              <f.Icon size={20} style={{ color: f.color }} />
            </div>

            <h3 className="text-xl font-black text-white mb-3">{f.title}</h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">{f.desc}</p>

            {f.detail && (
              <p className="mt-4 text-[11px] text-white/25 font-medium">{f.detail}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
