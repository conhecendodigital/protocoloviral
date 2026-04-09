'use client'

import { useVoiceProfiles } from '@/hooks/use-voice-profiles'
import { cn } from '@/lib/utils'

interface Props {
  selectedId: string | null
  onSelect: (id: string | null) => void
  disabled?: boolean
}

export function VoiceSelector({ selectedId, onSelect, disabled }: Props) {
  const { profiles, isLoading } = useVoiceProfiles()

  if (isLoading) {
    return (
      <div className="flex gap-2 p-1 overflow-x-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-24 bg-slate-200 dark:bg-white/5 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-700 dark:text-white/80 flex items-center gap-1.5 uppercase tracking-wider">
          <span className="material-symbols-outlined text-[14px] text-violet-500">record_voice_over</span>
          Tom de Voz
        </label>
        {profiles.length === 0 && (
          <a href="/tom-de-voz" className="text-[10px] text-violet-500 hover:underline">Configurar seu tom</a>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          disabled={disabled}
          onClick={() => onSelect(null)}
          className={cn(
            "shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors border",
            selectedId === null
              ? "bg-violet-50 dark:bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300"
              : "bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5"
          )}
        >
          Automático (Neutro)
        </button>

        {profiles.map(profile => (
          <button
            key={profile.id}
            disabled={disabled}
            onClick={() => onSelect(profile.id)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors border flex items-center gap-1.5",
              selectedId === profile.id
                ? "bg-violet-50 dark:bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300"
                : "bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5"
            )}
          >
            {profile.is_default && <span className="material-symbols-outlined text-[12px]">star</span>}
            {profile.name}
          </button>
        ))}
      </div>
    </div>
  )
}
