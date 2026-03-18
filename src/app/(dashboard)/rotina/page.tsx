'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'

interface RotinaItem {
  id: string
  label: string
  noeixo: string
  tempo: string
}

const ROTINA_SEMANAL: { dia: string; emoji: string; items: RotinaItem[] }[] = [
  {
    dia: 'Segunda-feira',
    emoji: '🎯',
    items: [
      { id: 'seg-1', label: 'Rever dados do perfil no Dashboard', noeixo: 'N', tempo: '10 min' },
      { id: 'seg-2', label: 'Gerar Prompt 1 (Clareza) ou revisitar posicionamento', noeixo: 'N', tempo: '15 min' },
      { id: 'seg-3', label: 'Planejar conteúdo da semana com Prompt 3 (Ideias)', noeixo: 'E', tempo: '20 min' },
    ],
  },
  {
    dia: 'Terça-feira',
    emoji: '👥',
    items: [
      { id: 'ter-1', label: 'Revisar Persona (Prompt 2) e atualizar se necessário', noeixo: 'O', tempo: '15 min' },
      { id: 'ter-2', label: 'Criar conteúdo de ALCANCE usando ideia da semana', noeixo: 'I', tempo: '30 min' },
      { id: 'ter-3', label: 'Interagir com 10 perfis do nicho', noeixo: 'O', tempo: '15 min' },
    ],
  },
  {
    dia: 'Quarta-feira',
    emoji: '📝',
    items: [
      { id: 'qua-1', label: 'Gerar Roteiro (Prompt 4) para conteúdo principal', noeixo: 'X', tempo: '15 min' },
      { id: 'qua-2', label: 'Gravar/criar conteúdo usando o roteiro', noeixo: 'X', tempo: '30 min' },
      { id: 'qua-3', label: 'Usar 2 ganchos virais da biblioteca', noeixo: 'E', tempo: '10 min' },
    ],
  },
  {
    dia: 'Quinta-feira',
    emoji: '💬',
    items: [
      { id: 'qui-1', label: 'Criar sequência de Stories usando frameworks', noeixo: 'O', tempo: '20 min' },
      { id: 'qui-2', label: 'Conteúdo de CONEXÃO (história, bastidores)', noeixo: 'I', tempo: '20 min' },
      { id: 'qui-3', label: 'Responder todos os comentários e DMs', noeixo: 'O', tempo: '15 min' },
    ],
  },
  {
    dia: 'Sexta-feira',
    emoji: '💰',
    items: [
      { id: 'sex-1', label: 'Conteúdo de VENDA sutil (preparação)', noeixo: 'I', tempo: '25 min' },
      { id: 'sex-2', label: 'Revisar estratégia de vendas (Prompt 5 se aplicável)', noeixo: 'X', tempo: '15 min' },
      { id: 'sex-3', label: 'Analisar métricas da semana', noeixo: 'O', tempo: '10 min' },
    ],
  },
  {
    dia: 'Sábado',
    emoji: '🎬',
    items: [
      { id: 'sab-1', label: 'Gravar batch de conteúdo para próxima semana', noeixo: 'X', tempo: '45 min' },
      { id: 'sab-2', label: 'Explorar tendências e adaptar ao nicho', noeixo: 'E', tempo: '15 min' },
    ],
  },
  {
    dia: 'Domingo',
    emoji: '🧠',
    items: [
      { id: 'dom-1', label: 'Revisar conquistas da semana na Jornada', noeixo: 'N', tempo: '10 min' },
      { id: 'dom-2', label: 'Planejar temas da próxima semana', noeixo: 'E', tempo: '15 min' },
      { id: 'dom-3', label: 'Descansar e consumir conteúdo de referência', noeixo: '-', tempo: 'Livre' },
    ],
  },
]

export default function RotinaPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const totalItems = ROTINA_SEMANAL.reduce((acc, d) => acc + d.items.length, 0)
  const completedItems = Object.values(checked).filter(Boolean).length
  const progresso = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const resetAll = () => setChecked({})

  return (
    <>
      <main className="flex-1 flex flex-col items-center w-full relative z-10 overflow-y-auto custom-scrollbar">
        {/* Header content similar to Stitch, but within our layout container */}
        <div className="w-full max-w-7xl px-6 lg:px-8 py-8 md:py-12 space-y-8">
          
          <div className="mb-2">
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white flex flex-col sm:flex-row sm:items-center gap-2 mb-2 uppercase italic leading-none">
              ROTINA SEMANAL <span className="text-[#0ea5e9]">NOEIXO</span>
            </h1>
            <p className="text-slate-400 text-lg">Gerencie seu progresso e mantenha o foco na estratégia de conteúdo.</p>
          </div>

          {/* Weekly Progress Card */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 lg:p-10 rounded-3xl w-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined text-[120px] text-[#0ea5e9]">task_alt</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8 relative z-10">
              <div>
                <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Status Geral</span>
                <h2 className="text-5xl font-black text-white mt-2 tracking-tight">
                  {progresso}% <span className="text-2xl font-medium text-slate-500 tracking-normal">Concluído</span>
                </h2>
                <p className="text-sm text-[#0ea5e9] mt-2 font-bold tracking-wide uppercase">
                  {completedItems} de {totalItems} tarefas finalizadas
                </p>
              </div>
              
              <button 
                onClick={resetAll}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 transition-all text-sm font-bold border border-white/10 shrink-0 shadow-lg"
              >
                <span className="material-symbols-outlined text-lg">restart_alt</span>
                Resetar Semana
              </button>
            </div>
            
            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative z-10">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-[#0ea5e9] shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
                style={{ width: `${Math.max(progresso, 2)}%` }} 
              />
            </div>
          </motion.section>

          {/* Daily Tasks Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-12">
            {ROTINA_SEMANAL.map((dia, i) => (
              <motion.div 
                key={dia.dia} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`glass-card p-6 lg:p-8 rounded-3xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group/card ${dia.dia === 'Domingo' || dia.dia === 'Sábado' ? 'bg-[#0ea5e9]/[0.02] border-[#0ea5e9]/20' : ''}`}
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/card:opacity-[0.08] transition-opacity pointer-events-none">
                  <span className="text-6xl">{dia.emoji}</span>
                </div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{dia.emoji}</span>
                    <h3 className="text-xl font-bold text-white tracking-tight">{dia.dia}</h3>
                  </div>
                  {dia.dia === 'Domingo' || dia.dia === 'Sábado' ? (
                     <span className="px-3 py-1 bg-[#0ea5e9]/20 border border-[#0ea5e9]/30 rounded-full text-[10px] font-black tracking-widest text-[#0ea5e9] uppercase shadow-lg shadow-[#0ea5e9]/20">
                      DESCANSO
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-black tracking-widest text-slate-300 uppercase">
                      NOEIXO
                    </span>
                  )}
                </div>

                <div className="space-y-4 relative z-10">
                  {dia.items.map(item => {
                    const isChecked = checked[item.id] || false;
                    return (
                      <label key={item.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5">
                        <div className="mt-0.5 shrink-0 relative">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(v) => setChecked(prev => ({ ...prev, [item.id]: v === true }))}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shadow-inner ${isChecked ? 'bg-[#0ea5e9]/20 border-[#0ea5e9]/50' : 'border-[#0ea5e9]/40 group-hover:border-[#0ea5e9]'}`}>
                            <span className={`material-symbols-outlined text-[16px] text-[#0ea5e9] transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`}>
                              check
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <span className={`block text-sm leading-relaxed transition-all font-medium ${isChecked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {item.label}
                          </span>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                             {item.noeixo !== '-' && (
                               <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase border ${isChecked ? 'bg-white/5 text-slate-500 border-white/5' : 'bg-white/10 text-slate-300 border-white/10'}`}>
                                 Pilar: {item.noeixo}
                               </span>
                             )}
                            <span className={`text-[11px] font-medium flex items-center gap-1 ${isChecked ? 'text-slate-600' : 'text-slate-400'}`}>
                              <span className="material-symbols-outlined text-[14px]">timer</span>
                              {item.tempo}
                            </span>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
    </>
  )
}
