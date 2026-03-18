'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/profile'

export function useProfile() {
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | undefined>()
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    setUserId(user.id)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      await supabase.from('profiles').insert({ id: user.id, email: user.email })
      setProfile({ id: user.id, email: user.email || '' })
    } else {
      setProfile(data)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateField = useCallback(async (field: string, value: string) => {
    if (!userId) return
    setProfile(prev => prev ? { ...prev, [field]: value } : null)

    await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', userId)
  }, [userId, supabase])

  const getCompletionPercent = useCallback(() => {
    if (!profile) return 0
    const fields = ['nicho', 'assunto', 'formacoes', 'resultado', 'diferencial',
      'publico', 'dor', 'tentou', 'concorrentes', 'proposito',
      'receio', 'tempo', 'naoquer'] as const
    let filled = 0
    fields.forEach(f => { if (profile[f]) filled++ })
    return Math.round((filled / fields.length) * 100)
  }, [profile])

  return { profile, loading, userId, updateField, fetchProfile, getCompletionPercent }
}
