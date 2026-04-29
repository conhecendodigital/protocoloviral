import { Sparkles, Brain, Layers, Mic2, Play, Route } from 'lucide-react'

const FEATURES = [
  {
    Icon: Sparkles, color: '#0ea5e9', span: 2,
    title: 'Roteirista IA — o motor do sistema',
    tag: 'O coração da plataforma',
    desc: 'Você descreve o tema, o objetivo (atrair, qualificar ou converter) e recebe o roteiro completo em segundos. Gancho que para o scroll, argumento que quebra objeção, CTA que direciona pro próximo passo da venda. Cada peça com função.',
    detail: 'Modelos: Claude Sonnet + GPT-4o com fallback automático',
  },
  {
    Icon: Brain, color: '#a78bfa', span: 1,
    title: 'Banco de Ganchos',
    tag: null,
    desc: '100+ aberturas organizadas por gatilho: Medo, Curiosidade, Contraste, Promessa, Provocação. Você escolhe o gancho certo pro cliente que quer parar.',
    detail: null,
  },
  {
    Icon: Layers, color: '#22d3ee', span: 1,
    title: 'Formatos Virais que Convertem',
    tag: null,
    desc: 'Estruturas testadas com intenção de venda: Antes/Depois, Objeção/Resposta, Autoridade, Storytelling. A IA aplica no seu tema.',
    detail: null,
  },
  {
    Icon: Mic2, color: '#34d399', span: 1,
    title: 'Sua Voz. Não a do robô.',
    tag: null,
    desc: 'Configure seu tom uma vez. A IA aprende como você fala, o que você evita e quem é sua audiência. O resultado parece que você mesmo escreveu — porque é baseado em você.',
    detail: null,
  },
  {
    Icon: Play, color: '#fb923c', span: 1,
    title: 'Engenharia Reversa de Virais',
    tag: null,
    desc: 'Cole a URL de qualquer vídeo viral do seu nicho. A IA desmonta e extrai o que funcionou — pra você replicar com seu conteúdo.',
    detail: null,
  },
  {
    Icon: Route, color: '#f472b6', span: 1,
    title: 'Agentes por Nicho',
    tag: 'Pro',
    desc: 'Agentes especializados: Coach, Ecommerce, Saúde, Negócios. Cada um treinado pra falar com o cliente do seu mercado.',
    detail: null,
  },
]

export function LandingFeatures() {
  return (
    <section id="ferramentas" className="max-w-7xl mx-auto px-6 py-24">
      <div className="mb-14">
        <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9] mb-3">As ferramentas</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">
          Cada peça do sistema tem função.
        </h2>
        <p className="text-white/50 text-lg max-w-2xl">
          Não são features soltas. São etapas de um processo que começa no gancho e termina no cliente pagando.
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
