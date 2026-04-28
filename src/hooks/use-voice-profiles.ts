'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface VoiceProfile {
  id: string
  user_id: string
  name: string
  description?: string
  wizard_inputs: Record<string, any>
  enriched_profile: Record<string, any>
  is_default: boolean
  created_at: string
  updated_at: string
}

export function useVoiceProfiles() {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchProfiles = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProfiles(data as VoiceProfile[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const createProfile = useCallback(async (
    name: string,
    wizardInputs: Record<string, any>
  ): Promise<VoiceProfile | null> => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // 1. Salvar wizard_inputs no Supabase
      const isFirst = profiles.length === 0
      const { data, error } = await supabase
        .from('voice_profiles')
        .insert({
          user_id: user.id,
          name,
          wizard_inputs: wizardInputs,
          enriched_profile: {},
          is_default: isFirst,
        })
        .select()
        .single()

      if (error || !data) {
        console.error('Error creating voice profile:', error)
        return null
      }

      // 2. Enriquecer com IA (background)
      try {
        const enrichRes = await fetch('/api/enrich-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_id: data.id,
            wizard_inputs: wizardInputs,
          }),
        })
        
        if (enrichRes.ok) {
          const enrichData = await enrichRes.json()
          if (enrichData.enriched_profile) {
            // Atualizar no Supabase
            await supabase
              .from('voice_profiles')
              .update({ enriched_profile: enrichData.enriched_profile })
              .eq('id', data.id)

            data.enriched_profile = enrichData.enriched_profile
          }
        }
      } catch (enrichErr) {
        console.error('Enrichment failed (non-critical):', enrichErr)
      }

      setProfiles(prev => [data as VoiceProfile, ...prev])
      return data as VoiceProfile
    } finally {
      setSaving(false)
    }
  }, [supabase, profiles.length])

  const deleteProfile = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('voice_profiles')
      .delete()
      .eq('id', id)

    if (!error) {
      setProfiles(prev => prev.filter(p => p.id !== id))
    }
  }, [supabase])

  const setDefault = useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Remove default de todos
    await supabase
      .from('voice_profiles')
      .update({ is_default: false })
      .eq('user_id', user.id)

    // Seta o novo default
    await supabase
      .from('voice_profiles')
      .update({ is_default: true })
      .eq('id', id)

    setProfiles(prev =>
      prev.map(p => ({ ...p, is_default: p.id === id }))
    )
  }, [supabase])

  return {
    profiles,
    loading,
    saving,
    createProfile,
    deleteProfile,
    setDefault,
    refetch: fetchProfiles,
  }
}
