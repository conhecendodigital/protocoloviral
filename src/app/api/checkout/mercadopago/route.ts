import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createServerSupabase } from '@/lib/supabase/server';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
  try {
    const { planId } = await req.json();

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('email, plan_tier, mp_subscription_id').eq('id', user.id).single();

    let title, price;
    if (planId === 'pro') {
      title = 'Plano Profissional - 30 Dias';
      price = 49.00;
    } else if (planId === 'premium') {
      title = 'Plano Elite VIP - 30 Dias';
      price = 97.00;
    } else {
      return NextResponse.json({ error: 'Plan invalid' }, { status: 400 });
    }

    // O Mercado Pago recusa 'localhost' (mesmo com HTTP) no back_url para assinaturas (PreApproval).
    // Usamos uma URL HTTPS válida (fictícia ou real) se NEXT_PUBLIC_APP_URL estiver ausente ou for localhost.
    let rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    if (!rawBaseUrl || rawBaseUrl.includes('localhost')) {
        rawBaseUrl = 'https://protocoloviral.com.br'; // URL válida exigida pelo SDK do MP para não estourar erro
    }
    // CEO solicitou o uso explícito da API de Assinaturas Recorrentes do Mercado Pago
    const preApproval = new PreApproval(client);

    // Lógica de Upgrade: Se há assinatura prévia rolando e é um upgrade cruzado, cancela a antiga ANTES de gerar a nova cobrança
    if (profile?.plan_tier !== 'free' && profile?.mp_subscription_id && profile?.plan_tier !== planId) {
        try {
            await preApproval.update({
                id: profile.mp_subscription_id,
                body: { status: 'cancelled' }
            });
            console.log(`[Upgrade-Flow] Old subscription ${profile.mp_subscription_id} cancelled to make room for ${planId}`);
        } catch(cancelErr) {
            console.log(`[Upgrade-Flow] Failed to cancel old sub (might be cancelled already). Ignoring.`);
        }
    }
    
    const response = await preApproval.create({
      body: {
        reason: title,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: price,
          currency_id: 'BRL',
        },
        back_url: `${rawBaseUrl}/planos?success=true`,
        payer_email: profile?.email || user.email,
        external_reference: `${user.id}___${planId}`
      }
    });

    // Salva provisoriamente o REAL ID da PreApproval para o Webhook e painel poderem cancelar no futuro
    if (response?.id) {
        await supabase.from('profiles').update({ mp_subscription_id: response.id }).eq('id', user.id);
    }

    return NextResponse.json({ url: response.init_point });
  } catch (error: any) {
    console.error('Mercado Pago Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Error creating checkout session' }, { status: 500 });
  }
}
