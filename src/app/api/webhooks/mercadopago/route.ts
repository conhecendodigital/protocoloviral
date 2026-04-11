import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const dataId = url.searchParams.get('data.id');
    const type = url.searchParams.get('type');
    
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
