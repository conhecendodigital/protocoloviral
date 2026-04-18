'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronLeft, ChevronRight, Clock3, Loader2, Mic, Mic2, Plus, Save, Star, Trash2 } from 'lucide-react'
import { useVoiceProfiles } from '@/hooks/use-voice-profiles'
import { StepRelacao } from '@/components/tom-de-voz/StepRelacao'
import { StepEnergia } from '@/components/tom-de-voz/StepEnergia'
import { StepRegistro } from '@/components/tom-de-voz/StepRegistro'
import { StepHumor } from '@/components/tom-de-voz/StepHumor'
import { StepDetalhes } from '@/components/tom-de-voz/StepDetalhes'
import { VoicePreview } from '@/components/tom-de-voz/VoicePreview'

interface Bordao {
  texto: string
  posicao: 'inicio' | 'meio' | 'final'
}

const STEP_NAMES = ['Relação', 'Energia', 'Registro', 'Humor', 'Detalhes']

export default function TomDeVozPage() {
  const { profiles, loading, saving, createProfile, deleteProfile, setDefault } = useVoiceProfiles()
  
  // Wizard State
  const [showWizard, setShowWizard] = useState(false)
  const [step, setStep] = useState(1)
  const [profileName, setProfileName] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Wizard Data
  const [relacao, setRelacao] = useState<string>('')
  const [energia, setEnergia] = useState<string>('')
  const [ritmo, setRitmo] = useState<string>('')
  const [registro, setRegistro] = useState<string>('')
  const [humor, setHumor] = useState(2)
  const [bordoes, setBordoes] = useState<Bordao[]>([])
  const [palavrasPreferidas, setPalavrasPreferidas] = useState<string[]>([])
  const [palavrasEvitadas, setPalavrasEvitadas] = useState<string[]>([])
  const [instrucoesAdicionais, setInstrucoesAdicionais] = useState('')

  const resetWizard = () => {
    setStep(1)
    setProfileName('')
    setRelacao('')
    setEnergia('')
    setRitmo('')
    setRegistro('')
    setHumor(2)
    setBordoes([])
    setPalavrasPreferidas([])
    setPalavrasEvitadas([])
    setInstrucoesAdicionais('')
    setSaveSuccess(false)
  }

  const startWizard = () => {
    resetWizard()
    setShowWizard(true)
  }

  const canAdvance = () => {
    switch (step) {
      case 1: return !!relacao
      case 2: return !!energia && !!ritmo
      case 3: return !!registro
      case 4: return true // humor tem default
      case 5: return true
      default: return false
    }
  }

  const handleSave = async () => {
    const name = profileName.trim() || `Tom de Voz ${profiles.length + 1}`
    const wizardInputs = {
      relacao,
      energia,
      ritmo,
      registro,
      humor,
      bordoes,
      palavras_preferidas: palavrasPreferidas,
      palavras_evitadas: palavrasEvitadas,
      instrucoes_adicionais: instrucoesAdicionais,
    }

    const result = await createProfile(name, wizardInputs)
    if (result) {
      setSaveSuccess(true)
      setTimeout(() => {
        setShowWizard(false)
        resetWizard()
      }, 2000)
    }
  }

  const handleDeleteProfile = async (id: string) => {
    if (confirm('Tem certeza que quer excluir este tom de voz?')) {
      await deleteProfile(id)
    }
  }

  const progressPercent = (step / 5) * 100

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center relative z-10">
        <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
      <div className="p-4 sm:p-6 lg:mx-auto max-w-6xl w-full space-y-8 pb-32">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
          <div className="flex items-center gap-4 mb-1">
            <div className="size-14 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Mic2 size={30} className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Tom de Voz
              </h1>
              <p className="text-sm text-slate-600 dark:text-white/60">
                Configure sua personalidade para geração de roteiros
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {showWizard ? (
            /* ═══════════ WIZARD ═══════════ */
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-white/60">
                    Etapa {step} de 5: {STEP_NAMES[step - 1]}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#0ea5e9] to-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Wizard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left: Step Content */}
                <div className="lg:col-span-7">
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {step === 1 && (
                          <StepRelacao value={relacao} onChange={setRelacao} />
                        )}
                        {step === 2 && (
                          <StepEnergia
                            energia={energia}
                            ritmo={ritmo}
                            onEnergiaChange={setEnergia}
                            onRitmoChange={setRitmo}
                          />
                        )}
                        {step === 3 && (
                          <StepRegistro value={registro} onChange={setRegistro} />
                        )}
                        {step === 4 && (
                          <StepHumor
                            humor={humor}
                            bordoes={bordoes}
                            onHumorChange={setHumor}
                            onBordoesChange={setBordoes}
                          />
                        )}
                        {step === 5 && (
                          <>
                            {/* Nome do perfil */}
                            <div className="mb-6">
                              <label className="text-sm font-bold text-slate-900 dark:text-white block mb-2">
                                Nome do perfil
                              </label>
                              <input
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                placeholder="Ex: Meu Tom Principal"
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9] transition-colors"
                              />
                            </div>
                            <StepDetalhes
                              palavrasPreferidas={palavrasPreferidas}
                              palavrasEvitadas={palavrasEvitadas}
                              instrucoesAdicionais={instrucoesAdicionais}
                              onPreferidasChange={setPalavrasPreferidas}
                              onEvitadasChange={setPalavrasEvitadas}
                              onInstrucoesChange={setInstrucoesAdicionais}
                            />
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={() => step === 1 ? setShowWizard(false) : setStep(s => s - 1)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <ChevronLeft size={18} className="text-lg" />
                      Voltar
                    </button>

                    {step < 5 ? (
                      <button
                        onClick={() => setStep(s => s + 1)}
                        disabled={!canAdvance()}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#0ea5e9] text-white font-bold text-sm hover:bg-[#0ea5e9]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#0ea5e9]/20"
                      >
                        Próximo
                        <ChevronRight size={18} className="text-lg" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSave}
                        disabled={saving || saveSuccess}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold text-sm hover:brightness-110 transition-all disabled:opacity-60 shadow-lg shadow-violet-500/20"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Salvando...
                          </>
                        ) : saveSuccess ? (
                          <>
                            <CheckCircle size={18} className="text-lg" />
                            Salvo!
                          </>
                        ) : (
                          <>
                            <Save size={18} className="text-lg" />
                            Salvar Tom de Voz
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Preview */}
                <div className="lg:col-span-5">
                  <VoicePreview
                    relacao={relacao}
                    energia={energia}
                    registro={registro}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            /* ═══════════ PROFILE LIST ═══════════ */
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Create New Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={startWizard}
                className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9] bg-white/50 dark:bg-white/[0.02] hover:bg-[#0ea5e9]/5 transition-all group flex items-center justify-center gap-3"
              >
                <div className="size-12 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center group-hover:bg-[#0ea5e9]/20 transition-colors">
                  <Plus size={24} className="text-[#0ea5e9] text-2xl" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 dark:text-white">Criar Novo Tom de Voz</p>
                  <p className="text-xs text-slate-500 dark:text-white/50">Configure em 5 etapas simples</p>
                </div>
              </motion.button>

              {/* Existing Profiles */}
              {profiles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 sm:p-12 text-center"
                >
                  <div className="size-20 mx-auto mb-6 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                    <Mic size={36} className="text-violet-400 text-4xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Nenhum tom de voz configurado
                  </h2>
                  <p className="text-slate-600 dark:text-white/60 max-w-md mx-auto leading-relaxed">
                    Crie seu primeiro perfil de voz para que a IA escreva roteiros com o seu estilo único.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profiles.map((profile, i) => {
                    const wi = profile.wizard_inputs || {}
                    return (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative group hover:border-[#0ea5e9]/30 transition-colors"
                      >
                        {profile.is_default && (
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] text-[10px] font-bold uppercase tracking-wider border border-[#0ea5e9]/20">
                              <Star size={18} className="text-xs" />
                              Padrão
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                          <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center border border-violet-500/20">
                            <Mic2 size={18} className="text-violet-400 text-lg" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{profile.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-white/40">
                              {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {wi.relacao && (
                            <span className="px-2.5 py-1 bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-violet-200 dark:border-violet-500/20">
                              {wi.relacao}
                            </span>
                          )}
                          {wi.energia && (
                            <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-500/20">
                              {wi.energia}
                            </span>
                          )}
                          {wi.registro && (
                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
                              {wi.registro}
                            </span>
                          )}
                        </div>

                        {/* Enrichment Status */}
                        <div className="flex items-center gap-1.5 mb-4">
                          {profile.enriched_profile?.schema_version ? (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                              <CheckCircle size={14} className="text-sm" />
                              Perfil enriquecido pela IA
                            </span>
                          ) : (
                            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                              <Clock3 size={14} className="text-sm" />
                              Aguardando enriquecimento
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!profile.is_default && (
                            <button
                              onClick={() => setDefault(profile.id)}
                              className="flex-1 py-2 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-bold hover:bg-[#0ea5e9]/20 transition-colors"
                            >
                              Definir padrão
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="py-2 px-4 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={14} className="text-sm" />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  )
}
