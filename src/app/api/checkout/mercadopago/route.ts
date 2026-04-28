import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createServerSupabase } from '@/lib/supabase/server';

if (!process.env.MP_ACCESS_TOKEN) {
  console.error("CRITICAL: MP_ACCESS_TOKEN is missing in environment variables!");
}
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
    // Capturamos ativamente de onde o request está vindo (para funcionar dinâmico em deploys de produção / Vercel sem precisar de ENV fixa).
    const originHeader = req.headers.get('origin');
    const refererHeader = req.headers.get('referer');
    let rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    try {
        if (originHeader) rawBaseUrl = new URL(originHeader).origin;
        else if (refererHeader) rawBaseUrl = new URL(refererHeader).origin;
    } catch(e) {}

    // Tratativa para desenvolvimento
    if (!rawBaseUrl || rawBaseUrl.includes('localhost') || rawBaseUrl.includes('127.0.0.1')) {
        rawBaseUrl = 'https://protocoloviral.com.br'; // URL válida exigida pelo SDK do MP para dev (bypass)
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
    const isMisconfigured = !process.env.MP_ACCESS_TOKEN
      || (typeof error?.message === 'string' && error.message.includes('Unauthorized access to resource'));
    const errorMessage = isMisconfigured
      ? 'Pagamento temporariamente indisponível. Tente novamente em instantes.'
      : 'Erro ao iniciar checkout. Tente novamente.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
