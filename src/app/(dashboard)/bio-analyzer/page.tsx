'use client'

import { useState } from 'react'

import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnalysisResult {
  score: number
  items: { label: string; status: 'good' | 'warning' | 'error'; detail: string }[]
}

function analyzeBio(bio: string): AnalysisResult {
  const items: AnalysisResult['items'] = []
  const len = bio.length

  if (len === 0) {
    items.push({ label: 'Tamanho Ideal', status: 'error', detail: 'Vago' })
  } else if (len <= 80) {
    items.push({ label: 'Tamanho Ideal', status: 'warning', detail: 'Curto' })
  } else if (len <= 150) {
    items.push({ label: 'Tamanho Ideal', status: 'good', detail: 'Perfeito' })
  } else {
    items.push({ label: 'Tamanho Ideal', status: 'error', detail: 'Excede limites' })
  }

  const ctaWords = ['link', 'clique', 'acesse', 'confira', 'saiba', 'baixe', 'entre', 'cadastre', 'conheça', 'chama', 'manda', '👇', '⬇️']
  const hasCta = ctaWords.some(w => bio.toLowerCase().includes(w))
  items.push({ label: 'Chamada para Ação (CTA)', status: hasCta ? 'good' : 'error', detail: hasCta ? 'Ativo' : 'Ausente' })

  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
  const emojiCount = (bio.match(emojiRegex) || []).length
  if (emojiCount === 0) {
    items.push({ label: 'Uso de Emojis', status: 'error', detail: 'Faltando' })
  } else if (emojiCount <= 5) {
    items.push({ label: 'Uso de Emojis', status: 'good', detail: 'Ideal' })
  } else {
    items.push({ label: 'Uso de Emojis', status: 'warning', detail: 'Excesso' })
  }

  const valueWords = ['ajudo', 'ensino', 'transformo', 'especialista', 'expert', 'criador', 'mentor', 'coach', 'consultor', 'estratégia']
  const hasValue = valueWords.some(w => bio.toLowerCase().includes(w))
  items.push({ label: 'Proposta de Valor', status: hasValue ? 'good' : 'warning', detail: hasValue ? 'Forte' : 'Vago' })

  const points = items.reduce((acc, i) => acc + (i.status === 'good' ? 25 : i.status === 'warning' ? 10 : 0), 0)
  const score = Math.min(100, points)

  return { score, items }
}

export default function BioAnalyzerPage() {
  const [bio, setBio] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = () => {
    if (!bio.trim()) return
    setResult(analyzeBio(bio))
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Perfil Altamente Otimizado'
    if (score >= 50) return 'Perfil com Potencial'
    return 'Precisa de Atenção'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Sua bio está excelente! Pequenos ajustes podem levar você ao nível lendário de conversão.'
    if (score >= 50) return 'Sua bio está no caminho certo. Siga as recomendações abaixo para aumentar o impacto.'
    return 'Sua bio está fraca e não atrai seguidores no momento. Concentre-se nas áreas críticas abaixo.'
  }

  const handleCopySuggestion = () => {
    const suggestedBio = `🚀 Estrategista do seu nicho & Título Forte
🌟 +X conquistas ou dados reais
👇 Transforme seu problema hoje (CTA)
link.me/seu-link`
    navigator.clipboard.writeText(suggestedBio)
    alert("Sugestão copiada!") // simple feedback
  }

  return (
    <>
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-12">
          
          {/* Welcome/Title Banner */}
          <section className="text-center space-y-4">
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
              Analise sua Bio com IA
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-400 text-lg max-w-2xl mx-auto">
              Insira sua descrição atual e descubra como aumentar sua conversão de seguidores em até 45%.
            </motion.p>
          </section>

          {/* Input & Score Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Input Area */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-7">
              <div className="glass-card p-8 rounded-xl h-full flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sua Biografia Atual</label>
                  <span className={cn("text-xs font-medium uppercase tracking-widest", bio.length > 150 ? "text-red-400" : "text-slate-500")}>
                    {bio.length} / 150 caracteres
                  </span>
                </div>
                <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-6 group focus-within:ring-2 focus-within:ring-[#0ea5e9]/50 transition-all">
                  <Textarea 
                    className="w-full h-full bg-transparent border-none p-0 text-white text-lg focus-visible:ring-0 resize-none placeholder:text-slate-700 leading-relaxed min-h-[160px]" 
                    placeholder="Insira sua bio aqui..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleAnalyze} 
                    disabled={!bio.trim()}
                    className="flex-1 shimmer-btn text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">bolt</span>
                    ANALISAR BIO
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(bio) }} className="size-14 glass-card rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right: Score Display */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-5">
              <div className="glass-card p-8 rounded-xl h-full flex flex-col items-center justify-center relative overflow-hidden group min-h-[400px]">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <span className="material-symbols-outlined text-[140px] text-[#0ea5e9]">monitoring</span>
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-10 text-center relative z-10">Score de Engajamento</h3>
                
                <div className="relative flex items-center justify-center z-10">
                  <svg className="size-56" style={{ transform: "rotate(-90deg)" }}>
                    <circle className="text-white/5" cx="112" cy="112" fill="transparent" r="90" stroke="currentColor" strokeWidth="12"></circle>
                    <circle 
                      className="text-[#0ea5e9] drop-shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
                      cx="112" cy="112" fill="transparent" r="90" stroke="currentColor" 
                      strokeDasharray="565.48" 
                      strokeDashoffset={result ? 565.48 - (565.48 * result.score) / 100 : 565.48}
                      strokeLinecap="round" strokeWidth="12"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pb-2">
                    <span className="text-6xl font-black text-white">{result ? result.score : '--'}</span>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-none">de 100</span>
                  </div>
                </div>

                <div className="mt-10 text-center px-4 relative z-10 min-h-[80px]">
                  {result ? (
                    <>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-full mb-3">
                        <span className="size-2 rounded-full bg-[#0ea5e9] animate-pulse"></span>
                        <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest">{getScoreLabel(result.score)}</span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
                        {getScoreMessage(result.score)}
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Aguardando texto da biografia para gerar o score.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {/* Recommendations Section */}
              <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#0ea5e9]">analytics</span>
                  Recomendações de Melhoria
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.items.map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
                      className={cn(
                        "glass-card p-6 rounded-xl flex gap-4 items-start border-l-4 hover:bg-white/5 transition-colors",
                        item.status === 'good' ? "border-l-emerald-500/50" : item.status === 'warning' ? "border-l-orange-500/50" : "border-l-rose-500/50"
                      )}
                    >
                      <div className={cn(
                        "size-10 rounded-full flex items-center justify-center shrink-0 border",
                        item.status === 'good' ? "bg-emerald-500/10 border-emerald-500/20" : item.status === 'warning' ? "bg-orange-500/10 border-orange-500/20" : "bg-rose-500/10 border-rose-500/20"
                      )}>
                        <span className={cn(
                          "material-symbols-outlined",
                          item.status === 'good' ? "text-emerald-500" : item.status === 'warning' ? "text-orange-500" : "text-rose-500"
                        )}>
                          {item.status === 'good' ? 'check_circle' : item.status === 'warning' ? 'warning' : 'error'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-white font-bold">{item.label}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          Status atual: <span className="font-semibold text-slate-300 uppercase text-xs">{item.detail}</span>.
                          {item.status !== 'good' && ' Revise sua bio para otimizar esse requisito.'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Suggested Bio Section */}
              {result.score < 100 && (
                <section className="glass-card p-8 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <span className="material-symbols-outlined text-[100px] text-[#0ea5e9]">auto_fix</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white tracking-tight">Bio Sugerida pela IA</h3>
                      <p className="text-slate-400">Versão otimizada com foco em autoridade e facilidade de leitura.</p>
                    </div>
                    <button 
                      onClick={handleCopySuggestion} 
                      className="shimmer-btn text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#0ea5e9]/20 md:w-auto w-full justify-center group"
                    >
                      <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">content_copy</span>
                      COPIAR SUGESTÃO
                    </button>
                  </div>
                  
                  <div className="mt-8 bg-black/60 p-6 rounded-xl border border-white/5 italic text-slate-200 leading-relaxed text-lg shadow-inner">
                    "🚀 [Seu Posicionamento/Especialidade]<br/>
                    🏆 [Prova Social Clara ou Resultado]<br/>
                    👇 [Chamada para Ação Forte]<br/>
                    [Seu Link]"
                  </div>
                </section>
              )}
            </motion.div>
          )}

        </div>
      </main>
    </>
  )
}

