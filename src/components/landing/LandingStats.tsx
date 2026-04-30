'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  formatos: number
  roteiros: number
  assinantes: number
}

export function LandingStats() {
  const [stats, setStats] = useState<Stats>({ formatos: 0, roteiros: 0, assinantes: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function fetchStats() {
      const [fRes, rRes, aRes] = await Promise.all([
        // Total de formatos na biblioteca
        supabase.from('formatos').select('*', { count: 'exact', head: true }),
        // Total de roteiros gerados por todos os usuários
        supabase.from('roteiros').select('*', { count: 'exact', head: true }),
        // Total de assinantes pagos (plan_tier != free e not null)
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('plan_tier', 'free').not('plan_tier', 'is', null),
      ])

      setStats({
        formatos: fRes.count ?? 0,
        roteiros: rRes.count ?? 0,
        assinantes: aRes.count ?? 0,
      })
      setLoaded(true)
    }

    fetchStats()
  }, [])

  const NUMBERS = [
    { key: 'formatos' as const, label: 'formatos virais na biblioteca', suffix: '+' },
    { key: 'roteiros' as const, label: 'roteiros gerados até agora', suffix: '+' },
    { key: 'assinantes' as const, label: 'criadores usando ativamente', suffix: '+' },
    { key: null, label: 'garantia incondicional', value: '7 dias', suffix: '' },
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
