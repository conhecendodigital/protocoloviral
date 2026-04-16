import React, { useMemo } from 'react'
import { parseRoteiroBlocks } from '@/lib/parser'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

interface ScriptRendererProps {
  content: string;
  isUnlocked: boolean; 
  isGenerating?: boolean; 
}

export function ScriptRenderer({ content, isUnlocked, isGenerating }: ScriptRendererProps) {
  const parsed = useMemo(() => parseRoteiroBlocks(content), [content]);

  // Se o parser não achou as tags exatas do modelo visual (Ex: erro, conversa casual)
  // ou ainda está carregando as tags
  if (!parsed || (!parsed.gancho && !parsed.desenvolvimento && !parsed.cta)) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-[13px] [&_p]:leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    )
  }

  // Extrair o Thinking Block customizado (se existir)
  const thinkingMatch = content.match(/> 🧠 \*\*Ativando Raciocínio Profundo\.\.\.\*\*(.*?)\n\n/is);
  const thinkingText = thinkingMatch ? thinkingMatch[0] : null;

  // PandaBay Style Visual Blocks
  return (
    <div className="flex flex-col gap-4 w-[28rem] sm:w-[36rem] max-w-full text-left bg-transparent font-sans">
      
      {/* GANCHO MESTRE */}
      {parsed.gancho && (
        <div className="border-[1.5px] border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 bg-[#FFFCF5] dark:bg-white/5 shadow-sm transition-all hover:border-[#0ea5e9]/40 hover:shadow-md">
          <div className="flex flex-wrap items-center gap-2 mb-4">
             <span className="text-[10px] uppercase font-bold text-orange-500 tracking-widest bg-orange-500/10 px-2 py-1 rounded-md">Gancho Ativo</span>
             {parsed.metadata?.hash1 && <span className="bg-[#1C2024] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">{parsed.metadata.hash1}</span>}
             {parsed.metadata?.hash2 && <span className="bg-[#1C2024] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">{parsed.metadata.hash2}</span>}
          </div>
          <p className="text-slate-800 dark:text-white/90 text-[18px] leading-relaxed font-semibold">
            {parsed.gancho}
          </p>
          {parsed.metadata?.direcao && (
            <div className="mt-5 flex items-start gap-2 border-t border-slate-200/60 dark:border-white/5 pt-4 text-[13px] text-slate-500 dark:text-white/50 font-medium">
               <span className="material-symbols-outlined text-[18px] text-amber-500">lightbulb</span>
               <span>{parsed.metadata.direcao.replace('💡', '').trim()}</span>
            </div>
          )}
        </div>
      )}

      {/* PAYWALL / DESENVOLVIMENTO */}
      <div className="relative">
        <div className={`flex flex-col gap-4 transition-all duration-700 ease-in-out ${!isUnlocked && parsed.desenvolvimento && parsed.desenvolvimento.length > 30 ? 'blur-[6px] pointer-events-none select-none opacity-50 grayscale-[30%] pb-10' : ''}`}>
          
          {parsed.desenvolvimento && (
            <div className="border-[1.5px] border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 bg-white dark:bg-white/5 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-4 block">Desenvolvimento (Corpo)</span>
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-white/80 [&_p]:text-[15px] [&_p]:leading-loose">
                 <ReactMarkdown>{parsed.desenvolvimento}</ReactMarkdown>
              </div>
            </div>
          )}

          {parsed.cta && (
            <div className="border-[1.5px] border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[#0ea5e9]/[0.03] to-transparent">
              <span className="text-[10px] uppercase font-bold text-[#0ea5e9] tracking-wider mb-3 block">Chamada para Ação</span>
              <p className="text-slate-800 dark:text-white/90 text-[15px] font-medium leading-relaxed">{parsed.cta}</p>
            </div>
          )}
        </div>

        {/* PAYWALL OVERLAY BUTTON */}
        {!isUnlocked && parsed.desenvolvimento && parsed.desenvolvimento.length > 30 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pt-10">
            <Link href="/assinatura" className="group flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-[#0ea5e9] hover:from-blue-500 hover:to-sky-400 text-white shadow-2xl shadow-[#0ea5e9]/40 px-8 py-4 rounded-full font-bold text-sm transition-all transform hover:scale-105 hover:-translate-y-1">
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              Desbloquear Roteiro Completo
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}
