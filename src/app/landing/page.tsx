import Link from 'next/link'
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google'
import {
  ArrowRight, CheckCircle, Shield, Zap,
  Mic2, BookOpen, Brain, Sparkles, Rocket, X,
  MessageSquare, Play, Layers,
} from 'lucide-react'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-jakarta' })
const manrope = Manrope({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-manrope' })

/* ── DATA ── */
const STATS = [
  { value: '100+',  label: 'Ganchos prontos pra copiar' },
  { value: '15',    label: 'formatos virais estruturados' },
  { value: '5',     label: 'roteiros grátis por dia' },
  { value: '< 15m', label: 'do zero ao roteiro gravável' },
]

const BEFORE = [
  'Abre o celular, fica 20 minutos olhando a câmera sem saber o que falar.',
  'Posta na esperança — sem saber se aquele vídeo vai atrair cliente ou só view vazia.',
  'Sente que cria muito e não chega a lugar nenhum. Burnout de conteúdo real.',
]

const AFTER = [
  'Abre o Mapa, descreve o tema do vídeo, escolhe o formato — e recebe o roteiro pronto em segundos.',
  'Cada vídeo tem intenção: atrair, qualificar ou converter. A IA entende isso e escreve de acordo.',
  'Você para de improvisar e começa a executar. Com confiança. E no seu tom de voz.',
]

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Roteirista IA',
    desc: 'Chat igual ao ChatGPT, mas especializado em roteiros de Reels e TikTok. Você descreve o tema, escolhe o formato e recebe o roteiro completo — gancho, desenvolvimento e CTA — em menos de 30 segundos.',
    span: 2,
    tag: 'O coração da plataforma',
    color: '#0ea5e9',
  },
  {
    icon: Brain,
    title: 'Banco de Ganchos',
    desc: '100+ aberturas de vídeo organizadas por tipo (Verdade Chocante, Pergunta Provocativa, Promessa Direta...). Clicou, copiou, gravou.',
    span: 1,
    tag: null,
    color: '#a78bfa',
  },
  {
    icon: Layers,
    title: 'Formatos Virais',
    desc: '15 estruturas de vídeo que funcionam — Storytelling, Lista Chocante, Problema/Solução, Bastidores e mais. A IA usa o formato escolhido para montar seu roteiro.',
    span: 1,
    tag: null,
    color: '#22d3ee',
  },
  {
    icon: Mic2,
    title: 'Tom de Voz',
    desc: 'Configure uma vez o seu nicho, sua personalidade e seu estilo. A IA passa a escrever como você — não como um robô genérico.',
    span: 1,
    tag: null,
    color: '#34d399',
  },
  {
    icon: Play,
    title: 'Analisar Vídeo Viral',
    desc: 'Cole a URL de qualquer Reels ou TikTok viral. A IA desmonta o vídeo, extrai a estrutura e salva como formato reutilizável no seu acervo.',
    span: 1,
    tag: null,
    color: '#fb923c',
  },
]

const STEPS = [
  {
    n: '01', icon: Mic2, title: 'Configure seu Tom de Voz',
    desc: 'Conta pra IA qual é o seu nicho, quem é sua audiência e como você prefere se comunicar. Isso leva 2 minutos e muda tudo nos roteiros gerados.',
    from: '#0ea5e9', to: '#2563eb', mt: '',
  },
  {
    n: '02', icon: MessageSquare, title: 'Descreva o tema do vídeo',
    desc: 'No chat do Roteirista, escreva sua ideia em linguagem natural. Ex: "quero falar sobre os erros que iniciantes cometem no Instagram". Pronto.',
    from: '#3b82f6', to: '#7c3aed', mt: 'md:mt-12',
  },
  {
    n: '03', icon: BookOpen, title: 'Escolha o formato e receba o roteiro',
    desc: 'Selecione a estrutura (Storytelling, Lista, Problema/Solução...) e a IA entrega o roteiro completo — gancho, corpo e CTA. Adapte e grave.',
    from: '#7c3aed', to: '#a78bfa', mt: 'md:mt-24',
  },
]

const PLANS = [
  {
    id: 'mensal', label: 'Mensal', price: 'R$97', period: '/mês',
    desc: 'Acesso completo, sem limitações.',
    features: [
      'Roteirista IA sem limite diário',
      'Banco de 100+ ganchos',
      '15 formatos virais estruturados',
      'Tom de Voz personalizado',
      'Analisar vídeos virais',
    ],
    highlight: false, cta: 'Começar agora',
  },
  {
    id: 'semestral', label: 'Semestral', price: 'R$297', period: '/6 meses',
    desc: 'Mais escolhido — equivale a R$49/mês.',
    features: [
      'Tudo do plano Mensal',
      'Agentes de IA especializados',
      'Analisador de Bio',
      'Planejador de Rotina',
      'Suporte prioritário',
    ],
    highlight: true, badge: 'Economiza 49%', cta: 'Quero o Semestral',
  },
  {
    id: 'anual', label: 'Anual', price: 'R$497', period: '/ano',
    desc: 'Para criadores que jogam pra ganhar.',
    features: [
      'Tudo do plano Semestral',
      'Mentoria em grupo trimestral',
      'Acesso antecipado a novidades',
    ],
    highlight: false, cta: 'Garantir Anual',
  },
]

/* ── PAGE ── */
export default function LandingPage() {
  return (
    <div className={`${jakarta.variable} ${manrope.variable}`} style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
      <div className="min-h-screen bg-[#0e0e0e] text-[#e2e2e2] overflow-x-hidden selection:bg-[#0ea5e9]/30 selection:text-white">

        {/* ══ NAV ══ */}
        <nav className="fixed top-0 w-full z-50 bg-[#131313]/60 backdrop-blur-xl border-b border-white/5">
          <div className="flex justify-between items-center px-6 sm:px-8 py-4 w-full max-w-7xl mx-auto">
            <div className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
              Mapa do Engajamento
            </div>
            <div className="hidden md:flex items-center gap-8">
              {[['#como-funciona','Como funciona'],['#recursos','Ferramentas'],['#precos','Preços']].map(([href,label]) => (
                <a key={href} href={href} className="text-[#bec8d2] font-medium hover:text-white transition-colors text-sm">{label}</a>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden md:block text-[#bec8d2] font-medium hover:text-white transition-colors text-sm">Entrar</Link>
              <Link href="/login?mode=signup" className="bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                Testar grátis
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-24 relative">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          {/* ══ HERO ══ */}
          <section className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center mb-32 relative">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 backdrop-blur-md rounded-full px-4 py-1.5 mb-8">
              <Zap size={14} className="text-[#0ea5e9]" />
              <span className="text-sm font-bold text-[#0ea5e9]">Roteirista IA para criadores de conteúdo</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
              <span className="block text-[#e2e2e2]">Chega de criar conteúdo</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600">que ninguém vê.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#bec8d2] max-w-2xl mx-auto mb-3 leading-relaxed font-medium">
              Você descreve o tema. A IA escreve o roteiro completo — no seu tom de voz, no formato certo, pronto pra gravar em menos de 15 minutos.
            </p>
            <p className="text-base text-[#bec8d2]/60 max-w-xl mx-auto mb-10 leading-relaxed">
              5 roteiros por dia gratuitos. Sem precisar de cartão pra começar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full sm:w-auto">
              <Link
                href="/login?mode=signup"
                className="w-full sm:w-auto bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white rounded-xl px-8 py-4 font-bold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                style={{ boxShadow: '0 0 40px -10px rgba(14,165,233,0.4)' }}
              >
                Gerar meu primeiro roteiro <ArrowRight size={20} />
              </Link>
              <a
                href="#como-funciona"
                className="w-full sm:w-auto bg-white/5 border border-white/10 backdrop-blur-md text-[#e2e2e2] rounded-xl px-8 py-4 font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                Ver como funciona
              </a>
            </div>

            {/* Stats — produto real */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6">
              {STATS.map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>{s.value}</p>
                  <p className="text-sm text-[#bec8d2] font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ APP PREVIEW 3D ══ */}
          <section className="max-w-7xl mx-auto px-6 mb-32 relative">
            {/* Glow ambientes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#0ea5e9]/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-[#0ea5e9] mb-3">Plataforma completa</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
                Tudo que você precisa para <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">criar conteúdo viral.</span>
              </h2>
            </div>

            {/* Mockups 3D */}
            <div className="relative flex items-center justify-center" style={{ perspective: '1200px', minHeight: '420px' }}>

              {/* Left — ganchos, tilted left */}
              <div
                className="absolute left-0 hidden md:block w-[38%] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105"
                style={{
                  transform: 'rotateY(18deg) rotateX(3deg) translateZ(-60px) translateX(20px)',
                  boxShadow: '-20px 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.15)',
                  zIndex: 1,
                }}
              >
                <img src="/images/mockup-ganchos.png" alt="Banco de Ganchos — mais de 100 aberturas prontas" className="w-full h-auto block" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest">Banco de Ganchos</p>
                  <p className="text-sm font-semibold text-white mt-0.5">100+ aberturas prontas pra usar</p>
                </div>
              </div>

              {/* Center — roteirista, straight front */}
              <div
                className="relative w-full md:w-[50%] rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(14,165,233,0.2)] transition-transform duration-500 hover:scale-[1.02]"
                style={{ zIndex: 10 }}
              >
                <img src="/images/mockup-roteirista.png" alt="Roteirista IA — gere roteiros virais em segundos" className="w-full h-auto block" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs font-bold text-[#0ea5e9] uppercase tracking-widest">Roteirista IA</p>
                  <p className="text-sm font-semibold text-white mt-0.5">Do tema ao roteiro em menos de 30s</p>
                </div>
              </div>

              {/* Right — formatos, tilted right */}
              <div
                className="absolute right-0 hidden md:block w-[38%] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105"
                style={{
                  transform: 'rotateY(-18deg) rotateX(3deg) translateZ(-60px) translateX(-20px)',
                  boxShadow: '20px 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(14,165,233,0.12)',
                  zIndex: 1,
                }}
              >
                <img src="/images/mockup-formatos.png" alt="Formatos Virais — biblioteca de estruturas comprovadas" className="w-full h-auto block" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs font-bold text-[#22d3ee] uppercase tracking-widest">Formatos Virais</p>
                  <p className="text-sm font-semibold text-white mt-0.5">15 estruturas que geram resultado</p>
                </div>
              </div>
            </div>

            {/* Mobile: cards empilhados */}
            <div className="md:hidden mt-6 space-y-4">
              {[
                { src: '/images/mockup-ganchos.png', label: 'Banco de Ganchos', desc: '100+ aberturas prontas', color: '#8b5cf6' },
                { src: '/images/mockup-formatos.png', label: 'Formatos Virais', desc: '15 estruturas que convertem', color: '#22d3ee' },
              ].map(item => (
                <div key={item.label} className="rounded-2xl overflow-hidden border border-white/10">
                  <img src={item.src} alt={item.label} className="w-full h-auto block" />
                  <div className="p-4 bg-white/5">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: item.color }}>{item.label}</p>
                    <p className="text-sm text-white/80 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ BEFORE vs AFTER ══ */}
          <section className="max-w-7xl mx-auto px-6 mb-32 relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>Você reconhece esse loop?</h2>
              <p className="text-[#bec8d2] text-lg">A maioria dos criadores trava no mesmo lugar. Tem saída.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="bg-[#1b1b1b] border border-red-500/20 rounded-[1.5rem] p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <X size={22} className="text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>Sem direção</h3>
                </div>
                <ul className="space-y-6">
                  {BEFORE.map(b => (
                    <li key={b} className="flex items-start gap-4">
                      <X size={18} className="text-red-400/80 mt-0.5 shrink-0" />
                      <p className="text-[#bec8d2] text-sm leading-relaxed">{b}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {/* After */}
              <div className="bg-white/10 border border-[#0ea5e9]/30 backdrop-blur-md rounded-[1.5rem] p-8 md:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/10 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center">
                    <CheckCircle size={22} className="text-[#0ea5e9]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>Com o Mapa</h3>
                </div>
                <ul className="space-y-6 relative z-10">
                  {AFTER.map(a => (
                    <li key={a} className="flex items-start gap-4">
                      <CheckCircle size={18} className="text-[#0ea5e9] mt-0.5 shrink-0" />
                      <p className="text-[#e2e2e2] text-sm leading-relaxed">{a}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ══ HOW IT WORKS ══ */}
          <section className="mb-32 relative border-y border-white/5 bg-[#1b1b1b]/50 py-24" id="como-funciona">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/5 via-transparent to-[#d3bbff]/5 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>3 passos. 15 minutos. Roteiro pronto.</h2>
                <p className="text-[#bec8d2] text-lg">Sem curso, sem tutorial longo. Você usa e entende na hora.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-start relative">
                <div className="hidden md:block absolute top-[100px] left-[20%] w-[60%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                {STEPS.map(step => {
                  const Icon = step.icon
                  return (
                    <div key={step.n} className={`flex-1 bg-white/10 border border-white/15 backdrop-blur-xl rounded-[1.5rem] p-8 relative z-10 w-full ${step.mt}`}>
                      <div className="text-5xl font-black text-white/20 absolute top-6 right-6 leading-none" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>{step.n}</div>
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${step.from}, ${step.to})` }}
                      >
                        <Icon size={22} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>{step.title}</h3>
                      <p className="text-[#bec8d2] text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ══ FEATURES — Real Tools ══ */}
          <section className="max-w-7xl mx-auto px-6 mb-32 relative" id="recursos">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>O que tem dentro da plataforma.</h2>
              <p className="text-[#bec8d2] text-lg">Tudo isso você acessa no mesmo lugar, hoje.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ gridAutoRows: '280px' }}>
              {FEATURES.map(f => {
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className={`${f.span === 2 ? 'md:col-span-2' : ''} relative overflow-hidden rounded-[1.5rem] p-8 flex flex-col justify-between ${
                      f.span === 2
                        ? 'bg-white/10 border border-white/15 backdrop-blur-xl'
                        : 'bg-white/5 border border-white/10 backdrop-blur-md'
                    }`}
                  >
                    {f.tag && (
                      <div className="absolute top-6 right-6 bg-[#0ea5e9]/20 text-[#0ea5e9] text-xs font-bold px-3 py-1 rounded-full border border-[#0ea5e9]/30">
                        {f.tag}
                      </div>
                    )}
                    <div>
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10" style={{ color: f.color }}>
                        <Icon size={22} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>{f.title}</h3>
                      <p className="text-[#bec8d2] text-sm leading-relaxed max-w-sm">{f.desc}</p>
                    </div>
                    {f.span === 2 && (
                      <div className="w-full h-1 bg-white/5 mt-6 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-gradient-to-r from-[#0ea5e9] to-[#d3bbff]" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* ══ PRICING ══ */}
          <section className="max-w-7xl mx-auto px-6 mb-32 relative" id="precos">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>Comece grátis. Escale quando quiser.</h2>
              <p className="text-[#bec8d2] text-lg">5 roteiros por dia gratuitos, sem precisar de cartão. Quando quiser sem limite, escolha um plano.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  className={`relative rounded-[1.5rem] p-8 flex flex-col transition-all ${
                    plan.highlight
                      ? 'bg-white/10 border border-[#0ea5e9]/50 backdrop-blur-xl md:-mt-4 z-10'
                      : 'bg-[#1b1b1b] border border-white/10'
                  }`}
                  style={plan.highlight ? { boxShadow: '0 0 40px -10px rgba(14,165,233,0.3)' } : {}}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className={`font-bold text-white mb-2 ${plan.highlight ? 'text-2xl' : 'text-xl'}`} style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>{plan.label}</h3>
                  <p className={`text-sm mb-6 ${plan.highlight ? 'text-[#0ea5e9] font-medium' : 'text-[#bec8d2]'}`}>{plan.desc}</p>
                  <div className="mb-8">
                    <span className={`font-black text-white ${plan.highlight ? 'text-5xl' : 'text-4xl'}`} style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>{plan.price}</span>
                    <span className="text-[#bec8d2] text-sm ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-3.5 mb-8 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? 'text-white' : 'text-[#bec8d2]'}`}>
                        <CheckCircle size={16} className="text-[#0ea5e9] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/login?plan=${plan.id}&mode=signup`}
                    className={`w-full text-center rounded-xl px-6 font-bold transition-all ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white py-4 text-lg hover:scale-[1.02] shadow-lg'
                        : 'bg-white/5 border border-white/10 backdrop-blur-md text-white py-3 hover:bg-white/10'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            {/* Free tier note */}
            <p className="text-center text-[#bec8d2]/50 text-sm mt-8">
              Quer testar antes? <Link href="/login?mode=signup" className="text-[#0ea5e9] hover:underline font-medium">Crie uma conta grátis</Link> — 5 roteiros por dia, sem cartão.
            </p>
          </section>

          {/* ══ GUARANTEE ══ */}
          <section className="max-w-3xl mx-auto px-6 mb-32 relative">
            <div className="bg-[#131313] border border-white/10 rounded-[2rem] p-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#131313] to-[#2a2a2a] pointer-events-none" />
              <div className="relative z-10 w-24 h-24 shrink-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(255,255,255,0.05)' }}>
                <Shield size={48} className="text-[#e2e2e2]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>Garantia 7 dias incondicional</h3>
                <p className="text-[#bec8d2] text-sm leading-relaxed">
                  Se em 7 dias você achar que não valeu, manda uma mensagem e devolvemos 100%. Sem pergunta, sem burocracia. Acesse tudo, teste de verdade, e decide depois.
                </p>
              </div>
            </div>
          </section>

          {/* ══ FINAL CTA ══ */}
          <section className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] py-24 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23fff' fill-opacity='0.05'/%3E%3C/svg%3E\")" }} />
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <span className="inline-block bg-white/20 backdrop-blur-md text-white font-bold px-4 py-1.5 rounded-full text-sm mb-8 border border-white/30 uppercase tracking-widest shadow-lg">
                Comece agora — é grátis
              </span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
                Chega de criar conteúdo que ninguém vê.
              </h2>
              <p className="text-white/80 text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
                Você já tem a ideia. Falta a estrutura. É exatamente isso que o Mapa resolve — em menos de 15 minutos.
              </p>
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2 bg-white text-[#004c6e] rounded-xl px-10 py-5 font-black text-xl hover:scale-105 transition-transform shadow-2xl"
              >
                Gerar meu primeiro roteiro <Rocket size={22} />
              </Link>
              <p className="text-white/50 text-sm mt-6">5 roteiros grátis por dia · Sem cartão · Cancele quando quiser</p>
            </div>
          </section>
        </main>

        {/* ══ FOOTER ══ */}
        <footer className="bg-[#131313] w-full py-12 px-8 border-t border-[#1b1b1b]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
            <div className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
              Mapa do Engajamento
            </div>
            <div className="text-sm text-slate-500 text-center">
              © 2025 Mapa do Engajamento. Todos os direitos reservados.
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {[['#','Termos de Uso'],['#','Privacidade'],['mailto:suporte@protocoloviral.com.br','Suporte']].map(([href,label]) => (
                <a key={label} href={href} className="text-slate-500 hover:text-[#0ea5e9] transition-colors text-sm font-medium">{label}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
