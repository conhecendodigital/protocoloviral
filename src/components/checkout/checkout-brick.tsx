'use client'

import { useEffect, useState } from 'react'
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react'
import { Loader2, X } from 'lucide-react'

// Inicializa com a Public Key do ENV
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '', { locale: 'pt-BR' })

interface CheckoutBrickProps {
  planId: string;
  price: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onClose: () => void;
}

export function CheckoutBrick({ planId, price, onSuccess, onError, onClose }: CheckoutBrickProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const onSubmit = async (formData: any) => {
    setIsProcessing(true);
    try {
      //formData contains token (card_token_id), issuer_id, payment_method_id, etc.
      const res = await fetch('/api/checkout/mercadopago-transparent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          cardTokenId: formData.token,
          payerEmail: formData.payer.email,
          documentType: formData.payer.identification.type,
          documentNumber: formData.payer.identification.number,
          paymentMethodId: formData.payment_method_id,
          issuerId: formData.issuer_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar assinatura');
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      onError(err.message || 'Falha na comunicação com o banco.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onErrorHandler = (error: any) => {
    console.error("CardPayment erro:", error);
    if (error.cause && error.cause[0] && error.cause[0].code === 'payment_method_not_found') return;
  };

  const onReady = () => {
    // Brick fully loaded
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Pagamento Seguro</h3>
          <p className="text-sm text-slate-500 dark:text-white/60">Insira seus dados para ativar a assinatura.</p>
        </div>

        {/* Mercado Pago Brick */}
        <div className={`transition-opacity duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
           <CardPayment
              initialization={{ amount: price }}
              onSubmit={onSubmit}
              onReady={onReady}
              onError={onErrorHandler}
              customization={{
                visual: {
                  style: {
                    theme: "default", // Ou "dark" se quisermos forçar o dark mode pro brick
                  }
                },
                paymentMethods: {
                    maxInstallments: 1, // Assinatura não tem parcelamento no cartão de crédito via MP standard logic
                }
              }}
           />
        </div>

        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-2xl z-10">
            <Loader2 className="w-10 h-10 animate-spin text-[#0ea5e9] mb-4" />
            <p className="font-bold text-slate-900 dark:text-white">Processando Assinatura...</p>
            <p className="text-sm text-slate-600 dark:text-white/60 text-center max-w-[80%] mt-2">
              Estamos validando o seu cartão com o banco. Por favor, não feche esta janela.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
