'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/use-profile';
import { useState } from 'react';

const plans = [
    {
        id: 'free',
        name: 'Plano Básico',
        price: 'Grátis',
        desc: 'Para testar a plataforma.',
        tokens: '5 Créditos / 24h',
        features: [
            'Acesso a agentes básicos',
            'Histórico de chat'
        ],
        buttonText: 'Seu Atual',
        badge: null,
        border: 'border-border',
        bg: 'bg-card',
        btnStyle: 'bg-secondary text-muted-foreground hover:bg-secondary/80 border border-border font-bold'
    },
    {
        id: 'pro',
        name: 'Profissional',
        price: 'R$ 49/mês',
        desc: 'Para quem precisa acelerar o conteúdo.',
        tokens: '50 Créditos / 24h',
        features: [
            'Tudo do Básico',
            'Acesso a agentes Pro',
            'IA rápida selecionada',
            'Resolução ágil de tarefas',
        ],
        buttonText: 'Assinar Profissional',
        badge: 'MAIS POPULAR',
        border: 'border-indigo-500 ring-1 ring-indigo-500',
        bg: 'bg-indigo-500/5',
        btnStyle: 'bg-indigo-500 hover:bg-indigo-600 shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] text-white font-bold'
    },
    {
        id: 'premium',
        name: 'Elite VIP',
        price: 'R$ 97/mês',
        desc: 'Limites altíssimos para alto volume.',
        tokens: '150 Créditos / 24h',
        features: [
            'Tudo do Profissional',
            'Acesso VIP a todos os Agentes',
            'Modelos de Elite Sem Limite',
            'Suporte técnico direto'
        ],
        buttonText: 'Assinar Elite',
        badge: 'VIP',
        border: 'border-amber-500 ring-1 ring-amber-500',
        bg: 'bg-amber-500/5',
        btnStyle: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] text-white font-bold'
    }
];

export default function PlanosPage() {
    const { profile } = useProfile();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const userTier = profile?.plan_tier || 'free';
    const isCancelledNextMonth = (profile as any)?.cancel_at_period_end || false;
    const hasAcceptedTerms = (profile as any)?.has_accepted_terms || false;

    const proceedToPayment = async (planId: string) => {
        setLoadingPlan(planId);
        setErrorMessage(null);
        try {
            const res = await fetch('/api/checkout/mercadopago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            const data = await res.json();
            
            if (data.url) {
                window.location.href = data.url; 
            } else {
                setErrorMessage("Houve um problema de conexão com o banco. Pela sua segurança a transação foi cancelada.");
                setLoadingPlan(null);
            }
        } catch (error) {
            setErrorMessage("Sem conexão com o serviço de pagamentos. Verifique sua internet.");
            setLoadingPlan(null);
        }
    };

    const handleAction = async (planId: string) => {
        if (userTier === planId) return;
        
        // Se o cara quer migrar pro Free (Downgrade/Cancelar)
        if (planId === 'free') {
            handleCancel();
            return;
        }

        // Verifica se já aceitou os termos no banco
        if (!hasAcceptedTerms) {
            setPendingPlanId(planId);
            setShowTermsModal(true);
            return;
        }

        proceedToPayment(planId);
    };

    const handleAcceptTermsAndProceed = async () => {
        if (!acceptedTerms) {
            setErrorMessage('Por favor, confirme que compreendeu e leu os termos marcando a caixinha antes de continuar.');
            return;
        }
        
        try {
            setLoadingPlan('terms');
            setErrorMessage(null);
            const res = await fetch('/api/checkout/accept-terms', { method: 'POST' });
            
            if (!res.ok) {
                throw new Error();
            }
            
            if (profile) {
                (profile as any).has_accepted_terms = true;
            }
            
            setShowTermsModal(false);
            if (pendingPlanId) {
                proceedToPayment(pendingPlanId);
            }
        } catch(e: any) {
            setErrorMessage('Tivemos um problema de comunicação provisório com o painel ao tentar assinar seus termos. Tente novamente em cinco segundos.');
            setLoadingPlan(null);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Você tem certeza que quer cancelar as próximas renovações e estornar ou cancelar este plano atual?')) return;
        setLoadingPlan('free');
        
        try {
            const res = await fetch('/api/checkout/cancel', {
                method: 'POST'
            });
            const data = await res.json();
            
            if (data.success) {
                alert(data.message); // Exibe aviso Condição A ou B do Backend
                window.location.reload(); 
            } else {
                alert('Erro ao cancelar: ' + data.error);
                setLoadingPlan(null);
            }
        } catch (error) {
            alert('Erro ao cancelar: Falha de conexão');
            setLoadingPlan(null);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar relative">
            <div className="absolute top-0 left-0 w-full h-[60vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent pointer-events-none z-0"></div>
            
            <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 text-center relative z-10 w-full">
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-xs tracking-widest uppercase mb-6 border border-emerald-500/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Pagamento Seguro Mercado Pago
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter uppercase italic mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#0ea5e9] pr-3 -mr-3">
                            INVISTA NO SEU
                        </span> SUCESSO
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        Aumente a inteligência do seu negócio utilizando IA com orçamentos previsíveis. 
                        Todos os planos <strong>recarregam de créditos automaticamente a cada 24 horas</strong>.<br/>
                        <span className="text-sm mt-3 inline-block">💡 <strong>1 Crédito</strong> equivale a aproximadamente <strong>1 página de texto</strong> lida ou escrita pela IA.</span>
                    </p>
                </motion.div>

                {errorMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center gap-3 max-w-2xl mx-auto shadow-lg shadow-rose-500/5"
                    >
                        <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                        <p className="font-semibold text-sm leading-snug">{errorMessage}</p>
                    </motion.div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch justify-center">
                    {plans.map((plan, i) => {
                        const isCurrentPlan = userTier === plan.id;
                        
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                            >
                                <div className={`h-full relative rounded-[2rem] p-8 glass-card border ${plan.border} ${plan.bg} text-left flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}>
                                    {plan.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-foreground text-background text-[10px] font-black tracking-widest uppercase shadow-xl border-2 border-background">
                                            {plan.badge}
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-2xl font-black italic tracking-tight text-foreground mb-1">{plan.name}</h3>
                                        <p className="text-sm font-medium text-muted-foreground mb-6 h-10">{plan.desc}</p>
                                        
                                        <div className="mb-6 pb-6 border-b border-border">
                                            <div className="flex items-baseline gap-1">
                                                {plan.price !== 'Grátis' && <span className="text-muted-foreground font-bold text-lg">R$</span>}
                                                <span className="text-5xl font-black tracking-tighter text-foreground">{plan.price.replace('R$ ', '').replace('/mês', '')}</span>
                                                {plan.price !== 'Grátis' && <span className="text-muted-foreground text-sm font-medium">/ mês</span>}
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex items-center gap-3 bg-background/60 border border-border shadow-inner rounded-xl p-3 mb-6">
                                                <div className="bg-orange-500/10 p-1.5 rounded-lg shrink-0">
                                                    <span className="material-symbols-outlined text-orange-400 text-lg">token</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cota Diária de IA</p>
                                                    <p className="font-bold text-foreground text-sm">{plan.tokens}</p>
                                                </div>
                                            </div>

                                            <ul className="space-y-4">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <div className="bg-emerald-500/10 p-0.5 rounded-full shrink-0 mt-0.5">
                                                            <span className="material-symbols-outlined text-emerald-500 text-[14px]">done</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground leading-snug">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-8">
                                        <button
                                            onClick={() => handleAction(plan.id)}
                                            disabled={isCurrentPlan || loadingPlan !== null}
                                            className={`w-full py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 
                                                ${isCurrentPlan && isCancelledNextMonth ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 cursor-default font-bold' : 
                                                  isCurrentPlan ? 'bg-secondary/50 text-muted-foreground border border-border cursor-default font-bold' : plan.btnStyle}
                                            `}
                                        >
                                            {loadingPlan === plan.id ? (
                                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                            ) : isCurrentPlan && isCancelledNextMonth ? (
                                                <span className="material-symbols-outlined text-[18px]">block</span>
                                            ) : isCurrentPlan ? (
                                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            ) : null}
                                            {
                                                isCurrentPlan && isCancelledNextMonth ? 'Assinatura Cancelada' :
                                                isCurrentPlan ? 'Plano Atual' : 
                                                plan.id === 'free' ? 'Cancelar e Voltar ao Básico' : plan.buttonText
                                            }
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                
                <p className="text-xs font-medium text-muted-foreground mt-12 mb-4 max-w-lg mx-auto leading-relaxed text-center">
                    Leia os <a href="/termos" target="_blank" className="text-emerald-500 hover:underline">Termos e Condições de Consumo de Inteligência Artificial</a> e Políticas de Estorno.<br/>
                    Você pode cancelar ou alterar seu plano a qualquer momento. Os pagamentos são processados com total segurança através da plataforma <strong>Mercado Pago</strong> com opções de PIX ou Cartão de Crédito.
                </p>

                <AnimatePresence>
                    {showTermsModal && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                        >
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden p-8 relative"
                            >
                                <button 
                                    onClick={() => setShowTermsModal(false)}
                                    className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                                
                                <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-500">gavel</span>
                                    Termos de Assinatura
                                </h3>
                                
                                <p className="text-foreground/80 leading-relaxed mb-6">
                                    Antes de prosseguirmos para o pagamento de sua primeira assinatura ou upgrade, precisamos da sua concordância com a nossa <strong>Política de Consumo</strong>.
                                </p>

                                <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/30 border border-border mb-8">
                                    <input 
                                        type="checkbox" 
                                        id="modal-terms" 
                                        checked={acceptedTerms} 
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="w-6 h-6 rounded border-border accent-emerald-500 cursor-pointer mt-0.5 shrink-0"
                                    />
                                    <label htmlFor="modal-terms" className="text-sm font-medium text-foreground cursor-pointer select-none leading-snug">
                                        Li e aceito integralmente os <a href="/termos" target="_blank" className="text-emerald-500 hover:underline font-bold">Termos e Condições de Consumo de Inteligência Artificial e Políticas de Estorno</a>, ciente da cláusula de retenção caso o limite de uso seja ultrapassado.
                                    </label>
                                </div>
                                
                                <button
                                    onClick={handleAcceptTermsAndProceed}
                                    disabled={loadingPlan === 'terms' || !acceptedTerms}
                                    className="w-full py-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loadingPlan === 'terms' ? (
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined">check_circle</span>
                                    )}
                                    Enviar e Prosseguir
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </main>
    );
}
