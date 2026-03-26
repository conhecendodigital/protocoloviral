'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/profile'

/** Whitelist of fields the user is allowed to edit */
const EDITABLE_FIELDS = new Set([
  'nome_completo', 'avatar_url',
  'nicho', 'assunto', 'formacoes', 'resultado', 'diferencial',
  'publico', 'dor', 'tentou', 'concorrentes', 'proposito',
  'receio', 'tempo', 'naoquer',
  'resposta1', 'resposta2', 'resposta3', 'resposta4', 'resposta5',
  'ideia_roteiro', 'produto_venda',
])

export function useProfile() {
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | undefined>()
  const supabase = useMemo(() => createClient(), [])

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
      // Use upsert to avoid 409 Conflict if multiple components try to create the profile at the exact same time
      await supabase.from('profiles').upsert({ id: user.id, email: user.email }, { onConflict: 'id' })
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
    // Security: only allow whitelisted fields
    if (!EDITABLE_FIELDS.has(field)) {
      console.warn(`[useProfile] Blocked write to non-editable field: "${field}"`)
      return
    }

    setProfile(prev => prev ? { ...prev, [field]: value } : null)

    await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', userId)
  }, [userId, supabase])

  const uploadAvatar = useCallback(async (file: File) => {
    if (!userId) return null
    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      console.error('[useProfile] Avatar upload error:', uploadError)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl + '?t=' + Date.now()

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    return publicUrl
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

  return { profile, loading, userId, updateField, uploadAvatar, fetchProfile, getCompletionPercent }
}
