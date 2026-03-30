'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Formato = 'reels' | 'carrossel' | 'imagem' | 'stories'

const BENCHMARKS: Record<Formato, { engajamento: [number, number, number]; salvamento: [number, number, number]; compartilhamento: [number, number, number] }> = {
  reels:      { engajamento: [1.5, 3, 6],   salvamento: [0.5, 1.5, 3],   compartilhamento: [0.3, 1, 2.5] },
  carrossel:  { engajamento: [1.5, 3, 5],   salvamento: [1, 2, 4],       compartilhamento: [0.2, 0.8, 2] },
  imagem:     { engajamento: [0.8, 2, 4],   salvamento: [0.3, 1, 2],     compartilhamento: [0.1, 0.5, 1.5] },
  stories:    { engajamento: [1, 2.5, 5],   salvamento: [0.2, 0.8, 1.5], compartilhamento: [0.1, 0.5, 1] },
}

const FORMATO_LABELS: Record<Formato, string> = {
  reels: '🎬 Reels',
  carrossel: '📚 Carrossel',
  imagem: '🖼️ Imagem',
  stories: '📱 Stories',
}

function classifyRate(value: number, thresholds: [number, number, number]): { label: string; color: string; emoji: string; bg: string; border: string } {
  if (value >= thresholds[2]) return { label: 'Excelente', color: 'text-emerald-400', emoji: '🟢', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
  if (value >= thresholds[1]) return { label: 'Bom', color: 'text-sky-400', emoji: '🔵', bg: 'bg-sky-500/10', border: 'border-sky-500/20' }
  if (value >= thresholds[0]) return { label: 'Médio', color: 'text-amber-400', emoji: '🟡', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
  return { label: 'Baixo', color: 'text-red-400', emoji: '🔴', bg: 'bg-red-500/10', border: 'border-red-500/20' }
}

function getDica(engajamento: number, salvamento: number, compartilhamento: number, alcanceRate: number): string[] {
  const dicas: string[] = []
  if (engajamento < 1.5) dicas.push('💡 Engajamento baixo? Teste ganchos mais fortes na primeira linha e adicione um CTA claro no final.')
  if (engajamento >= 3) dicas.push('🔥 Engajamento forte! Continue criando conteúdo nesse estilo — está funcionando.')
  if (salvamento >= 2) dicas.push('📌 Seus salvamentos estão altos! Faça mais conteúdo educativo e dicas práticas.')
  if (salvamento < 0.5) dicas.push('💡 Poucos salvamentos? Crie conteúdo que as pessoas queiram rever depois (listas, tutoriais, checklists).')
  if (compartilhamento >= 1) dicas.push('🚀 Compartilhamentos altos = potencial viral! Aposte em conteúdo que gera identificação.')
  if (compartilhamento < 0.3) dicas.push('💡 Para mais compartilhamentos, crie conteúdo que faça a pessoa pensar "preciso enviar pra alguém".')
  if (alcanceRate < 10) dicas.push('⚠️ Alcance muito baixo. O algoritmo pode não estar entregando. Poste em horários de pico e use hashtags estratégicas.')
  if (alcanceRate >= 100) dicas.push('🎯 Alcance acima de 100%! Seu conteúdo está chegando a não-seguidores — ótimo sinal de viralização.')
  if (dicas.length === 0) dicas.push('📊 Continue acompanhando suas métricas semanalmente para identificar padrões.')
  return dicas
}

export default function CalculadoraPage() {
  const [formato, setFormato] = useState<Formato>('reels')
  const [seguidores, setSeguidores] = useState('')
  const [alcance, setAlcance] = useState('')
  const [curtidas, setCurtidas] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [salvamentos, setSalvamentos] = useState('')
  const [compartilhamentos, setCompartilhamentos] = useState('')
  const [showResults, setShowResults] = useState(false)

  const seg = parseInt(seguidores) || 0
  const alc = parseInt(alcance) || 0
  const cur = parseInt(curtidas) || 0
  const com = parseInt(comentarios) || 0
  const sal = parseInt(salvamentos) || 0
  const comp = parseInt(compartilhamentos) || 0

  const totalInteracoes = cur + com + sal + comp
  const txEngajamento = seg > 0 ? (totalInteracoes / seg) * 100 : 0
  const txEngajamentoAlcance = alc > 0 ? (totalInteracoes / alc) * 100 : 0
  const txAlcance = seg > 0 ? (alc / seg) * 100 : 0
  const txSalvamento = alc > 0 ? (sal / alc) * 100 : 0
  const txCompartilhamento = alc > 0 ? (comp / alc) * 100 : 0

  const bench = BENCHMARKS[formato]
  const classEng = classifyRate(txEngajamento, bench.engajamento)
  const classSal = classifyRate(txSalvamento, bench.salvamento)
  const classComp = classifyRate(txCompartilhamento, bench.compartilhamento)

  // Overall score (simple weighted average)
  const scoreMap: Record<string, number> = { 'Excelente': 4, 'Bom': 3, 'Médio': 2, 'Baixo': 1 }
  const overallScore = ((scoreMap[classEng.label] * 3) + (scoreMap[classSal.label] * 2) + (scoreMap[classComp.label] * 1)) / 6
  const overallClass = overallScore >= 3.5 ? classifyRate(100, [0, 0, 0]) : overallScore >= 2.5 ? classifyRate(3, [1, 2, 4]) : overallScore >= 1.5 ? classifyRate(1.5, [1, 2, 4]) : classifyRate(0, [1, 2, 4])

  const dicas = getDica(txEngajamento, txSalvamento, txCompartilhamento, txAlcance)

  const canCalculate = seg > 0 && alc > 0 && (cur > 0 || com > 0 || sal > 0 || comp > 0)

  // Auto-show results when enough data is entered
  const shouldShowResults = showResults && canCalculate

  const handleCalculate = () => {
    if (canCalculate) setShowResults(true)
  }

  const handleReset = () => {
    setSeguidores('')
    setAlcance('')
    setCurtidas('')
    setComentarios('')
    setSalvamentos('')
    setCompartilhamentos('')
    setShowResults(false)
  }

  const inputFields = [
    { label: 'Seguidores', value: seguidores, setter: setSeguidores, icon: 'group', placeholder: 'Ex: 2500' },
    { label: 'Alcance', value: alcance, setter: setAlcance, icon: 'visibility', placeholder: 'Ex: 1200' },
    { label: 'Curtidas', value: curtidas, setter: setCurtidas, icon: 'favorite', placeholder: 'Ex: 150' },
    { label: 'Comentários', value: comentarios, setter: setComentarios, icon: 'chat_bubble', placeholder: 'Ex: 25' },
    { label: 'Salvamentos', value: salvamentos, setter: setSalvamentos, icon: 'bookmark', placeholder: 'Ex: 40' },
    { label: 'Compartilhamentos', value: compartilhamentos, setter: setCompartilhamentos, icon: 'share', placeholder: 'Ex: 15' },
  ]

  const resultMetrics = [
    { label: 'Taxa de Engajamento', value: txEngajamento, desc: '(curtidas + comentários + salvamentos + compartilhamentos) ÷ seguidores', classification: classEng },
    { label: 'Engajamento / Alcance', value: txEngajamentoAlcance, desc: 'Total de interações ÷ alcance — quem viu, interagiu?', classification: classifyRate(txEngajamentoAlcance, bench.engajamento) },
    { label: 'Taxa de Alcance', value: txAlcance, desc: 'Alcance ÷ seguidores — o quanto o algoritmo te entrega', classification: txAlcance >= 100 ? classifyRate(100, [0, 0, 0]) : txAlcance >= 30 ? classifyRate(3, [1, 2, 4]) : txAlcance >= 10 ? classifyRate(1.5, [1, 2, 4]) : classifyRate(0, [1, 2, 4]) },
    { label: 'Taxa de Salvamento', value: txSalvamento, desc: 'Salvamentos ÷ alcance — conteúdo que gera valor', classification: classSal },
    { label: 'Taxa de Compartilhamento', value: txCompartilhamento, desc: 'Compartilhamentos ÷ alcance — potencial viral', classification: classComp },
  ]

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 flex items-center gap-3 uppercase italic">
          <span className="material-symbols-outlined text-[#0ea5e9] text-4xl not-italic">calculate</span>
          <span><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9]">CALCULADORA DE</span> MÉTRICAS</span>
        </h1>
        <p className="text-slate-800 dark:text-white/90 dark:text-white/90 text-base">
          Cole os números do seu post e descubra como está sua performance no Instagram.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Inputs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Format Selector */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-200 dark:border-white/10">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white/90 dark:text-white/90 uppercase tracking-widest mb-4">Formato do Post</h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(FORMATO_LABELS) as Formato[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFormato(f)}
                  className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.97] border ${
                    formato === f
                      ? 'bg-[#0ea5e9]/20 border-[#0ea5e9]/40 text-[#0ea5e9] shadow-[0_0_20px_rgba(14,165,233,0.15)]'
                      : 'bg-black/5 dark:bg-white/5 border-slate-300/10 dark:border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 dark:text-white/90 hover:bg-black/10 dark:bg-white/10 hover:border-slate-300/20 dark:border-white/20'
                  }`}
                >
                  {FORMATO_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Number Inputs */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-200 dark:border-white/10">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white/90 dark:text-white/90 uppercase tracking-widest mb-4">Dados do Post</h3>
            <div className="space-y-4">
              {inputFields.map(field => (
                <div key={field.label}>
                  <label className="text-xs font-bold text-slate-700 dark:text-white/90 uppercase tracking-widest mb-1.5 block ml-1">{field.label}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 dark:text-white/90 text-lg">{field.icon}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={field.value}
                      onChange={e => field.setter(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-black/5 dark:bg-white/5 border border-slate-300/10 dark:border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#0ea5e9] transition-all placeholder:text-slate-800 dark:text-white/90 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCalculate}
                disabled={!canCalculate}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#0ea5e9] to-sky-400 text-slate-900 dark:text-white font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
              >
                <span className="material-symbols-outlined text-lg">calculate</span>
                Calcular
              </button>
              {shouldShowResults && (
                <button
                  onClick={handleReset}
                  className="py-3.5 px-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-300/10 dark:border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 dark:text-white/90 font-bold text-sm hover:bg-black/10 dark:bg-white/10 transition-all active:scale-[0.97]"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right: Results */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {!shouldShowResults ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-3xl p-12 border border-slate-200 dark:border-slate-200 dark:border-white/10 flex flex-col items-center justify-center min-h-[400px] text-center"
              >
                <span className="material-symbols-outlined text-[80px] text-slate-700 mb-4">analytics</span>
                <h3 className="text-xl font-bold text-slate-700 dark:text-white/90 mb-2">Preencha os dados do post</h3>
                <p className="text-sm text-slate-800 dark:text-white/90 max-w-sm">
                  Digite os números que aparecem nos Insights do seu post e clique em Calcular para ver sua performance.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Overall Score */}
                <div className={`glass-card rounded-3xl p-8 border ${overallClass.border} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <span className="material-symbols-outlined text-[80px] text-[#0ea5e9]">insights</span>
                  </div>
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Resultado Geral</h3>
                      <p className="text-sm text-slate-800 dark:text-white/90 dark:text-white/90">
                        {FORMATO_LABELS[formato]} • {seg.toLocaleString('pt-BR')} seguidores • {alc.toLocaleString('pt-BR')} alcance
                      </p>
                    </div>
                    <div className={`text-right ${overallClass.bg} ${overallClass.border} border rounded-2xl px-6 py-3`}>
                      <span className={`text-3xl font-black ${overallClass.color}`}>{txEngajamento.toFixed(1)}%</span>
                      <p className={`text-xs font-bold uppercase tracking-widest ${overallClass.color} mt-0.5`}>
                        {overallClass.emoji} {overallClass.label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Individual Metrics */}
                <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-200 dark:border-white/10">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white/90 dark:text-white/90 uppercase tracking-widest mb-5">Métricas Detalhadas</h3>
                  <div className="space-y-4">
                    {resultMetrics.map((metric, i) => (
                      <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className={`p-4 rounded-2xl ${metric.classification.bg} border ${metric.classification.border} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{metric.label}</p>
                          <p className="text-xs text-slate-700 dark:text-white/90 mt-0.5">{metric.desc}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-2xl font-black ${metric.classification.color}`}>{metric.value.toFixed(1)}%</span>
                          <span className={`text-xs font-bold uppercase tracking-widest ${metric.classification.color} ${metric.classification.bg} border ${metric.classification.border} px-3 py-1 rounded-full`}>
                            {metric.classification.label}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-br from-[#0ea5e9]/15 to-indigo-900/10 rounded-3xl p-6 border border-[#0ea5e9]/20">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9]">lightbulb</span>
                    Dicas para melhorar
                  </h3>
                  <ul className="space-y-3">
                    {dicas.map((dica, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="text-sm text-slate-800 dark:text-slate-300 leading-relaxed"
                      >
                        {dica}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Reference Table */}
                <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-200 dark:border-white/10">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white/90 dark:text-white/90 uppercase tracking-widest mb-4">
                    Referência para {FORMATO_LABELS[formato]}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-300/10 dark:border-slate-200 dark:border-white/10">
                          <th className="text-left py-2 text-slate-700 dark:text-white/90 font-bold">Métrica</th>
                          <th className="text-center py-2 text-red-400 font-bold">🔴 Baixo</th>
                          <th className="text-center py-2 text-amber-400 font-bold">🟡 Médio</th>
                          <th className="text-center py-2 text-sky-400 font-bold">🔵 Bom</th>
                          <th className="text-center py-2 text-emerald-400 font-bold">🟢 Excelente</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200 dark:border-slate-200 dark:border-white/10">
                          <td className="py-2.5 text-slate-800 dark:text-slate-300">Engajamento</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">&lt;{bench.engajamento[0]}%</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">{bench.engajamento[0]}-{bench.engajamento[1]}%</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">{bench.engajamento[1]}-{bench.engajamento[2]}%</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">&gt;{bench.engajamento[2]}%</td>
                        </tr>
                        <tr className="border-b border-slate-200 dark:border-slate-200 dark:border-white/10">
                          <td className="py-2.5 text-slate-800 dark:text-slate-300">Salvamento</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">&lt;{bench.salvamento[0]}%</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">{bench.salvamento[0]}-{bench.salvamento[1]}%</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">{bench.salvamento[1]}-{bench.salvamento[2]}%</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">&gt;{bench.salvamento[2]}%</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 text-slate-800 dark:text-slate-300">Compartilhamento</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">&lt;{bench.compartilhamento[0]}%</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">{bench.compartilhamento[0]}-{bench.compartilhamento[1]}%</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">{bench.compartilhamento[1]}-{bench.compartilhamento[2]}%</td>
                          <td className="py-2.5 text-center text-slate-800 dark:text-white/90 dark:text-white/90">&gt;{bench.compartilhamento[2]}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
