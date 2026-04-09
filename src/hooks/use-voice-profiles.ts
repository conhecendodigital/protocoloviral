'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface VoiceProfile {
  id: string
  user_id: string
  name: string
  description: string | null
  sample_texts: string[]
  extracted_style: any
  is_default: boolean
  created_at: string
  updated_at: string
}

export function useVoiceProfiles() {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('voice_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const createProfile = async (profileData: {
    name: string
    description?: string
    sample_texts: string[]
    extracted_style: any
    is_default?: boolean
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('voice_profiles')
        .insert([{ ...profileData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setProfiles(prev => [data, ...prev])
      return data
    } catch (err: any) {
      throw err
    }
  }

  const deleteProfile = async (id: string) => {
    try {
      const { error } = await supabase.from('voice_profiles').delete().eq('id', id)
      if (error) throw error
      setProfiles(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      throw err
    }
  }

  const setDefaultProfile = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Unset previous defaults
      await supabase
        .from('voice_profiles')
        .update({ is_default: false })
        .eq('user_id', user.id)

      // Set new default
      const { error } = await supabase
        .from('voice_profiles')
        .update({ is_default: true })
        .eq('id', id)

      if (error) throw error
      
      // Update local state
      setProfiles(prev => prev.map(p => ({
        ...p,
        is_default: p.id === id
      })))
    } catch (err: any) {
      throw err
    }
  }

  return {
    profiles,
    isLoading,
    error,
    fetchProfiles,
    createProfile,
    deleteProfile,
    setDefaultProfile
  }
}
