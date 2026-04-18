'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AlertCircle, AlertTriangle, BadgeCheck, BarChart3, Brain, Check, CheckCircle, Copy, Loader2, Sparkles, Wand2, Zap } from 'lucide-react'

interface AnalysisItem {
  label: string
  status: 'good' | 'warning' | 'error'
  detail: string
}

interface AnalysisResult {
  score: number
  items: AnalysisItem[]
  sugestao?: string
  explicacao?: string
}

export default function BioAnalyzerPage() {
  const [bio, setBio] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleAnalyze = async () => {
    if (!bio.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/analyze-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bio.trim() })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao analisar bio')
      }

      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Bio Lendária'
    if (score >= 70) return 'Perfil Otimizado'
    if (score >= 50) return 'Perfil com Potencial'
    return 'Precisa de Atenção Urgente'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 85) return 'Sua bio está no nível dos top creators. Continue assim e monitore as métricas de conversão.'
    if (score >= 70) return 'Sua bio está forte! Pequenos ajustes podem elevar a conversão de visitantes em seguidores.'
    if (score >= 50) return 'Sua bio está no caminho certo, mas perde visitantes por falta de clareza ou CTA. Siga as recomendações.'
    return 'Sua bio não está convertendo visitantes em seguidores. Aplique as correções abaixo com urgência.'
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-sky-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  const handleCopySuggestion = () => {
    if (result?.sugestao) {
      navigator.clipboard.writeText(result.sugestao)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-12">
          
          {/* Welcome/Title Banner */}
          <section className="text-center space-y-4">
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">ANALISE SUA BIO</span> COM IA
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-800 dark:text-white/90 text-lg max-w-2xl mx-auto">
              Nossa IA analisa 7 critérios de conversão da sua bio e gera uma versão otimizada personalizada para o seu nicho.
            </motion.p>
          </section>

          {/* Input & Score Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Input Area */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-7">
              <div className="glass-card p-8 rounded-xl h-full flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-white/90 uppercase tracking-widest">Sua Biografia Atual</label>
                  <span className={cn("text-xs font-medium uppercase tracking-widest", bio.length > 150 ? "text-red-400" : "text-slate-700 dark:text-white/90")}>
                    {bio.length} / 150 caracteres
                  </span>
                </div>
                <div className="flex-1 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-6 group focus-within:ring-2 focus-within:ring-[#0ea5e9]/50 transition-all shadow-sm">
                  <Textarea 
                    className="w-full h-full bg-transparent border-none p-0 text-slate-900 dark:text-white text-lg focus-visible:ring-0 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed min-h-[220px]" 
                    placeholder="Cole sua bio do Instagram aqui..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleAnalyze} 
                    disabled={!bio.trim() || loading}
                    className="flex-1 shimmer-btn text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="text-[20px] animate-spin" />
                        ANALISANDO COM IA...
                      </>
                    ) : (
                      <>
                        <Zap size={20} className="text-[20px] group-hover:scale-110 transition-transform" />
                        ANALISAR BIO COM IA
                      </>
                    )}
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(bio) }} className="size-14 glass-card rounded-xl flex items-center justify-center text-slate-800 dark:text-white/90 hover:text-slate-900 dark:text-white transition-colors">
                    <Copy size={18} />
                  </button>
                </div>

                {/* Error State */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={18} className="text-lg" />
                    {error}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Right: Score Display */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-5">
              <div className="glass-card p-8 rounded-xl h-full flex flex-col items-center justify-center relative overflow-hidden group min-h-[400px]">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <BarChart3 size={18} className="text-[140px] text-[#0ea5e9]" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-white/90 uppercase tracking-widest mb-10 text-center relative z-10">Score de Conversão</h3>
                
                <div className="relative flex items-center justify-center z-10">
                  <svg className="size-56" style={{ transform: "rotate(-90deg)" }}>
                    <circle className="text-slate-200 dark:text-white/5" cx="112" cy="112" fill="transparent" r="90" stroke="currentColor" strokeWidth="12"></circle>
                    <circle 
                      className={cn(
                        "drop-shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        result ? getScoreColor(result.score) : "text-[#0ea5e9]"
                      )}
                      cx="112" cy="112" fill="transparent" r="90" stroke="currentColor" 
                      strokeDasharray="565.48" 
                      strokeDashoffset={result ? 565.48 - (565.48 * result.score) / 100 : 565.48}
                      strokeLinecap="round" strokeWidth="12"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pb-2">
                    {loading ? (
                      <Brain size={48} className="text-5xl text-[#0ea5e9] animate-pulse" />
                    ) : (
                      <>
                        <span className={cn("text-6xl font-black", result ? getScoreColor(result.score) : "text-slate-900 dark:text-white")}>{result ? result.score : '--'}</span>
                        <span className="text-slate-700 dark:text-white/90 text-xs font-bold uppercase tracking-widest leading-none">de 100</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-10 text-center px-4 relative z-10 min-h-[80px]">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-full">
                        <span className="size-2 rounded-full bg-[#0ea5e9] animate-pulse"></span>
                        <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest">IA Analisando...</span>
                      </div>
                      <p className="text-slate-800 dark:text-white/90 text-sm">Avaliando 7 critérios de conversão com inteligência artificial</p>
                    </div>
                  ) : result ? (
                    <>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-full mb-3">
                        <span className="size-2 rounded-full bg-[#0ea5e9] animate-pulse"></span>
                        <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest">{getScoreLabel(result.score)}</span>
                      </div>
                      <p className="text-slate-800 dark:text-white/90 text-sm leading-relaxed max-w-[280px]">
                        {getScoreMessage(result.score)}
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-700 dark:text-white/90 text-sm leading-relaxed">
                      Aguardando texto da biografia para análise com IA.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Results Section */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: 0.1 }}>
                
                {/* Recommendations Section */}
                <section className="space-y-6 mb-12">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <BarChart3 size={18} className="text-[#0ea5e9]" />
                    Diagnóstico da IA — 7 Critérios
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.items.map((item, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (i * 0.08) }}
                        className={cn(
                          "glass-card p-6 rounded-xl flex gap-4 items-start border-l-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                          item.status === 'good' ? "border-l-emerald-500/50" : item.status === 'warning' ? "border-l-orange-500/50" : "border-l-rose-500/50"
                        )}
                      >
                        <div className={cn(
                          "size-10 rounded-full flex items-center justify-center shrink-0 border",
                          item.status === 'good' ? "bg-emerald-500/10 border-emerald-500/20" : item.status === 'warning' ? "bg-orange-500/10 border-orange-500/20" : "bg-rose-500/10 border-rose-500/20"
                        )}>
                          {item.status === 'good' ? <CheckCircle size={18} className="text-emerald-500" /> : item.status === 'warning' ? <AlertTriangle size={18} className="text-orange-500" /> : <AlertCircle size={18} className="text-rose-500" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-slate-900 dark:text-white font-bold">{item.label}</h4>
                          <p className="text-sm text-slate-800 dark:text-white/90 leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* AI Suggested Bio */}
                {result.sugestao && (
                  <motion.section 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.6 }}
                    className="glass-card p-8 rounded-xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                      <Wand2 size={18} className="text-[100px] text-[#0ea5e9]" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles size={18} className="text-[#0ea5e9]" />
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bio Reescrita pela IA</h3>
                        </div>
                        {result.explicacao && (
                          <p className="text-slate-800 dark:text-white/90">{result.explicacao}</p>
                        )}
                      </div>
                      <button 
                        onClick={handleCopySuggestion} 
                        className="shimmer-btn text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#0ea5e9]/20 md:w-auto w-full justify-center group/btn"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'COPIADA!' : 'COPIAR BIO'}
                      </button>
                    </div>
                    
                    <div className="mt-8 bg-slate-100 dark:bg-black/60 p-6 rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white leading-relaxed text-lg shadow-inner font-medium whitespace-pre-line">
                      {result.sugestao}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-700 dark:text-white/90">
                      <BadgeCheck size={14} className="text-sm text-emerald-500" />
                      <span>{result.sugestao.length} caracteres — {result.sugestao.length <= 150 ? 'Dentro do limite ideal' : 'Excede 150 caracteres, ajuste manualmente'}</span>
                    </div>
                  </motion.section>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </>
  )
}
