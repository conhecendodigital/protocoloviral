'use client'

import { useState } from 'react'

import { useProfile } from '@/hooks/use-profile'
import { useAutoSave } from '@/hooks/use-auto-save'
import { PROFILE_FIELDS } from '@/types/profile'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, User, Users, Rocket } from 'lucide-react'

const SECTION_META = {
  sobre: { icon: 'person', title: 'Sobre Você', desc: 'Seu nicho, experiência e diferencial' },
  publico: { icon: 'groups', title: 'Seu Público', desc: 'Quem você quer alcançar e ajudar' },
  objetivos: { icon: 'rocket_launch', title: 'Seus Objetivos', desc: 'O que você quer construir' },
}

export default function PerfilPage() {
  const { profile, loading, userId, updateField, getCompletionPercent } = useProfile()
  const { debouncedSave } = useAutoSave(userId)
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({})

  const completion = getCompletionPercent()

  const handleFieldChange = (fieldId: string, value: string) => {
    updateField(fieldId, value)
    debouncedSave(fieldId, value, (status) => {
      setSaveStatus(prev => ({ ...prev, [fieldId]: status === 'saving' ? 'saving' : status === 'saved' ? 'saved' : 'error' }))
      if (status === 'saved') {
        setTimeout(() => setSaveStatus(prev => ({ ...prev, [fieldId]: 'idle' })), 2000)
      }
    })
  }

  // Helper to extract name from email or use default
  const getFirstName = () => {
    if (!profile?.email) return 'Usuário Mapeador'
    return profile.email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase())
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96 relative z-10 w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
        </div>
      </>
    )
  }

  const sections = ['sobre', 'publico', 'objetivos'] as const

  return (
    <>
      <main className="flex-1 flex flex-col items-center w-full relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-7xl px-6 lg:px-8 py-8 md:py-12 pb-24">
          
          {/* Profile Banner Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-24">
            <div className="h-48 md:h-64 w-full rounded-3xl overflow-hidden glass-card border border-white/10 relative">
               {/* Abstract Grid Background */}
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
               <div className="w-full h-full bg-gradient-to-br from-[#0ea5e9]/20 via-black/40 to-indigo-900/30"></div>
            </div>
            
            <div className="absolute -bottom-16 left-6 md:left-12 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left w-full md:w-auto">
              <div className="size-32 rounded-full border-4 border-black p-1 glass-card shadow-[0_0_30px_rgba(14,165,233,0.3)] bg-black/50 z-10 relative">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0ea5e9] to-indigo-500 overflow-hidden flex items-center justify-center">
                   <span className="material-symbols-outlined text-[64px] text-white">sentiment_satisfied</span>
                </div>
              </div>
              <div className="mb-2 md:mb-4">
                <h2 className="text-3xl font-black text-white tracking-tight">{getFirstName()}</h2>
                <p className="text-[#0ea5e9] font-medium tracking-wide text-sm">{profile?.email}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side: Form Fields */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Progress Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-[80px] text-[#0ea5e9]">verified</span>
                 </div>
                 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Completude do Perfil</h3>
                      <p className="text-sm text-slate-400 max-w-sm">
                        {completion < 50 ? 'O algoritmo do mapa precisa de mais informações para gerar conteúdos precisos. Continue preenchendo.' :
                         completion < 100 ? 'Quase lá! Faltam apenas alguns detalhes para destrancar seu potencial máximo de prompts.' :
                         'Excelente! Seu perfil está 100% completo, a Inteligência Artificial tem todo contexto necessário.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                       <div className="text-right">
                          <span className="block text-3xl font-black text-white">{completion}%</span>
                          <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest">Concluído</span>
                       </div>
                    </div>
                 </div>
                 <div className="w-full h-2 bg-white/5 rounded-full mt-6 overflow-hidden relative z-10">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-400 to-[#0ea5e9] shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${completion}%` }}
                    />
                 </div>
              </motion.div>

              {/* Form Sections */}
              {sections.map((sectionKey, si) => {
                const meta = SECTION_META[sectionKey]
                const fields = PROFILE_FIELDS.filter(f => f.section === sectionKey)

                return (
                  <motion.div 
                    key={sectionKey} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 + (si * 0.1) }} 
                    className="glass-card rounded-3xl p-8 border border-white/5"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="size-12 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center border border-[#0ea5e9]/20 shadow-inner">
                        <span className="material-symbols-outlined text-[#0ea5e9] text-2xl">{meta.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white tracking-tight">{meta.title}</h3>
                        <p className="text-sm text-slate-400">{meta.desc}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {fields.map(field => {
                        const fieldValue = profile?.[field.id] as string || ''
                        const status = saveStatus[field.id] || 'idle'
                        const isTextarea = field.type === 'textarea'

                        return (
                          <div key={field.id} className={`space-y-2 ${isTextarea ? 'md:col-span-2' : ''}`}>
                            <div className="flex items-center justify-between">
                              <label htmlFor={field.id} className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                {field.label}
                              </label>
                              <div className="h-4 flex items-center">
                                {status === 'saving' && <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-widest font-bold"><Loader2 className="w-3 h-3 animate-spin" />Salvando</span>}
                                {status === 'saved' && <span className="text-[10px] text-[#0ea5e9] flex items-center gap-1 uppercase tracking-widest font-bold"><CheckCircle2 className="w-3 h-3" />Salvo</span>}
                                {status === 'error' && <span className="text-[10px] text-red-400 flex items-center gap-1 uppercase tracking-widest font-bold">Erro ao salvar</span>}
                              </div>
                            </div>
                            
                            <div className="group relative">
                              <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none border border-[#0ea5e9]/50"></div>
                              {isTextarea ? (
                                <Textarea
                                  id={field.id}
                                  placeholder={field.placeholder}
                                  value={fieldValue}
                                  onChange={e => handleFieldChange(field.id, e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus-visible:ring-0 focus-visible:border-[#0ea5e9] outline-none transition-all resize-none text-white text-sm leading-relaxed min-h-[100px] relative z-10 placeholder:text-slate-600"
                                  rows={4}
                                />
                              ) : (
                                <Input
                                  id={field.id}
                                  placeholder={field.placeholder}
                                  value={fieldValue}
                                  onChange={e => handleFieldChange(field.id, e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-6 h-auto focus-visible:ring-0 focus-visible:border-[#0ea5e9] outline-none transition-all text-white text-sm relative z-10 placeholder:text-slate-600"
                                />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Right Side: Extras */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Help/Tips Card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-[#0ea5e9]/20 to-indigo-900/10 rounded-3xl p-8 border border-[#0ea5e9]/20 relative overflow-hidden group">
                 <div className="relative z-10">
                    <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                       <span className="material-symbols-outlined text-[#0ea5e9]">lightbulb</span>
                       Como preencher?
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                       A Inteligência Artificial usa estas informações como contexto base (System Prompt).
                       Escreva da forma mais natural possível, como se estivesse explicando seu negócio para um amigo.
                    </p>
                    <ul className="space-y-3 text-sm text-slate-400">
                       <li className="flex gap-2 items-start"><span className="text-[#0ea5e9] mt-0.5">•</span> Seja específico na dor do seu público.</li>
                       <li className="flex gap-2 items-start"><span className="text-[#0ea5e9] mt-0.5">•</span> Evite jargões muito técnicos, a menos que seu público entenda.</li>
                       <li className="flex gap-2 items-start"><span className="text-[#0ea5e9] mt-0.5">•</span> Você pode alterar estes dados a qualquer momento e os roteiros mudarão automaticamente!</li>
                    </ul>
                 </div>
              </motion.div>

              {/* Status Indicator */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-3xl p-8 border border-white/5">
                 <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500">settings</span>
                    Status do Sistema
                 </h4>
                 
                 <div className="space-y-4">
                    <div>
                       <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                          <span>Sincronização em Nuvem</span>
                          <span className="text-[#0ea5e9]">Ativo</span>
                       </div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                       </div>
                    </div>
                    <p className="text-xs text-slate-500">
                       Seus dados são salvos automaticamente no banco de dados enquanto você digita.
                    </p>
                 </div>
              </motion.div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}
