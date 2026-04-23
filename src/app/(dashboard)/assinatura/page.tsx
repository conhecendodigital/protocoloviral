'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useProfile } from '@/hooks/use-profile'
import { Loader2, CheckCircle2, Shield, Star, Zap, Crown, ArrowRightLeft, Flame } from 'lucide-react'
import { CheckoutBrick } from '@/components/checkout/checkout-brick'

const FEATURES = [
  'Acesso completo a todos os Agentes de IA',
  'Geração ilimitada de Ganchos Virais',
  'Estruturas de Roteiro Premium',
  'Análise Inteligente de Bio e Perfil',
  'Mapeamento Avançado da Jornada do Público',
  'Atualizações e novos formatos gratuitos',
]

const PLANS = [
  {
    id: 'mensal',
    title: 'Mensal',
    price: '97',
    desc: 'Perfeito para testar e validar o ecossistema.',
    badge: null,
    badgeHot: false,
    popular: false,
  },
  {
    id: 'trimestral',
    title: 'Trimestral',
    price: '200',
    desc: 'O mais escolhido. Compromisso ideal por 3 meses.',
    badge: 'MAIS POPULAR',
    badgeHot: true,
    popular: true,
  },
  {
    id: 'semestral',
    title: 'Semestral',
    price: '297',
    desc: 'Pague por ~3 meses e ganhe 6 meses de acesso total.',
    badge: 'MAIOR ECONOMIA',
    badgeHot: false,
    popular: false,
  }
]

function AssinaturaContent() {
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get('plan') // ex: 'mensal' | 'trimestral' | 'semestral'

  const { profile, loading } = useProfile()
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [selectedPlanForBrick, setSelectedPlanForBrick] = useState<{ id: string, price: number } | null>(null)
  const [cancelStatus, setCancelStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [cancelMessage, setCancelMessage] = useState('')

  // Auto-abre checkout se veio da landing com plano selecionado
  useEffect(() => {
    if (!loading && planFromUrl && !profile?.plan_tier?.match(/mensal|trimestral|semestral/)) {
      const found = PLANS.find(p => p.id === planFromUrl)
      if (found) setSelectedPlanForBrick({ id: found.id, price: Number(found.price) })
    }
  }, [loading, planFromUrl, profile?.plan_tier])

  const handleCheckoutClick = (planId: string, price: string) => {
    setSelectedPlanForBrick({ id: planId, price: Number(price) })
  }

  const handleCheckoutSuccess = () => {
    console.log('Assinatura ativada!')
    setSelectedPlanForBrick(null)
    window.location.reload() // Reload to fetch updated profile
  }

  const handleCheckoutError = (msg: string) => {
    console.error(msg)
    setSelectedPlanForBrick(null)
  }

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura ativa? Você ainda terá acesso até o fim do período já pago.')) return

    setCancelStatus('loading')
    try {
      const res = await fetch('/api/checkout/cancel', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setCancelStatus('success')
        setCancelMessage(data.message)
      } else {
        setCancelStatus('error')
        setCancelMessage(data.error || 'Falha ao cancelar')
      }
    } catch (err) {
      setCancelStatus('error')
      setCancelMessage('Falha ao comunicar com o servidor')
    }
  }

  // Days remaining
  const daysRemaining = useMemo(() => {
    if (!profile?.current_period_end) return null
    const end = new Date(profile.current_period_end)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [profile?.current_period_end])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
      </div>
    )
  }

  const activePlan = profile?.plan_tier !== 'free' ? profile?.plan_tier : null
  const isCanceled = profile?.cancel_at_period_end === true

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 pb-32 w-full relative z-10">
      
      {selectedPlanForBrick && (
        <CheckoutBrick 
          planId={selectedPlanForBrick.id} 
          price={selectedPlanForBrick.price} 
          onSuccess={handleCheckoutSuccess}
          onError={handleCheckoutError}
          onClose={() => setSelectedPlanForBrick(null)}
        />
      )}
      
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-[#0ea5e9] mx-auto text-sm font-bold tracking-widest uppercase mb-4">
            <Crown className="w-4 h-4" /> Desbloqueie seu Potencial
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Assinatura <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500">Premium</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-600 dark:text-white/70 text-lg leading-relaxed">
            Independentemente do plano escolhido, você terá acesso irrestrito a todas as ferramentas e inteligências de engajamento da nossa plataforma.
          </motion.p>
        </div>

        {/* Status Block if Active */}
        {activePlan && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto glass-card rounded-3xl p-8 border border-emerald-500/20 text-center relative overflow-hidden bg-gradient-to-b from-emerald-500/10 to-transparent">
            {/* Glow decorativo */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Shield className="w-32 h-32 text-emerald-500" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="size-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Seu Acesso está Ativo</h3>
                <p className="text-slate-600 dark:text-white/70 mt-2 font-medium">Plano Atual: <span className="uppercase text-emerald-500 font-bold">{activePlan}</span></p>
                {daysRemaining !== null && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-1">
                    Você tem {daysRemaining} dia(s) restante(s) neste ciclo.
                  </p>
                )}
                {isCanceled && (
                  <p className="text-amber-500 font-bold text-sm mt-3 bg-amber-500/10 inline-block px-4 py-2 rounded-lg">
                    Renovação Desativada. Você tem acesso até o final do período vigente.
                  </p>
                )}
              </div>
              
              {!isCanceled && (
                <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                  {cancelStatus === 'success' ? (
                     <div className="text-emerald-500 font-bold text-sm">{cancelMessage}</div>
                  ) : cancelStatus === 'error' ? (
                     <div className="text-red-500 font-bold text-sm">{cancelMessage}</div>
                  ) : (
                    <button 
                      onClick={handleCancel}
                      disabled={cancelStatus === 'loading'}
                      className="text-sm font-bold text-slate-500 dark:text-white/50 hover:text-red-500 transition-colors uppercase tracking-widest disabled:opacity-50"
                    >
                      {cancelStatus === 'loading' ? 'Processando...' : 'Cancelar Assinatura'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Pricing Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Features Column (Left) */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6 pt-12 hidden md:block">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest opacity-80 border-b border-black/10 dark:border-white/10 pb-4">
              O que está incluso
            </h3>
            <ul className="space-y-5">
              {FEATURES.map((feature, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-white/80 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="leading-tight">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Cards */}
          <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 * i }}
                key={plan.id}
                className={`glass-card rounded-3xl p-8 relative flex flex-col transition-all duration-300 ${plan.popular ? 'border-[#0ea5e9]/50 shadow-[0_8px_32px_-4px_rgba(14,165,233,0.2),0_0_0_1px_rgba(14,165,233,0.1)] scale-100 lg:scale-[1.02] z-20 bg-white/60 dark:bg-[#0B0F19]/80' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-white text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-lg flex items-center gap-1.5 ${
                    plan.badgeHot
                      ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-amber-500/30'
                      : 'bg-gradient-to-r from-slate-600 to-slate-800 shadow-slate-500/20'
                  }`}>
                    {plan.badgeHot && <Flame className="w-3 h-3" />}
                    {!plan.badgeHot && <Star className="w-3 h-3" />}
                    {plan.badge}
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center capitalize">{plan.title}</h3>
                <p className="text-slate-500 dark:text-white/50 text-sm text-center leading-relaxed h-10">{plan.desc}</p>
                
                <div className="my-8 flex justify-center items-end gap-1">
                  <span className="text-lg font-bold text-slate-400 mb-1">R$</span>
                  <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                  <span className="text-sm font-medium text-slate-500 mb-1">/{plan.id.slice(0, 3)}</span>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-200 dark:border-white/10">
                  <button
                    disabled={activePlan === plan.id || checkingOut !== null}
                    onClick={() => handleCheckoutClick(plan.id, plan.price)}
                    className={`w-full py-4 rounded-xl flex items-center justify-center text-[13px] font-bold uppercase tracking-widest px-2 ${
                      activePlan === plan.id 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-not-allowed'
                        : plan.popular 
                          ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-lg shadow-sky-500/20 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:shadow-xl hover:shadow-sky-500/30 active:scale-[0.98] active:duration-100'
                          : 'bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-black/10 dark:hover:bg-white/10 hover:scale-[1.02] hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.98] active:duration-100'
                    }`}
                  >
                    {checkingOut === plan.id ? (
                      <div className="inline-flex items-center gap-2 justify-center">
                        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                        <span className="leading-tight">Carregando...</span>
                      </div>
                    ) : activePlan === plan.id ? (
                      <div className="inline-flex items-center gap-2 justify-center">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span className="leading-tight">Seu Plano</span>
                      </div>
                    ) : activePlan ? (
                      <div className="inline-flex items-center gap-2 justify-center">
                        <ArrowRightLeft className="w-4 h-4 shrink-0" />
                        <span className="leading-tight">Mudar Plano</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 justify-center text-left">
                        <Zap className="w-4 h-4 shrink-0" />
                        <span className="leading-tight">Assinar {plan.title}</span>
                      </div>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 dark:text-white/30 mt-4 uppercase tracking-widest">
                    Pagamento 100% Seguro
                  </p>
                </div>
                
                {/* Mobile features (since left col is hidden) */}
                <div className="md:hidden mt-8 pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
                   {FEATURES.map((feature, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-slate-700 dark:text-white/80 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </main>
  )
}

export default function AssinaturaPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#0ea5e9]" /></div>}>
      <AssinaturaContent />
    </Suspense>
  )
}
