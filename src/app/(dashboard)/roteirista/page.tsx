'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// UI Components
import { CreditBar } from '@/components/roteirista/CreditBar'
import { FormatPicker, FormatoMinimal } from '@/components/roteirista/FormatPicker'
import { ModeSelector, RoteiroMode } from '@/components/roteirista/ModeSelector'
import { VoiceSelector } from '@/components/roteirista/VoiceSelector'

interface Agent {
  id: string
  name: string
  description: string
}

export default function RoteiristaPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  
  const [mode, setMode] = useState<RoteiroMode>('fast')
  const [voiceProfileId, setVoiceProfileId] = useState<string | null>(null)
  const [formatData, setFormatData] = useState<FormatoMinimal | null>(null)
  const [topic, setTopic] = useState('')

  useEffect(() => {
    async function loadAgents() {
      const supabase = createClient()
      const { data } = await supabase.from('agents').select('id, name, description').eq('status', 'ativo')
      if (data && data.length > 0) {
        setAgents(data)
        setSelectedAgentId(data[0].id)
      }
    }
    loadAgents()
  }, [])

  const [streamData, setStreamData] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) return alert('Descreva o que deseja criar.')
    if (!selectedAgentId) return alert('Selecione um Agente Especialista.')

    setIsGenerating(true)
    setStreamData('')
    
    try {
      const res = await fetch('/api/roteirista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          mode,
          agentId: selectedAgentId,
          voiceProfileId,
          formatData
        })
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      if (!res.body) throw new Error('No body returned')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let currentText = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        
        const lines = chunkValue.split('\n')
        for (const line of lines) {
           if (line.startsWith('0:')) {
             try {
               currentText += JSON.parse(line.slice(2))
             } catch {}
           }
        }
        setStreamData(currentText)
      }
      
      // Auto-save RAG Memory (Optional background call)
      await fetch('/api/memorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentText, type: 'roteiro' })
      }).catch(e => console.error('Erro ao salvar memoria:', e))

    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  return (
    <main className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden relative z-10">
      
      {/* LEFT PANEL - CONFIGURATION */}
      <div className="w-full md:w-[450px] lg:w-[500px] bg-slate-50 dark:bg-[#060a12] border-r border-slate-200 dark:border-white/10 flex flex-col h-full shrink-0 overflow-y-auto custom-scrollbar pt-4 pb-20">
        
        <div className="px-6 pb-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between sticky top-0 bg-slate-50/90 dark:bg-[#060a12]/90 backdrop-blur-md z-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0ea5e9]">robot_2</span> Roteirista
            </h1>
            <p className="text-xs text-slate-500 dark:text-white/60">Agentes Especialistas e IA Premium</p>
          </div>
          <CreditBar />
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* TOPIC */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-widest pl-1">
               Comando Principal (O que vamos criar?) *
             </label>
             <textarea 
               value={topic}
               onChange={e => setTopic(e.target.value)}
               rows={4} 
               placeholder="Ex: Um carrossel sobre os 5 mitos da nutrição esportiva focada em hipertrofia."
               className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#0ea5e9] resize-none dark:text-white placeholder:text-slate-400 font-medium"
             />
          </div>

          {/* AGENT SELECTOR */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-widest pl-1">
               Especialista (Agente)
             </label>
             {agents.length === 0 ? (
               <div className="h-10 animate-pulse bg-slate-200 dark:bg-white/5 rounded-xl w-full"></div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 {agents.map(a => (
                   <button 
                     key={a.id}
                     onClick={() => setSelectedAgentId(a.id)}
                     className={`text-left p-3 rounded-xl border transition-all ${
                       selectedAgentId === a.id 
                         ? 'border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9]' 
                         : 'border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white/80'
                     }`}
                   >
                     <div className="text-sm font-bold truncate">{a.name}</div>
                   </button>
                 ))}
               </div>
             )}
             {selectedAgent && (
               <p className="text-[10px] text-slate-500 mt-1 pl-1 line-clamp-2">
                 ⚡ {selectedAgent.description}
               </p>
             )}
          </div>

          {/* MODE SELECTOR */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-widest pl-1 flex items-center gap-1.5">
               Motor Cognitivo
             </label>
             <ModeSelector selected={mode} onSelect={setMode} disabled={isGenerating} />
          </div>

          {/* VOICE PROFILE */}
          <VoiceSelector selectedId={voiceProfileId} onSelect={setVoiceProfileId} disabled={isGenerating} />

          {/* FORMAT PICKER */}
          <FormatPicker selectedId={formatData?.id || null} onSelect={setFormatData} disabled={isGenerating} />
          
        </div>

        <div className="p-6 sticky bottom-0 bg-slate-50 dark:bg-[#060a12] border-t border-slate-200 dark:border-white/10">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className="w-full shimmer-btn py-4 rounded-xl text-white font-black tracking-wide shadow-xl shadow-[#0ea5e9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <><span className="material-symbols-outlined animate-spin">refresh</span> Gerando Conteúdo...</>
            ) : (
              <><span className="material-symbols-outlined">magic_button</span> Iniciar Escritório de IA</>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - OUTPUT */}
      <div className="flex-1 bg-white dark:bg-[#0A0F1A] flex flex-col h-full relative overflow-hidden xl:rounded-l-3xl shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-slate-200 dark:border-white/5">
        
        {/* Placeholder / Empty State */}
        {!streamData && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-none bg-repeat opacity-80 pointer-events-none">
            <div className="size-24 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 shadow-xl border border-slate-200 dark:border-white/10">
               <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-white/20">auto_awesome</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Editor Inteligente Vazio</h2>
            <p className="text-slate-500 dark:text-white/50 max-w-sm">
              Configure os parâmetros ao lado e inicie o Escritório de IA para ver a mágica tomar forma em tempo real.
            </p>
          </div>
        )}

        {/* Markdown Output */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 lg:p-16 w-full max-w-4xl mx-auto z-10">
           <div className="prose prose-slate dark:prose-invert prose-headings:font-black prose-a:text-[#0ea5e9] prose-p:leading-relaxed max-w-none">
             {streamData && (
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {streamData}
               </ReactMarkdown>
             )}
           </div>
        </div>

      </div>
    </main>
  )
}
