'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { VideoIcon, X } from 'lucide-react'

export interface FormatoMinimal {
  id: string
  titulo: string
  nicho: string
  estudo: string
  descricao: string | null
}

interface Props {
  selectedId: string | null
  onSelect: (f: FormatoMinimal | null) => void
  disabled?: boolean
}

export function FormatPicker({ selectedId, onSelect, disabled }: Props) {
  const [formatos, setFormatos] = useState<FormatoMinimal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data } = await supabase
        .from('formatos')
        .select('id, titulo, nicho, estudo, descricao')
        .order('created_at', { ascending: false })
      
      if (data) setFormatos(data)
      setIsLoading(false)
    }
    fetch()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 animate-pulse rounded" />
        <div className="h-12 w-full bg-slate-200 dark:bg-white/5 animate-pulse rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 dark:text-white/80 flex items-center justify-between uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><VideoIcon size={14} className="text-[14px] text-[#0ea5e9]" /> Estrutura Viral</span>
        {selectedId && (
           <button onClick={() => onSelect(null)} className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white uppercase font-bold">Limpar</button>
        )}
      </label>
      
      {!selectedId ? (
        <select 
          disabled={disabled}
          onChange={(e) => {
             const f = formatos.find(x => x.id === e.target.value)
             if (f) onSelect(f)
          }}
          className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:text-white"
        >
          <option value="">Selecione um formato de sucesso...</option>
          {formatos.map(f => (
            <option key={f.id} value={f.id}>
              {f.nicho ? `[${f.nicho}] ` : ''}{f.titulo}
            </option>
          ))}
        </select>
      ) : (
        <div className="p-4 bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 rounded-xl flex items-start justify-between gap-4">
          <div className="flex-1">
             <span className="inline-block bg-[#0ea5e9] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">Formato Selecionado</span>
             <h4 className="text-sm font-bold text-slate-900 dark:text-white">
               {formatos.find(f => f.id === selectedId)?.titulo}
             </h4>
             <p className="text-xs text-slate-600 dark:text-white/60 mt-1 line-clamp-2">
               {formatos.find(f => f.id === selectedId)?.descricao}
             </p>
          </div>
          <button 
            disabled={disabled}
            onClick={() => onSelect(null)} 
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
             <X size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
