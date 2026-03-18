'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Formato {
  id: string
  titulo: string
  plataforma: 'Instagram' | 'TikTok'
  tipo: string
  descricao: string
  video_url: string
  link_original: string
  estudo: string
  destaque: boolean
  data: string
}

// Mock data — depois será substituído por Supabase
const FORMATOS_MOCK: Formato[] = [
  {
    id: '1',
    titulo: 'Carrossel Storytelling com Hook Emocional',
    plataforma: 'Instagram',
    tipo: 'Carrossel',
    descricao: 'O formato que mais converte no Instagram em 2025 — storytelling em 7 slides com gancho emocional nos primeiros 3 segundos.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    link_original: 'https://instagram.com/p/exemplo1',
    estudo: `📊 ANÁLISE DO FORMATO: Carrossel Storytelling

🎯 POR QUE FUNCIONA:
Este formato explora 3 gatilhos psicológicos simultâneos:

1. CURIOSIDADE — O primeiro slide cria uma "lacuna de informação" 
   que o cérebro precisa preencher (teoria do Information Gap de Loewenstein).

2. NARRATIVA — Slides 2-5 constroem uma jornada com conflito e resolução,
   ativando o córtex pré-frontal e gerando empatia.

3. PROVA SOCIAL — Slide 6 apresenta números/resultados reais,
   ativando o viés de autoridade (princípio de Cialdini).

📈 MÉTRICAS ESPERADAS:
• Salvamentos: 3-5x maior que post único
• Compartilhamentos: 2x maior
• Tempo na publicação: 45-90 segundos (vs 3s de um post normal)
• Taxa de conversão para follow: 8-12%

🧪 COMO REPLICAR:
Slide 1: Gancho emocional ("Eu quase desisti de tudo quando...")
Slide 2-3: Contexto do problema
Slide 4-5: A virada / solução
Slide 6: Resultado com números
Slide 7: CTA direto ("Salva pra aplicar" ou "Comenta EU QUERO")

⚡ DICA PRO: Use a primeira frase como gancho no caption também.
O Instagram mostra as 2 primeiras linhas — faça valer.`,
    destaque: true,
    data: '2025-03-15',
  },
  {
    id: '2',
    titulo: 'Reels "POV" com Texto Dinâmico',
    plataforma: 'Instagram',
    tipo: 'Reels',
    descricao: 'Formato POV com texto sobreposto que viraliza por ser ultra-relatável. Funciona em qualquer nicho.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    link_original: 'https://instagram.com/reel/exemplo2',
    estudo: `📊 ANÁLISE DO FORMATO: Reels POV com Texto

🎯 POR QUE FUNCIONA:
O formato POV ("Point of View") funciona porque coloca o 
espectador DENTRO da experiência, não como observador.

1. IDENTIFICAÇÃO INSTANTÂNEA — "POV: você é..." cria um espelho
   mental que ativa neurônios-espelho no cérebro.

2. SIMPLICIDADE — Não precisa de edição complexa. Um celular,
   uma situação relatable, texto sobreposto = viral.

3. FORMATO CURTO — 7-15 segundos. O Instagram prioriza reels
   com alta taxa de replay. Mais curto = mais replays.

📈 MÉTRICAS ESPERADAS:
• Alcance: 5-10x seus seguidores
• Replays: 30-50% de taxa de replay
• Comentários: 4x mais (pessoas marcam amigos)
• Viralização: Alto potencial de ir para Explore

🧪 COMO REPLICAR:
1. Escolha uma situação UNIVERSAL do seu nicho
2. Comece com "POV:" no texto do vídeo
3. Grave uma reação genuína (não forçada)
4. Use áudio trending (verifique a seta ↗ no app)
5. Máximo 15 segundos
6. Legenda: "Marque alguém que faz isso 😂"

⚡ DICA PRO: Poste entre 18h-21h nos dias de semana.
POVs performam melhor quando as pessoas estão relaxando.`,
    destaque: false,
    data: '2025-03-12',
  },
  {
    id: '3',
    titulo: 'Dueto com Especialista',
    plataforma: 'TikTok',
    tipo: 'Dueto',
    descricao: 'Use o dueto para reagir a um conteúdo viral. Pega carona no alcance do vídeo original e adiciona sua autoridade.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    link_original: 'https://tiktok.com/@exemplo/video/123',
    estudo: `📊 ANÁLISE DO FORMATO: Dueto com Especialista

🎯 POR QUE FUNCIONA:
O dueto é o formato mais inteligente do TikTok porque você
"empresta" o alcance de um vídeo que já viralizou.

1. EFEITO CARONA — O algoritmo do TikTok associa seu vídeo ao
   original. Se o original viralizou, o seu tem mais chances.

2. AUTORIDADE POR CONTRASTE — Ao reagir/complementar, você se
   posiciona como especialista sem parecer prepotente.

3. ENGAJAMENTO CRUZADO — Seguidores do criador original descobrem
   você. É networking algorítmico.

📈 MÉTRICAS ESPERADAS:
• Views: 5-20x seus seguidores
• Novos seguidores: 100-500 por vídeo viral
• Comentários: Debates geram mais engajamento
• Compartilhamentos: Alto (pessoas enviam pros dois lados)

🧪 COMO REPLICAR:
1. Encontre um vídeo trending no seu nicho (1-3 dias de idade)
2. Prepare sua "reação expert" (30-60 segundos)
3. Use Dueto > tela dividida
4. Comece com "Isso é VERDADE, mas..." ou "O que faltou dizer..."
5. Finalize com sua versão/complemento
6. Use as mesmas hashtags do vídeo original + suas

⚡ DICA PRO: Duetos com vídeos de 1-3 dias performam melhor
que vídeos super virais antigos. Timing é tudo.`,
    destaque: true,
    data: '2025-03-10',
  },
  {
    id: '4',
    titulo: 'Before/After com Transição',
    plataforma: 'TikTok',
    tipo: 'Transição',
    descricao: 'Transição antes/depois com corte seco. O formato mais impactante para mostrar resultados reais.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    link_original: 'https://tiktok.com/@exemplo/video/456',
    estudo: `📊 ANÁLISE DO FORMATO: Before/After Transition

🎯 POR QUE FUNCIONA:
O antes/depois é o formato mais primitivo de "prova".
O cérebro humano PRECISA ver contraste para processar valor.

1. CONTRASTE VISUAL — A diferença entre "antes" e "depois"
   ativa o sistema de recompensa dopaminérgico.

2. PROVA IRREFUTÁVEL — Não é argumento, é evidência visual.
   Elimina ceticismo instantaneamente.

3. ASPIRACIONAL — O espectador se projeta no "depois",
   criando desejo de seguir + comprar.

📈 MÉTRICAS ESPERADAS:
• Views: 10-50x seus seguidores (alto potencial viral)
• Comentários: Muitos "como?" e "quanto tempo?"
• DMs: Alto volume de perguntas (oportunidade de venda)
• Follow rate: 15-25% de novos seguidores

🧪 COMO REPLICAR:
1. Grave o "antes" com iluminação/ângulo desfavorável (natural)
2. Grave o "depois" com boa iluminação e confiança
3. Use transição de corte seco (não precisa ser fancy)
4. Áudio motivacional ou trending
5. Texto: "3 meses de consistência"
6. CTA: "Quer o plano? Comenta EU QUERO"

⚡ DICA PRO: Resultados reais > Resultados perfeitos.
Mostre a jornada honesta. Autenticidade converte mais.`,
    destaque: false,
    data: '2025-03-08',
  },
  {
    id: '5',
    titulo: 'Talking Head com Legenda Animada',
    plataforma: 'Instagram',
    tipo: 'Reels',
    descricao: 'Você falando direto pra câmera com legenda estilo CapCut. O formato mais forte para construir autoridade.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    link_original: 'https://instagram.com/reel/exemplo5',
    estudo: `📊 ANÁLISE DO FORMATO: Talking Head + Legendas

🎯 POR QUE FUNCIONA:
85% dos vídeos no Instagram são assistidos SEM som.
Legendas transformam "skip" em "watch completo".

1. CONEXÃO FACIAL — Ver um rosto ativa a amígdala cerebral,
   criando confiança e conexão emocional.

2. ACESSIBILIDADE — Legendas permitem consumo em qualquer
   contexto: transporte, trabalho, madrugada.

3. RETENÇÃO — Texto + áudio + visual = 3 canais sensoriais.
   A retenção é 3x maior que vídeo sem legenda.

📈 MÉTRICAS ESPERADAS:
• Watch time: 65-80% (vs 30% sem legenda)
• Seguidores: Alto potencial de conversão
• Autoridade: Posiciona como especialista
• Engajamento: Comentários relevantes (perguntas reais)

🧪 COMO REPLICAR:
1. Gancho nos primeiros 2 segundos (olhe direto na câmera)
2. Fale com energia mas sem forçar
3. Máximo 60 segundos (ideal: 30-45s)
4. Use CapCut ou Submagic para legendas automáticas
5. Destaque palavras-chave em cores diferentes
6. Termine com pergunta para gerar comentários

⚡ DICA PRO: Grave em formato vertical (9:16).
Use luz natural de frente. Fundo clean mas não estéril.`,
    destaque: false,
    data: '2025-03-05',
  },
]

const PLATAFORMAS = ['Todos', 'Instagram', 'TikTok'] as const

export default function FormatosPage() {
  const [filtroAtivo, setFiltroAtivo] = useState('Todos')
  const [modalFormato, setModalFormato] = useState<Formato | null>(null)

  const formatosFiltrados = filtroAtivo === 'Todos'
    ? FORMATOS_MOCK
    : FORMATOS_MOCK.filter(f => f.plataforma === filtroAtivo)

  return (
    <>
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
        <div className="p-6 lg:p-12 max-w-6xl mx-auto w-full space-y-12">

          {/* Title */}
          <section className="text-center space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">FORMATOS</span> QUE VIRALIZAM
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Análises semanais dos formatos mais eficientes do Instagram e TikTok.
            </motion.p>
          </section>

          {/* Platform Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {PLATAFORMAS.map(plat => (
              <button
                key={plat}
                onClick={() => setFiltroAtivo(plat)}
                className={`flex items-center gap-2 text-xs py-2.5 px-6 rounded-full font-bold uppercase tracking-widest transition-all ${
                  filtroAtivo === plat
                    ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20'
                    : 'glass-card text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                {plat === 'Instagram' && <span className="text-sm">📸</span>}
                {plat === 'TikTok' && <span className="text-sm">🎵</span>}
                {plat === 'Todos' && <span className="text-sm">🔥</span>}
                {plat}
              </button>
            ))}
          </motion.div>

          {/* Formats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {formatosFiltrados.map((formato, i) => (
              <motion.div
                key={formato.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.08, 0.3) }}
                className="glass-card rounded-2xl overflow-hidden group relative"
              >
                {/* Destaque Badge */}
                {formato.destaque && (
                  <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/20">
                    <span className="material-symbols-outlined text-[12px]">star</span>
                    Destaque
                  </div>
                )}

                {/* Video Embed (vertical 9:16) */}
                <div className="relative w-full aspect-[9/16] max-h-[400px] bg-black/50 overflow-hidden">
                  <iframe
                    src={formato.video_url}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={formato.titulo}
                  />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Platform + Type + Date */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[10px] px-2.5 py-1 rounded font-black tracking-widest uppercase ${
                      formato.plataforma === 'Instagram'
                        ? 'text-pink-400 bg-pink-500/10'
                        : 'text-cyan-400 bg-cyan-500/10'
                    }`}>
                      {formato.plataforma === 'Instagram' ? '📸' : '🎵'} {formato.plataforma}
                    </span>
                    <span className="text-[10px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-2.5 py-1 rounded font-black tracking-widest uppercase">
                      {formato.tipo}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium ml-auto">
                      {new Date(formato.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-xl tracking-tight text-white leading-tight">{formato.titulo}</h3>

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed">{formato.descricao}</p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={formato.link_original}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all font-semibold"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      Ver Original
                    </a>
                    <button
                      onClick={() => setModalFormato(formato)}
                      className="flex items-center gap-2 text-xs py-2.5 px-4 rounded-xl font-bold transition-all bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">science</span>
                      Ver Estudo
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {formatosFiltrados.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">movie_filter</span>
              <p className="text-slate-400 text-lg">Nenhum formato encontrado para esta plataforma.</p>
              <button
                onClick={() => setFiltroAtivo('Todos')}
                className="mt-4 text-[#0ea5e9] text-sm font-bold hover:underline"
              >
                Ver todos os formatos
              </button>
            </div>
          )}

          <div className="pb-10" />
        </div>
      </main>

      {/* ===== STUDY MODAL (responsive popup) ===== */}
      <AnimatePresence>
        {modalFormato && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setModalFormato(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal Content */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-[#0a0f1e] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
            >
              {/* Modal Header */}
              <div className="relative shrink-0">
                {/* Top accent line */}
                <div className="modal-header-line" />

                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                <div className="px-6 py-4 sm:py-5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase ${
                        modalFormato.plataforma === 'Instagram'
                          ? 'text-pink-400 bg-pink-500/10'
                          : 'text-cyan-400 bg-cyan-500/10'
                      }`}>
                        {modalFormato.plataforma === 'Instagram' ? '📸' : '🎵'} {modalFormato.plataforma}
                      </span>
                      <span className="text-[10px] text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                        {modalFormato.tipo}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                      {modalFormato.titulo}
                    </h2>
                  </div>
                  <button
                    onClick={() => setModalFormato(null)}
                    className="shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body (scrollable) */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                {/* Video Embed (vertical 9:16) */}
                <div className="relative w-full max-w-[320px] mx-auto aspect-[9/16] rounded-xl overflow-hidden bg-black/50 mb-6">
                  <iframe
                    src={modalFormato.video_url}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={modalFormato.titulo}
                  />
                </div>

                {/* Link Original */}
                <a
                  href={modalFormato.link_original}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-slate-300 bg-white/5 py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all font-semibold mb-6"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Ver Original no {modalFormato.plataforma}
                </a>

                {/* Study Terminal */}
                <div className="rounded-xl overflow-hidden border border-white/10 bg-[#000000] shadow-2xl">
                  <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="ml-4 text-xs font-mono text-slate-500">
                      estudo_{modalFormato.id.padStart(2, '0')}.md
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(modalFormato.estudo)
                        } catch {
                          const ta = document.createElement('textarea')
                          ta.value = modalFormato.estudo
                          ta.style.position = 'fixed'
                          ta.style.opacity = '0'
                          document.body.appendChild(ta)
                          ta.select()
                          document.execCommand('copy')
                          document.body.removeChild(ta)
                        }
                      }}
                      className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-all font-bold uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Copiar
                    </button>
                  </div>
                  <div className="p-4 sm:p-6 overflow-x-auto">
                    <pre className="text-[13px] sm:text-[14px] font-mono text-[#0ea5e9] whitespace-pre-wrap leading-relaxed">
                      {modalFormato.estudo}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
