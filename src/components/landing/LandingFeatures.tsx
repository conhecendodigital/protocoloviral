import { Sparkles, Brain, Layers, Mic2, Play, Route } from 'lucide-react'

const FEATURES = [
  {
    Icon: Sparkles, color: '#0ea5e9', span: 2,
    title: 'Roteirista IA',
    tag: 'Carro-chefe',
    desc: 'Chat especializado em roteiros de Reels e TikTok. Você descreve o tema, escolhe o formato e recebe o roteiro completo em menos de 30 segundos — gancho que prende, desenvolvimento que retém, CTA que converte.',
    detail: 'Modelos: Claude + GPT-4o com fallback automático',
  },
  {
    Icon: Brain, color: '#a78bfa', span: 1,
    title: 'Banco de Ganchos',
    tag: null,
    desc: '100+ aberturas organizadas por tipo: Verdade Chocante, Pergunta Provocativa, Promessa Direta, Contraste, Medo. Clicou, copiou, gravou.',
    detail: null,
  },
  {
    Icon: Layers, color: '#22d3ee', span: 1,
    title: 'Formatos Virais',
    tag: null,
    desc: '15+ estruturas testadas que funcionam: Storytelling, Lista Chocante, Antes/Depois, Bastidores. A IA aplica o formato no seu tema.',
    detail: null,
  },
  {
    Icon: Mic2, color: '#34d399', span: 1,
    title: 'Tom de Voz',
    tag: null,
    desc: 'Configure nicho, personalidade e estilo uma vez. A IA passa a escrever como você — não como um robô genérico.',
    detail: null,
  },
  {
    Icon: Play, color: '#fb923c', span: 1,
    title: 'Analisar Vídeo Viral',
    tag: null,
    desc: 'Cole a URL de qualquer Reels ou TikTok viral. A IA desmonta o vídeo e extrai a estrutura como formato reutilizável.',
    detail: null,
  },
  {
    Icon: Route, color: '#f472b6', span: 1,
    title: 'Agentes de IA',
    tag: 'Pro',
    desc: 'Agentes especializados por nicho: Coach, Ecommerce, Infoprodutos. Cada um com prompts otimizados para seu segmento.',
    detail: null,
  },
]

export function LandingFeatures() {
  return (
    <section id="ferramentas" className="max-w-7xl mx-auto px-6 py-24">
      <div className="mb-14">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-3">O que tem dentro</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Tudo em um lugar só.
        </h2>
        <p className="text-white/50 text-lg max-w-xl">
          Nada espalhado entre 4 ferramentas. Você entra, usa, grava.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map(f => (
          <div
            key={f.title}
            className={`${f.span === 2 ? 'md:col-span-2' : ''} relative group bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 overflow-hidden`}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" style={{ background: `radial-gradient(400px at 50% 50%, ${f.color}08, transparent)` }} />

            {/* Tag */}
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
