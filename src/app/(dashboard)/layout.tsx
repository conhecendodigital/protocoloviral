'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { OnboardingModal } from '@/components/shared/OnboardingModal'
import { useProfile } from '@/hooks/use-profile'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, loading, userId, updateField } = useProfile()
  const [dismissed, setDismissed] = useState(false)

  const handleOnboardingComplete = useCallback(() => {
    setDismissed(true)
  }, [])

  // Show onboarding if profile loaded, not completed, and not dismissed
  const showOnboarding = !loading && profile && !profile.onboarding_completed && !dismissed && userId

  return (
    <div className="bg-[#000000] text-slate-100 min-h-screen font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar className="shrink-0" />
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          <Header className="sticky top-0 z-20" />
          <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex-1">
            {children}
          </main>
        </div>
      </div>

      {/* Onboarding Modal — First Access */}
      {showOnboarding && (
        <OnboardingModal
          userId={userId}
          onComplete={handleOnboardingComplete}
          updateField={updateField}
        />
      )}
    </div>
  )
}
