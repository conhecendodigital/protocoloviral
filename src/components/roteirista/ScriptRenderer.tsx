import React, { useMemo, useState } from 'react'
import { parseRoteiroBlocks, BlockMeta } from '@/lib/parser'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { Check, Copy, Heart, Lock } from 'lucide-react'

interface ScriptRendererProps {
  content: string;
  isUnlocked: boolean; 
  isGenerating?: boolean;
  onSave?: () => void;
}

// ─── Single Block Component (PandaBay-Style) ───────────────
function ScriptBlock({ 
  type, 
  emoji, 
  text, 
  meta, 
  isLocked = false, 
  colorClass = 'text-sky-500',
  bgClass = 'bg-white dark:bg-white/5'
}: { 
  type: string; 
  emoji: string; 
  text: string; 
  meta?: BlockMeta; 
  isLocked?: boolean;
  colorClass?: string;
  bgClass?: string;
}) {
  return (
    <div className={`relative border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden ${bgClass} shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none transition-all hover:border-slate-300 dark:hover:border-white/15`}>
      {/* Badge */}
      <div className="flex items-center justify-center py-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colorClass} bg-current/[0.08]`}>
          <span className="text-sm">{emoji}</span>
          <span>{type}</span>
        </span>
      </div>

      {/* Content */}
      <div className={`px-5 sm:px-6 pb-4 ${isLocked ? 'blur-[6px] select-none pointer-events-none' : ''}`}>
        <div className="text-slate-800 dark:text-white/90 text-[16px] sm:text-[17px] leading-[1.8] font-medium whitespace-pre-wrap">
          {text.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <br key={i} />;
            // Strip quotes at start/end for cleaner display
            const cleaned = trimmed.replace(/^[""]|[""]$/g, '');
            return (
              <p key={i} className="mb-1.5">
                {cleaned}
              </p>
            );
          })}
        </div>
      </div>

      {/* Direction + Time */}
      {meta && (meta.direction || meta.timeSeconds > 0) && (
        <div className={`px-5 sm:px-6 pb-4 flex flex-col gap-2 ${isLocked ? 'blur-[6px] select-none pointer-events-none' : ''}`}>
          {meta.direction && (
            <div className="flex items-start gap-2 text-[13px] text-slate-500 dark:text-white/50">
              <span className="text-base mt-0.5 shrink-0">🎤</span>
              <span className="italic leading-relaxed">{meta.direction}</span>
            </div>
          )}
          {meta.timeSeconds > 0 && (
            <div className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-white/40 font-medium tabular-nums">
              <span className="text-sm">⏱</span>
              <span>{meta.timeSeconds}s</span>
            </div>
          )}
        </div>
      )}

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#FFFCF5]/30 dark:bg-slate-900/30">
          <Link href="/assinatura" className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-xl shadow-amber-500/30 px-6 py-3 rounded-full font-bold text-xs transition-all transform hover:scale-105 hover:-translate-y-0.5">
            <Lock size={16} className="text-[16px]" />
            Desbloquear conteúdo
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Main ScriptRenderer ───────────────────────────────────
export function ScriptRenderer({ content, isUnlocked, isGenerating, onSave }: ScriptRendererProps) {
  const parsed = useMemo(() => parseRoteiroBlocks(content), [content]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Se o parser não achou as tags exatas do modelo visual
  if (!parsed || (!parsed.gancho && !parsed.desenvolvimento && !parsed.cta)) {
    const sanitized = content
      .replace(/\[THINKING\][\s\S]*?\[\/THINKING\]/gi, '')
      .replace(/\[METADADOS[^\]]*\]/gi, '')
      .replace(/🎤\s*.+/gm, '')
      .replace(/⏱\s*\d+\s*s/gi, '')
      .trim();
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-[15px] [&_p]:leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{sanitized}</ReactMarkdown>
      </div>
    )
  }

  const handleCopy = async () => {
    const plainText = [
      parsed.gancho,
      parsed.desenvolvimento,
      parsed.cta,
    ].filter(Boolean).join('\n\n');
    
    try {
      await navigator.clipboard.writeText(plainText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = plainText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    if (onSave) onSave();
    setTimeout(() => setSaved(false), 2000);
  };

  const isDevLocked = !isUnlocked && parsed.desenvolvimento && parsed.desenvolvimento.length > 30;

  return (
    <div className="flex flex-col gap-0 w-full max-w-2xl text-left bg-transparent font-sans">
      
      {/* HEADER — Hashtags */}
      {parsed.metadata && (parsed.metadata.hash1 || parsed.metadata.hash2) && (
        <div className="flex flex-wrap items-center gap-2 mb-3 px-1">
          {parsed.metadata.hash1 && (
            <span className="bg-slate-900 dark:bg-white/10 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">{parsed.metadata.hash1}</span>
          )}
          {parsed.metadata.hash2 && (
            <span className="bg-slate-900 dark:bg-white/10 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">{parsed.metadata.hash2}</span>
          )}
        </div>
      )}

      {/* === GANCHO BLOCK === */}
      {parsed.gancho && (
        <ScriptBlock
          type="Hook"
          emoji="🪝"
          text={parsed.gancho}
          meta={parsed.ganchoMeta}
          colorClass="text-orange-500"
          bgClass="bg-[#FFFCF5] dark:bg-white/5"
        />
      )}

      {/* Connector dot */}
      <div className="flex items-center justify-center py-1">
        <div className="w-0.5 h-4 bg-slate-200 dark:bg-white/10 rounded-full" />
      </div>

      {/* === DESENVOLVIMENTO BLOCK === */}
      {parsed.desenvolvimento && (
        <ScriptBlock
          type="Desenvolvimento"
          emoji="📝"
          text={parsed.desenvolvimento}
          meta={parsed.desenvolvimentoMeta}
          isLocked={!!isDevLocked}
          colorClass="text-sky-500"
          bgClass="bg-white dark:bg-white/5"
        />
      )}

      {/* Connector dot */}
      <div className="flex items-center justify-center py-1">
        <div className="w-0.5 h-4 bg-slate-200 dark:bg-white/10 rounded-full" />
      </div>

      {/* === CTA BLOCK === */}
      {parsed.cta && (
        <ScriptBlock
          type="CTA"
          emoji="📢"
          text={parsed.cta}
          meta={parsed.ctaMeta}
          isLocked={!!isDevLocked}
          colorClass="text-emerald-500"
          bgClass="bg-gradient-to-br from-emerald-500/[0.03] to-transparent dark:from-emerald-500/[0.02]"
        />
      )}

      {/* ═══ METRICS FOOTER BAR ═══ */}
      {!isGenerating && (parsed.totalTimeSeconds > 0 || parsed.totalWords > 0) && (
        <div className="mt-4 flex items-center justify-between gap-3 bg-slate-900 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-white">
          {/* Left — Metrics */}
          <div className="flex items-center gap-4 text-[11px] font-medium text-white/70 tabular-nums">
            {parsed.totalTimeSeconds > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-sm">⏱</span>
                {parsed.totalTimeSeconds}s
              </span>
            )}
            {parsed.totalWords > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-sm">📄</span>
                {parsed.totalWords}
              </span>
            )}
            {parsed.wordsPerSecond > 0 && (
              <span className="flex items-center gap-1 text-white/50">
                {parsed.wordsPerSecond} p/s
              </span>
            )}
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white/80 hover:text-white transition-all"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar roteiro'}
            </button>

            {isUnlocked && (
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                  saved 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                }`}
              >
                {saved ? <Check size={14} /> : <Heart size={14} />}
                {saved ? 'Salvo!' : 'Gostei, salvar'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
