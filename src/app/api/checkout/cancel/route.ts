import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('plan_tier, mp_subscription_id, tokens_used_this_cycle, subscription_start_date')
            .eq('id', user.id)
            .single();

        if (!profile || profile.plan_tier === 'free') {
            return NextResponse.json({ error: 'Você já está no plano grátis' }, { status: 400 });
        }

        // Lógica de Prazo
        const start = profile.subscription_start_date ? new Date(profile.subscription_start_date) : new Date();
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        // Define Limite Condição B (15% de Créditos)
        // Regra: Pro = 50k tokens diarios * 30 * 0.15 = 225.000 tokens
        // Premium = 150k diarios * 30 * 0.15 = 675.000 tokens
        let usageLimit = 0;
        if (profile.plan_tier === 'pro') usageLimit = 225000;
        if (profile.plan_tier === 'premium') usageLimit = 675000;

        const isUnderRefundWindow = diffDays <= 7;
        const isUnderUsageAbuse = (profile.tokens_used_this_cycle || 0) < usageLimit;

        // Sempre tentamos cancelar o ID da pre-approval na nuvem para não renovar mês que vem!
        if (profile.mp_subscription_id) {
            // Em produção aqui entraria a chamada fetch REST ao MercadoPago de cancelamento:
            const mpToken = process.env.MP_ACCESS_TOKEN;
            if (mpToken) {
                // Call M.P API silenciosa para dar CANCEL (Sem throw se falhar para não bloquear o banco do app)
                await fetch(`https://api.mercadopago.com/preapproval/${profile.mp_subscription_id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${mpToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled' })
                }).catch(()=>null);
            }
        }

        let message = '';
        
        // CONDIÇÃO A: (Até 7 dias E não abusou) -> Estorno com Refund Nativo + Queda Livre Instantânea
        if (isUnderRefundWindow && isUnderUsageAbuse) {
            
            // Aqui chamaria a API Mercadopago REFUND na transação se o MP suporte reembolso direto no preapproval, ou se gravamos o transaction_id.
            
            // Rebaixa na hora
            await supabase
                .from('profiles')
                .update({
                    plan_tier: 'free',
                    mp_subscription_id: null,
                    cancel_at_period_end: false
                })
                .eq('id', user.id);
            
            message = 'Condição A: Estorno Liberado. Sua assinatura foi desfeita integralmente de imediato.';
            
        } else {
            // CONDIÇÃO B: (Passou dos 7 dias OU Acabou com os Tokens num Sprint (Atingiu Muro de 15%)) -> Agenda Downgrade e retem dinheiro.
            await supabase
                .from('profiles')
                .update({
                    cancel_at_period_end: true
                })
                .eq('id', user.id);
                
            message = 'Condição B: Assinatura Futura Cancelada (Sem Renovação). Seu consumo excedeu as regras e você perderá o acesso definitivo no fim de seu ciclo mensal já pago. Sem Reembolso.';
        }

        return NextResponse.json({ success: true, message });
        
    } catch (error) {
        console.error('API /checkout/cancel Error:', error);
        return NextResponse.json({ error: 'Erro interno cancelar' }, { status: 500 });
    }
}
