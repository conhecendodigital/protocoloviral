import type { Metadata } from 'next'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingSocialProof } from '@/components/landing/LandingSocialProof'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingTestimonials } from '@/components/landing/LandingTestimonials'
import { LandingPricing } from '@/components/landing/LandingPricing'
import { LandingFAQ } from '@/components/landing/LandingFAQ'
import { LandingCTA } from '@/components/landing/LandingCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Mapa do Engajamento — Roteirista IA para criadores de conteúdo',
  description: 'Gere roteiros virais para Reels e TikTok em menos de 30 segundos. IA treinada nos formatos que mais engajam. 5 roteiros grátis por dia, sem cartão.',
  openGraph: {
    title: 'Mapa do Engajamento — Roteirista IA',
    description: 'Do tema ao roteiro pronto em menos de 15 minutos. IA especializada em conteúdo viral.',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080b12] text-white overflow-x-hidden selection:bg-[#0ea5e9]/30 selection:text-white">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingSocialProof />
        <LandingProblem />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingPricing />
        <LandingFAQ />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
