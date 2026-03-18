'use client'

import { Check, Copy } from 'lucide-react'
import { useCopy } from '@/hooks/use-copy'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
  variant?: 'default' | 'icon'
  label?: string
  copiedLabel?: string
}

export function CopyButton({ text, className, variant = 'default', label = 'Copiar', copiedLabel = 'Copiado!' }: CopyButtonProps) {
  const { copy, copied } = useCopy()

  return (
    <button
      onClick={() => copy(text)}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-medium transition-all",
        variant === 'icon'
          ? "p-2 hover:bg-muted"
          : "px-3 py-1.5 text-xs bg-muted hover:bg-muted/80",
        copied && "text-emerald-500",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 shrink-0" />
          {variant === 'default' && <span className="truncate">{copiedLabel}</span>}
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 shrink-0" />
          {variant === 'default' && <span className="truncate">{label}</span>}
        </>
      )}
    </button>
  )
}

