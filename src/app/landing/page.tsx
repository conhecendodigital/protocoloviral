import Link from 'next/link'
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google'
import {
  ArrowRight, CheckCircle, Shield, Star, Zap,
  Search, PenLine, Video, BookOpen, Brain, TrendingUp, Rocket, X,
} from 'lucide-react'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-jakarta' })
const manrope = Manrope({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-manrope' })

/* ── DATA ── */
const STATS = [
  { value: '1400+', label: 'Roteiros Prontos' },
  { value: '430+',  label: 'Vídeos Analisados' },
  { value: '500+',  label: 'Criadores Ativos' },
  { value: '100+',  label: 'Ganchos Virais' },
]

const BEFORE = [
  'Posta todo dia sem saber o que funciona, torcendo para o algoritmo ajudar.',
  'Gasta horas pensando no que gravar e acaba travando na hora H.',
  'Muitas visualizações, mas ninguém clica no link da bio ou compra de você.',
]

const AFTER = [
  'Usa engenharia reversa para aplicar apenas o que já está validado no seu nicho.',
  'Abre a plataforma, escolhe um roteiro, adapta e grava em minutos.',
  'Cria funis de conteúdo que preparam a audiência e geram vendas automáticas.',
]

const FEATURES = [
  { icon: BookOpen, title: 'Biblioteca de Roteiros Validada', desc: 'Mais de 1.400 roteiros decupados dos maiores virais do mundo, prontos para adaptar para o seu nicho.', span: 2, popular: true, color: '#0ea5e9' },
  { icon: Brain, title: 'Ganchos Hipnóticos', desc: 'Os primeiros 3 segundos decidem o jogo. Acesse nosso cofre de ganchos de alta retenção.', span: 1, popular: false, color: '#d3bbff' },
  { icon: Video, title: 'Estrutura de Edição', desc: 'Não é só o texto. Aprenda o ritmo visual que prende a atenção do início ao fim.', span: 1, popular: false, color: '#22d3ee' },
  { icon: TrendingUp, title: 'Funis de Conversão Orgânica', desc: 'Estratégias detalhadas de como transformar a visualização do Reels/TikTok em um lead qualificado na sua base.', span: 2, popular: false, color: '#ffb86e' },
]

const STEPS = [
  { n: '01', icon: Search, title: 'Mapeamento', desc: 'Acesse a plataforma e filtre os roteiros mais adequados para o seu objetivo atual (venda, autoridade ou alcance).', from: '#0ea5e9', to: '#2563eb', mt: '' },
  { n: '02', icon: PenLine, title: 'Adaptação', desc: 'Use nossos frameworks para injetar o contexto do seu nicho e a sua personalidade na estrutura validada.', from: '#3b82f6', to: '#7c3aed', mt: 'md:mt-12' },
  { n: '03', icon: Video, title: 'Ação', desc: 'Grave com confiança sabendo exatamente o que falar para reter a atenção nos momentos cruciais do vídeo.', from: '#7c3aed', to: '#d3bbff', mt: 'md:mt-24' },
]

const TESTIMONIALS = [
  { name: 'Mariana Costa', quote: '"Eu passava horas tentando criar algo do zero. Com o Mapa, escolho a estrutura, adapto em 5 minutos e gravo. Meu perfil bateu 1M de contas alcançadas esse mês."', badge: '+48k seguidores', badgeColor: '#0ea5e9', initials: 'MC' },
  { name: 'Rafael Diniz', quote: '"O que mais me impressionou não foram as visualizações, mas a qualidade do público. Usei os roteiros de funil e fechei minha mentoria na primeira semana."', badge: 'R$40k faturados', badgeColor: '#d3bbff', initials: 'RD' },
  { name: 'Ana Silva', quote: '"Achei que meu nicho de contabilidade não dava certo no Reels. Peguei uma estrutura de storytelling do Mapa e adaptei. Foi meu primeiro vídeo com mais de 100k."', badge: 'Viral no B2B', badgeColor: '#22d3ee', initials: 'AS' },
  { name: 'Carlos Mendes', quote: '"O investimento se pagou no primeiro dia. Parei de assinar banco de ideias inúteis e agora tenho um direcionamento real e prático."', badge: 'ROI 10x', badgeColor: '#0ea5e9', initials: 'CM' },
]

const PLANS = [
  {
    id: 'mensal', label: 'Mensal', price: 'R$97', period: '/mês',
    desc: 'Acesso básico à plataforma.',
    features: ['Acesso à biblioteca principal', 'Atualizações mensais'],
    highlight: false, cta: 'Assinar Mensal',
  },
  {
    id: 'semestral', label: 'Semestral', price: 'R$297', period: '/6 meses',
    desc: 'O plano mais escolhido pelos criadores.',
    features: ['Tudo do plano mensal', 'Análises de virais premium', 'Módulo de Funis de Venda', 'Suporte prioritário'],
    highlight: true, badge: 'Economiza 49%', cta: 'Assinar Semestral',
  },
  {
    id: 'anual', label: 'Anual', price: 'R$497', period: '/ano',
    desc: 'Comprometimento de longo prazo.',
    features: ['Tudo do plano Semestral', 'Mentoria em grupo trimestral'],
    highlight: false, cta: 'Assinar Anual',
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
              {[['#recursos','Recursos'],['#depoimentos','Depoimentos'],['#precos','Preços']].map(([href,label]) => (
                <a key={href} href={href} className="text-[#bec8d2] font-medium hover:text-white transition-colors text-sm">{label}</a>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden md:block text-[#bec8d2] font-medium hover:text-white transition-colors text-sm">Entrar</Link>
              <Link href="#precos" className="bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                Começar grátis
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-24 relative">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          {/* ══ HERO ══ */}
          <section className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center mb-32 relative">

            {/* Social proof badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/15 backdrop-blur-md rounded-full px-4 py-1.5 mb-8">
              <div className="flex -space-x-2">
                {['MC','RD','AS'].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border border-[#131313] bg-gradient-to-br from-[#0ea5e9] to-[#6d28d9] flex items-center justify-center text-[9px] font-black text-white">{i}</div>
                ))}
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_,i) => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}
              </div>
              <span className="text-sm font-medium text-[#bec8d2]">Junte-se a 5.000+ criadores</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
              <span className="block text-[#e2e2e2]">Domine a Atenção.</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600">Escale suas Vendas.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#bec8d2] max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              O único ecossistema focado em engenharia de retenção que transforma visualizações rasas em audiência compradora e fiel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full sm:w-auto">
              <Link
                href="#precos"
                className="w-full sm:w-auto bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] text-white rounded-xl px-8 py-4 font-bold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                style={{ boxShadow: '0 0 40px -10px rgba(14,165,233,0.4)' }}
              >
                Desbloquear Acesso Agora <ArrowRight size={20} />
              </Link>
              <a
                href="#como-funciona"
                className="w-full sm:w-auto bg-white/5 border border-white/10 backdrop-blur-md text-[#e2e2e2] rounded-xl px-8 py-4 font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                Ver como funciona
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6">
              {STATS.map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>{s.value}</p>
                  <p className="text-sm text-[#bec8d2] font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ BEFORE vs AFTER ══ */}
          <section className="max-w-7xl mx-auto px-6 mb-32 relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>Pare de contar com a sorte.</h2>
              <p className="text-[#bec8d2] text-lg">A diferença entre quem tenta e quem escala.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="bg-[#1b1b1b] border border-red-500/20 rounded-[1.5rem] p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <X size={22} className="text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>Modo Amador</h3>
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
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>Método Engajamento</h3>
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

          {/* ══ FEATURES — Bento Grid ══ */}
          <section className="max-w-7xl mx-auto px-6 mb-32 relative" id="recursos">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>O arsenal completo.</h2>
              <p className="text-[#bec8d2] text-lg">Tudo que você precisa em uma única plataforma.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ gridAutoRows: '280px' }}>
              {FEATURES.map(f => {
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className={`${f.span === 2 ? 'md:col-span-2' : ''} relative overflow-hidden rounded-[1.5rem] p-8 flex flex-col justify-between ${
                      f.popular
                        ? 'bg-white/10 border border-white/15 backdrop-blur-xl'
                        : 'bg-white/5 border border-white/10 backdrop-blur-md'
                    }`}
                  >
                    {f.popular && (
                      <div className="absolute top-6 right-6 bg-[#0ea5e9]/20 text-[#0ea5e9] text-xs font-bold px-3 py-1 rounded-full border border-[#0ea5e9]/30">
                        Popular
                      </div>
                    )}
                    <div>
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10" style={{ color: f.color }}>
                        <Icon size={22} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>{f.title}</h3>
                      <p className="text-[#bec8d2] text-sm leading-relaxed max-w-sm">{f.desc}</p>
                    </div>
                    {f.popular && (
                      <div className="w-full h-1 bg-white/5 mt-6 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-gradient-to-r from-[#0ea5e9] to-[#d3bbff]" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* ══ HOW IT WORKS ══ */}
          <section className="mb-32 relative border-y border-white/5 bg-[#1b1b1b]/50 py-24" id="como-funciona">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/5 via-transparent to-[#d3bbff]/5 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>Fluxo de execução rápido.</h2>
                <p className="text-[#bec8d2] text-lg">Do zero ao play em menos de 15 minutos.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-start relative">
                {/* Connector line */}
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

          {/* ══ TESTIMONIALS ══ */}
          <section className="max-w-7xl mx-auto px-6 mb-32 relative" id="depoimentos">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>A matemática não mente.</h2>
              <p className="text-[#bec8d2] text-lg">Resultados de quem aplicou a engenharia de retenção.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {TESTIMONIALS.map(t => (
                <div key={t.name} className="bg-[#2a2a2a] border border-white/5 rounded-[1.5rem] p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_,i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-[#bec8d2] text-sm mb-6 leading-relaxed">{t.quote}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] flex items-center justify-center text-[11px] font-black text-white shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{t.name}</p>
                      <span
                        className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${t.badgeColor}20`, color: t.badgeColor }}
                      >
                        {t.badge}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ PRICING ══ */}
          <section className="max-w-7xl mx-auto px-6 mb-32 relative" id="precos">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>Escolha seu acesso.</h2>
              <p className="text-[#bec8d2] text-lg">Sem taxas ocultas, cancele quando quiser.</p>
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
                  Acesse todo o ecossistema, explore os roteiros e frameworks. Se você achar que a plataforma não vai acelerar seus resultados de forma imediata, basta um clique para receber 100% do seu dinheiro de volta. Sem perguntas, sem atrito.
                </p>
              </div>
            </div>
          </section>

          {/* ══ FINAL CTA ══ */}
          <section className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#6d28d9] py-24 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23fff' fill-opacity='0.05'/%3E%3C/svg%3E\")" }} />
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <span className="inline-block bg-white/20 backdrop-blur-md text-white font-bold px-4 py-1.5 rounded-full text-sm mb-8 border border-white/30 uppercase tracking-widest shadow-lg">
                Acesso Imediato Liberado
              </span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
                Chega de criar conteúdo que ninguém vê.
              </h2>
              <p className="text-white/80 text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
                Junte-se à revolução da retenção e comece a escalar sua audiência e faturamento hoje mesmo.
              </p>
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2 bg-white text-[#004c6e] rounded-xl px-10 py-5 font-black text-xl hover:scale-105 transition-transform shadow-2xl"
              >
                Quero Meu Acesso Agora <Rocket size={22} />
              </Link>
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
              {[['#','Termos de Uso'],['#','Privacidade'],['mailto:suporte@protocoloviral.com.br','Suporte'],['#','Afiliados']].map(([href,label]) => (
                <a key={label} href={href} className="text-slate-500 hover:text-[#0ea5e9] transition-colors text-sm font-medium">{label}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
