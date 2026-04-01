"use client";

import { motion } from "framer-motion";

export default function AjudaPlanosPage() {
    return (
        <main className="min-h-screen w-full custom-scrollbar p-6 lg:p-12 relative bg-background flex flex-col items-center">
            <div className="max-w-4xl w-full z-10 relative mt-8 mb-16">

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">Central de Ajuda: Faturamento e Assinaturas</h1>
                    <p className="text-lg text-muted-foreground w-full max-w-2xl mx-auto">Transparência total sobre como funcionam cobranças, devoluções, trocas de plano e limites no uso dos nossos robôs de IA.</p>
                </div>

                {/* Conteúdo Institucional */}
                <div className="space-y-12">
                    
                    {/* Seção 1: Direito de Arrependimento e Uso */}
                    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-border pb-3 mb-6">
                            <span className="material-symbols-outlined text-indigo-500">gavel</span>
                            Direito de Arrependimento e Estornos
                        </h2>
                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-foreground/80 leading-relaxed">
                            <p>
                                De acordo com as leis vigentes de proteção ao consumidor, você possui a garantia Incondicional de cancelamento com devolução integral do valor nos <strong>primeiros 7 dias após a data da sua primeiríssima assinatura</strong>.
                            </p>
                            <p>
                                <strong>⚠️ Cláusula de Consumo Integral de Serviço Tecnológico:</strong><br/>
                                Entenda que nosso serviço é baseado em custos ativos de processamento de Nuvem e Machine Learning. Caso nossos sistemas registrem que sua conta consumiu <strong>mais do que 15% do total de créditos disponíveis do plano assinado (Tokens de IA)</strong> dentro desses primeiros 7 dias, a Lei considera a prática como <em>fruição integral do infoproduto digital</em>. 
                            </p>
                            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                                <strong>O que ocorre se o "Gatilho de 15%" for acionado?</strong><br/>
                                Você continuará tendo o direito pleno de cancelar sua assinatura a qualquer momento. No entanto, o sistema <strong>revogará a devolução monetária (reembolso)</strong>, configurando apenas um "Status de Cancelamento Futuro" (Condição B), garantindo seu acesso de uso pelo restante dos 30 dias que já foram pagos sem interrupções.
                            </div>
                            <p className="text-sm italic">O direito de arrependimento (com reembolso monetário) aplica-se exclusivamente à contratação original do serviço, não se estendendo a renovações mensais ou subidas agressivas de plano após uso deliberado.</p>
                        </div>
                    </motion.section>

                    {/* Seção 2: Upgrades */}
                    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-border pb-3 mb-6">
                            <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                            Como funcionam os Upgrades? (Ex: Subir para VIP)
                        </h2>
                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-foreground/80 leading-relaxed">
                            <p>
                                Ao realizar um <strong>Upgrade</strong>, sua assinatura anterior do Mercado Pago será imediatamente pausada para que você não encare dupla-cobrança. A liberação do seu novo limite VIP é processada na mesma hora em que o novo cartão for aprovado.
                            </p>
                            <p>
                                <strong>Pagamento:</strong> Devido a regulações bancárias de transações recorrentes, você pagará o valor íntegro do novo plano agora, como de costume. Porém, **nenhum centavo de crédito anterior será perdido.** Na data em que o servidor processar seu Upgrade, faremos o cálculo de quantos dias ociosos sobrariam na velha fatura, convertemos isso em créditos VIP, e empurramos a sua *Próxima Data de Expiração* mais para a frente automaticamente!
                            </p>
                        </div>
                    </motion.section>

                    {/* Seção 3: Downgrades / Modificações Livres */}
                    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-border pb-3 mb-6">
                            <span className="material-symbols-outlined text-rose-500">trending_down</span>
                            Como Cancelar, Pausar ou Fazer Downgrade?
                        </h2>
                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-foreground/80 leading-relaxed">
                            <p>
                                Somos inimigos de burocracia. O cancelamento pode ser engatilhado na aba de Planos a qualquer instante com 1 único clique.
                            </p>
                            <p>
                                <strong>Transições e Aproveitamento (Downgrade Agendado):</strong><br/>
                                Como sua mensalidade já foi ativada na sua operadora de cartão, se você assinar o Premium hoje, e no dia 15 resolver apertar o botão "Cancelar" (ou voltar para o Free), nós cancelaremos instantaneamente o mandato no Banco (Mercado Pago), evitando uma futura cobrança no fim do mês. 
                            </p>
                            <p>
                                Ainda assim, a sua conta em nossa plataforma não sofrerá absolutamente nenhum corte de inteligência! **Você continuará como Usuário VIP sem restrições pelos 15 dias que restarem de vigência original** que você nos pagou. Somente após a data cronometrada se apagar, seu perfil voltará silenciosamente para as limitações do nível Básico (Free).
                            </p>
                        </div>
                    </motion.section>

                </div>

                <div className="mt-16 text-center text-sm text-muted-foreground border-t border-border pt-8 pb-4">
                    Última Atualização dos Termos: 1 de Abril de 2026. <br/>
                    Tecnologia baseada por Mercado Pago ©
                </div>
            </div>
        </main>
    );
}
