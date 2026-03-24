'use client'

import { use, useState } from 'react'

import { useProfile } from '@/hooks/use-profile'
import { PROMPT_CONFIGS, type PromptType } from '@/types/prompt'
import { generateClarezaPrompt } from '@/lib/prompts/clareza'
import { generatePersonaPrompt } from '@/lib/prompts/persona'
import { generateIdeiasPrompt } from '@/lib/prompts/ideias'
import { generateRoteiroPrompt } from '@/lib/prompts/roteiro'
import { generateVendasPrompt } from '@/lib/prompts/vendas'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

const generators: Record<PromptType, (p: Parameters<typeof generateClarezaPrompt>[0]) => string> = {
  clareza: generateClarezaPrompt,
  persona: generatePersonaPrompt,
  ideias: generateIdeiasPrompt,
  roteiro: generateRoteiroPrompt,
  vendas: generateVendasPrompt,
}

const NEXT_PROMPT: Record<PromptType, PromptType | null> = {
  clareza: 'persona',
  persona: 'ideias',
  ideias: 'roteiro',
  roteiro: 'vendas',
  vendas: null,
}

export default function PromptPage({ params }: { params: Promise<{ tipo: string }> }) {
  const resolvedParams = use(params)
  const tipo = resolvedParams.tipo as PromptType
  const config = PROMPT_CONFIGS[tipo]
  const { profile, loading, updateField } = useProfile()
  const [prompt, setPrompt] = useState('')
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!config) {
    return (
      <>
        <div className="p-8 text-center mt-20">
          <p className="text-slate-400 text-lg">Este tipo de prompt não existe.</p>
          <Link href="/" className="text-[#0ea5e9] text-sm mt-4 font-bold hover:underline inline-block">Voltar ao início</Link>
        </div>
      </>
    )
  }

  const checkDependencies = () => {
    for (const dep of config.dependencias) {
      const depConfig = PROMPT_CONFIGS[dep]
      const responseField = `resposta${depConfig.numero}` as keyof typeof profile
      if (!profile?.[responseField]) {
        return { met: false, missing: dep }
      }
    }
    return { met: true, missing: null }
  }

  const handleGenerate = () => {
    if (!profile) return
    const deps = checkDependencies()
    if (!deps.met) return

    const generator = generators[tipo]
    const result = generator(profile)
    setPrompt(result)
    setGenerated(true)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      // Fallback for non-HTTPS environments
      const textarea = document.createElement('textarea')
      textarea.value = prompt
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined animate-spin text-[#0ea5e9] text-4xl">autorenew</span>
      </div>
    )
  }

  const deps = checkDependencies()

  return (
    <>
      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Column: Form */}
        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl">{config.icone}</span>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Passo {config.numero}: {config.titulo}
              </h1>
            </div>
            <p className="text-slate-400">{config.descricao}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 lg:p-8 rounded-xl flex flex-col gap-6 shadow-2xl shadow-[#0ea5e9]/10 border border-white/5">
            
            {/* Dependencies Warning */}
            {!deps.met && deps.missing && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 shrink-0">warning</span>
                  <div>
                    <p className="text-sm font-bold text-amber-400">
                      Faça o Passo {PROMPT_CONFIGS[deps.missing].numero} ({PROMPT_CONFIGS[deps.missing].titulo}) antes
                    </p>
                    <p className="text-xs text-slate-400 mt-1 mb-3">
                      Cole a resposta que o ChatGPT te deu no campo abaixo.
                    </p>
                    <Link href={`/prompts/${deps.missing}`} className="text-xs text-[#0ea5e9] font-bold hover:underline flex items-center gap-1 w-max">
                      Ir para Prompt {PROMPT_CONFIGS[deps.missing].numero} <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Previous Response Fields */}
              {config.dependencias.map((dep, index) => {
                const depConfig = PROMPT_CONFIGS[dep]
                const fieldKey = `resposta${depConfig.numero}`
                const value = (profile as Record<string, string | null>)?.[fieldKey] || ''
                const isSatisfied = !!value

                return (
                  <div key={dep}>
                    <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2 uppercase tracking-wider">
                      {isSatisfied ? <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span> : <span className="material-symbols-outlined text-amber-500 text-[18px]">error</span>}
                      Resposta do Passo {depConfig.numero} ({depConfig.titulo})
                    </label>
                    <Textarea
                      placeholder={`Cole aqui a resposta do ChatGPT do Passo ${depConfig.numero}...`}
                      value={value}
                      onChange={e => updateField(fieldKey, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#0ea5e9] outline-none resize-none transition-all shadow-inner min-h-[100px]"
                    />
                  </div>
                )
              })}

              {/* Extra Field (Roteiro / Vendas) */}
              {config.campoExtra && (
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block uppercase tracking-wider">
                    {config.campoExtra.label}
                  </label>
                  <Textarea
                    placeholder={config.campoExtra.placeholder}
                    value={(profile as Record<string, string | null>)?.[config.campoExtra.id] || ''}
                    onChange={e => updateField(config.campoExtra!.id, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#0ea5e9] outline-none resize-none transition-all shadow-inner min-h-[100px]"
                  />
                </div>
              )}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!deps.met}
              className="shimmer-btn w-full py-4 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed group transition-transform hover:scale-[1.02] active:scale-95"
            >
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">auto_awesome</span>
              {generated ? 'Gerar de Novo' : `Gerar Meu Texto`}
            </button>
          </motion.div>

          {/* Paste Current Response section */}
          {generated && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 border-l-4 border-l-[#0ea5e9]">
              <label className="text-sm font-bold flex items-center gap-2 text-white mb-2 uppercase tracking-wide">
                <span className="material-symbols-outlined text-[#0ea5e9]">chat</span>
                Resposta do ChatGPT
              </label>
              <p className="text-xs text-slate-400 mb-4">
                Copie o texto acima, cole no ChatGPT, e depois cole aqui a resposta que ele te der.
              </p>
              <Textarea
                placeholder="Cole a resposta final aqui..."
                value={(profile as Record<string, string | null>)?.[`resposta${config.numero}`] || ''}
                onChange={e => updateField(`resposta${config.numero}`, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#0ea5e9] outline-none resize-none transition-all min-h-[140px]"
              />

              {/* Next Prompt Button — appears when response is pasted */}
              {((profile as Record<string, string | null>)?.[`resposta${config.numero}`] || '').trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-5"
                >
                  {NEXT_PROMPT[tipo] ? (
                    <Link
                      href={`/prompts/${NEXT_PROMPT[tipo]}`}
                      className="shimmer-btn w-full py-4 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-lg group transition-transform hover:scale-[1.02] active:scale-95"
                    >
                      <span>Próximo Passo: {PROMPT_CONFIGS[NEXT_PROMPT[tipo]!].titulo}</span>
                      <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                  ) : (
                    <Link
                      href="/prompts"
                      className="w-full py-4 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-lg bg-gradient-to-r from-emerald-500 to-green-400 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                      <span>Tudo Pronto! 🎉</span>
                    </Link>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

        </div>

        {/* Right Column: Terminal Result */}
        <div className="flex flex-col h-full min-h-[600px] xl:max-h-[calc(100vh-120px)] xl:sticky xl:top-[100px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Seu Texto Gerado</span>
            <div className="flex gap-2">
              <span className={cn(
                "px-2 py-1 text-[10px] font-bold rounded border transition-colors",
                generated ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              )}>
                {generated ? 'PRONTO' : 'ESPERANDO'}
              </span>
              <span className="px-2 py-1 bg-[#0ea5e9]/10 text-[#0ea5e9] text-[10px] font-bold rounded border border-[#0ea5e9]/20">V2.4.0</span>
            </div>
          </div>
          
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl flex flex-col flex-1 overflow-hidden shadow-2xl">
            {/* Mac-style Terminal Header */}
            <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">gerador_texto_{config.tipo}</div>
              <button onClick={handleCopy} disabled={!generated} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                <span className="text-[10px] font-bold uppercase">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            
            {/* Terminal Content */}
            <div className="p-6 font-mono text-sm leading-relaxed overflow-y-auto flex-1 text-slate-300">
              {generated ? (
                 <div className="space-y-4">
                   <p className="text-[#0ea5e9]">✅ Texto gerado!</p>
                   <p className="text-emerald-400"># Passo {config.numero} ({config.titulo}) — copie e cole no ChatGPT</p>
                   <pre className="whitespace-pre-wrap break-words mt-4 font-sans text-base">{prompt}</pre>
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4 text-center">
                   <span className="material-symbols-outlined text-4xl">edit_note</span>
                   <p>Clique em "Gerar Meu Texto" para começar</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="text-[#0ea5e9] font-bold">➜</span>
                <span className="text-slate-500 text-xs">Copie o texto acima e cole no ChatGPT</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
