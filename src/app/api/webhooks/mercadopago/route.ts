import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const dataId = url.searchParams.get('data.id');
    const type = url.searchParams.get('type');

    // ✅ SECURITY: Mercado Pago webhook signature MUST be present and valid.
    // Sem essa verificação, qualquer um pode conceder plano pago via POST forjado.
    const mpSignature = req.headers.get('x-signature')
    const mpRequestId = req.headers.get('x-request-id')
    const webhookSecret = process.env.MP_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('[Webhook] MP_WEBHOOK_SECRET não configurado — fail-closed.')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }
    if (!mpSignature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // MP signature format: "ts=<timestamp>,v1=<hmac_sha256>"
    const sigParts = Object.fromEntries(mpSignature.split(',').map(p => p.split('=')))
    const ts = sigParts['ts']
    const v1 = sigParts['v1']
    if (!ts || !v1) {
      return NextResponse.json({ error: 'Malformed signature' }, { status: 401 })
    }

    const signedPayload = `id:${dataId};request-id:${mpRequestId};ts:${ts};`
    const crypto = await import('crypto')
    const expected = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex')
    if (expected !== v1) {
      console.error('[Webhook] Assinatura inválida — possível tentativa de spoofing.')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // O webhook envia JSON na maioria dos casos, mas fallback pras QS
    const body = await req.json().catch(() => null);
    const action = body?.action || type;
    const paymentId = body?.data?.id || dataId;

    if (action === 'payment.created' || action === 'payment.updated') {
      if (!paymentId) {
        return NextResponse.json({ error: 'Id Not found' }, { status: 400 });
      }

      // Busca o status confirmadamente do Mercado Pago para evitar frauds de origin
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });
      
      if (paymentData.status === 'approved') {
         // Utilizamos a referência externa pra saber 'quem' comprou 'o quê' (e o que ele tinha antes)
         const extRef = paymentData.external_reference;
         if (extRef && extRef.includes('___')) {
             const parts = extRef.split('___');
             const userId = parts[0];
             const planId = parts[1];
             const oldSubId = parts[2];

             // ✅ SECURITY: Validate userId is a proper UUID to prevent injection via external_reference
             const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
             const SAFE_PLANS = ['mensal', 'trimestral', 'semestral', 'anual']
             if (!UUID_REGEX.test(userId) || !SAFE_PLANS.includes(planId)) {
               console.error('[Webhook] external_reference inválido:', extRef)
               return NextResponse.json({ success: false }, { status: 400 })
             }

             // Supabase Client via Role Secundária pra bypass RLS em bg
             const supabaseAdmin = createClient(
               process.env.NEXT_PUBLIC_SUPABASE_URL!,
               process.env.SUPABASE_SERVICE_ROLE_KEY!
             );
             
             // Consulta perfil antes para comparar se é Upgrade/Inicial ou mera Renovação Mensal
             const { data: profile } = await supabaseAdmin.from('profiles').select('plan_tier').eq('id', userId).single();
             const isNewContract = profile?.plan_tier !== planId;

             // Atualizamos a "Vigência" (+30 dias)
             const periodEnd = new Date();
             periodEnd.setDate(periodEnd.getDate() + 30);

             const updatePayload: any = {
                 plan_tier: planId,
                 mp_customer_id: paymentData.payer?.id ? String(paymentData.payer.id) : null,
                 current_period_end: periodEnd.toISOString()
             };

             if (isNewContract) {
                 updatePayload.subscription_start_date = new Date().toISOString();
                 updatePayload.tokens_used_this_cycle = 0;
                 updatePayload.cancel_at_period_end = false;
                 
                 // Segurança: Só agora que o pagamento foi aprovado nós cancelamos formalmente o contrato/plano antigo
                 if (oldSubId && oldSubId !== 'none') {
                     try {
                         await new PreApproval(client).update({ id: oldSubId, body: { status: 'cancelled' } });
                         console.log(`[Webhook] Contrato anterior ${oldSubId} cancelado com sucesso por upgrade.`);
                     } catch(e) {
                         console.error(`[Webhook] Falha ao tentar cancelar contrato anterior ${oldSubId} (ignorado).`, e);
                     }
                 }
             }

             await supabaseAdmin.from('profiles').update(updatePayload).eq('id', userId);
             
             console.log(`[Webhooks - MP] User ${userId} upgraded/renewed successfully. Plan: ${planId}. New Contract: ${isNewContract}`);
         }
      }
    } else if (type === 'subscription_preapproval') {
       if (!paymentId) return NextResponse.json({ error: 'Id Not found' }, { status: 400 });
       
       const preApproval = new PreApproval(client);
       const preAppData = await preApproval.get({ id: paymentId });
       
       // Assim que a assinatura torna-se vigente (authorized), plugamos o ID dela no DB!
       if (preAppData.status === 'authorized') {
          const extRef = preAppData.external_reference;
          if (extRef && extRef.includes('___')) {
             const parts = extRef.split('___');
             const userId = parts[0];
             
             const supabaseAdmin = createClient(
                 process.env.NEXT_PUBLIC_SUPABASE_URL!,
                 process.env.SUPABASE_SERVICE_ROLE_KEY!
             );
             await supabaseAdmin.from('profiles').update({ mp_subscription_id: preAppData.id }).eq('id', userId);
             console.log(`[Webhook - PreApproval] User ${userId} active sub ID set to ${preAppData.id}`);
          }
       }
    }

    // Retorna imediato pra não timeout no MP
    return NextResponse.json({ success: true, processed: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 });
  }
}
