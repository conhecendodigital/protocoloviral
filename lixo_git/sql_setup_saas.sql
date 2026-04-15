-- ═══════════════════════════════════════════════════════════════════
-- SQL COMPLETO PARA O SUPABASE DO SAAS "PROTOCOLO VIRAL"
-- Cole este SQL inteiro no Editor SQL do Supabase e clique em "Run"
-- ═══════════════════════════════════════════════════════════════════


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 1: EXTENSÃO PGVECTOR (necessária para buscas semânticas)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE EXTENSION IF NOT EXISTS vector;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 2: TABELA DE MEMÓRIAS DO USUÁRIO (RAG para o Roteirista)
-- Usada pela API /api/memorias e pela busca RAG em /api/roteirista
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS memorias_usuario (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  content_type text DEFAULT 'roteiro',
  metadata jsonb DEFAULT '{}',
  embedding vector(1536),
  created_at timestamp with time zone DEFAULT now()
);

-- Índice para buscas vetoriais rápidas (cosine similarity)
CREATE INDEX IF NOT EXISTS idx_memorias_embedding 
  ON memorias_usuario 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Índice para filtrar por usuário
CREATE INDEX IF NOT EXISTS idx_memorias_user 
  ON memorias_usuario(user_id);

-- RLS: Cada usuário só vê suas próprias memórias
ALTER TABLE memorias_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas suas memórias" 
  ON memorias_usuario FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários inserem apenas suas memórias" 
  ON memorias_usuario FOR INSERT 
  WITH CHECK (auth.uid() = user_id);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 3: FUNÇÃO RPC DE BUSCA SEMÂNTICA (match_memorias)
-- Chamada pelo Roteirista no modo "premium" para injetar contexto
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION match_memorias(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 3,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  content_type text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.content_type,
    m.metadata,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM memorias_usuario m
  WHERE 
    (filter_user_id IS NULL OR m.user_id = filter_user_id)
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 4: COLUNAS EXTRAS NA TABELA PROFILES 
-- (Planos, MercadoPago, DNA do Cliente)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_used_today integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_token_reset timestamp with time zone DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_used_this_cycle integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_accepted_terms boolean DEFAULT false;

-- DNA do Cliente (usado pelo Roteirista para personalizar roteiros)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS publico text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dor text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tentou text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diferencial text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS proposito text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS naoquer text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS produto_venda text;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 5: TABELA DE CRÉDITOS MENSAIS (para planos pagos)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS creditos_mensais (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credits_total integer DEFAULT 50,
  credits_used integer DEFAULT 0,
  period_start timestamp with time zone DEFAULT now(),
  period_end timestamp with time zone DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE creditos_mensais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas seus créditos" 
  ON creditos_mensais FOR SELECT 
  USING (auth.uid() = user_id);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTE 6: COLUNA NA TABELA AGENTS (plano mínimo para acessar)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE agents ADD COLUMN IF NOT EXISTS required_plan text DEFAULT 'free';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIM! Tudo pronto. Agora injetar os formatos virais via script.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
