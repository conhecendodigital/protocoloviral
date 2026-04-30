'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  formatos: number
  roteiros: number
  criadores: number
}

export function LandingStats() {
  const [stats, setStats] = useState<Stats>({ formatos: 0, roteiros: 0, criadores: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function fetchStats() {
      const [fRes, rRes, cRes] = await Promise.all([
        // Total de formatos na biblioteca
        supabase.from('formatos').select('*', { count: 'exact', head: true }),
        // Total de roteiros gerados por todos os usuários
        supabase.from('roteiros').select('*', { count: 'exact', head: true }),
        // Total de criadores cadastrados na plataforma
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        formatos: fRes.count ?? 0,
        roteiros: rRes.count ?? 0,
        criadores: cRes.count ?? 0,
      })
      setLoaded(true)
    }

    fetchStats()
  }, [])

  const NUMBERS = [
    { key: 'formatos' as const, label: 'formatos virais na biblioteca', suffix: '+' },
    { key: 'roteiros' as const, label: 'roteiros gerados na plataforma', suffix: '+' },
    { key: 'criadores' as const, label: 'criadores usando a plataforma', suffix: '+' },
    { key: null, label: 'novos formatos adicionados por semana', value: 'Semanais', suffix: '' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.05]">
      {NUMBERS.map(s => {
        const raw = s.key ? stats[s.key] : null
        const display = s.value ?? (loaded && raw !== null ? raw.toLocaleString('pt-BR') : '...')
        return (
          <div key={s.label} className="bg-[#080b12]/80 py-6 px-4 text-center">
            <p className="text-2xl font-black text-white mb-1">
              {display}{s.suffix && loaded ? s.suffix : ''}
            </p>
            <p className="text-xs font-medium text-white/35">{s.label}</p>
          </div>
        )
      })}
    </div>
  )
}
