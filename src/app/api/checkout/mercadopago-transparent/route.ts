import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createServerSupabase } from '@/lib/supabase/server';

if (!process.env.MP_ACCESS_TOKEN) {
  console.error("CRITICAL: MP_ACCESS_TOKEN is missing in environment variables!");
}
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
  try {
    const { planId, cardTokenId, payerEmail } = await req.json();

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('email, plan_tier, mp_subscription_id').eq('id', user.id).single();

    let title, price;
    if (planId === 'mensal') {
      title = 'Plano Mensal - Protocolo Viral';
      price = 97.00;
    } else if (planId === 'trimestral') {
      title = 'Plano Trimestral - Protocolo Viral';
      price = 200.00;
    } else if (planId === 'semestral') {
      title = 'Plano Semestral - Protocolo Viral';
      price = 297.00;
    } else {
      return NextResponse.json({ error: 'Plan invalid' }, { status: 400 });
    }

    if (!cardTokenId) {
      return NextResponse.json({ error: 'Card token ausente. Pagamento falhou.' }, { status: 400 });
    }

    const preApproval = new PreApproval(client);

    // O status "authorized" força a assinatura a tentar capturar a primeira mensalidade na hora com o token_id.
    const response = await preApproval.create({
      body: {
        reason: title,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: price,
          currency_id: 'BRL',
        },
        payer_email: payerEmail || profile?.email || user.email,
        card_token_id: cardTokenId,
        status: 'authorized',
        external_reference: `${user.id}___${planId}___${profile?.mp_subscription_id || 'none'}`
      }
    });

    // Como é checkout transparente com o Token, a assinatura já foi gerada e (se tudo deu certo) autorizada com o cartão.
    // O Webhook oficial vai receber o `payment.created` daqui a 2 segundos e fazer o upgrade oficial na conta do usuário, 
    // mas nós já podemos retornar sucesso pro frontend fechar a tela.

    return NextResponse.json({ success: true, subscriptionId: response.id });
  } catch (error: any) {
    console.error('Mercado Pago Transparent Checkout Error:', error);
    let errorMessage = error.message || 'Error creating checkout session';
    
    // Tentamos devolver mensagens em português
    if (errorMessage.includes('parameter card_token_id')) {
        errorMessage = 'Cartão de crédito inválido ou recusado pelo banco emissor.';
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
