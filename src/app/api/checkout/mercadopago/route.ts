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

    // O Mercado Pago recusa 'localhost' (mesmo com HTTP) no back_url para assinaturas (PreApproval).
    // Usamos uma URL HTTPS válida (fictícia ou real) se NEXT_PUBLIC_APP_URL estiver ausente ou for localhost.
    let rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    if (!rawBaseUrl || rawBaseUrl.includes('localhost')) {
        rawBaseUrl = 'https://protocoloviral.com.br'; // URL válida exigida pelo SDK do MP para não estourar erro
    }
    // CEO solicitou o uso explícito da API de Assinaturas Recorrentes do Mercado Pago
    const preApproval = new PreApproval(client);

    // Removido: O cancelamento imediato aqui apagava a assinatura velha antes do usuário pagar.
    // Agora isso é gerenciado exclusivamente no Webhook após a confirmação do pagamento.
    const response = await preApproval.create({
      body: {
        reason: title,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: price,
          currency_id: 'BRL',
        },
        back_url: `${rawBaseUrl}/?success=true`,
        payer_email: profile?.email || user.email,
        external_reference: `${user.id}___${planId}___${profile?.mp_subscription_id || 'none'}`
      }
    });

    // Removido: O salvamento provisório do ID da PreApproval agora é feito de forma segura
    // apenas no Webhook, evitando que o usuário perca acesso para cancelar a assinatura ativa se fechar o popup.

    return NextResponse.json({ url: response.init_point });
  } catch (error: any) {
    console.error('Mercado Pago Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Error creating checkout session' }, { status: 500 });
  }
}
