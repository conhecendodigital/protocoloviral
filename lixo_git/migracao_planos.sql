
-- Migration: Assinaturas e Limites de Integracoes (Mercado Pago)

-- 1. Tabela Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_used_today integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_token_reset timestamp with time zone DEFAULT now();

-- Novas colunas de gerenciamento do ciclo de vida da assinatura (Reembolsos, Upgrade e Cancelamento)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_used_this_cycle integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone;

-- 2. Tabela Agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS required_plan text DEFAULT 'free';

-- Avisos:
-- Execute estas linhas no Editor SQL do seu painel do Supabase.
