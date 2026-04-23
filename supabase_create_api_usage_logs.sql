-- Supabase SQL to create the api_usage_logs table and optimize queries
CREATE TABLE public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,          -- Ex: 'roteirista', 'chat_agent', 'analyze_bio'
    model_used TEXT NOT NULL,       -- Ex: 'gpt-4o', 'claude-3-5-sonnet-20240620'
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    cost_brl NUMERIC(10, 6) NOT NULL, -- Custo calculado no momento do uso (em Reais)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for fast analytical queries (dashboard and user profile)
CREATE INDEX idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);
CREATE INDEX idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX idx_api_usage_logs_model_used ON public.api_usage_logs(model_used);
CREATE INDEX idx_api_usage_logs_feature ON public.api_usage_logs(feature);

-- RLS (Row Level Security) - Permite que o usuário veja apenas seus próprios logs
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own api usage logs"
    ON public.api_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Opcional: Se admin puder ver tudo, e se você tiver um claim de admin
-- CREATE POLICY "Admins can view all logs" ON public.api_usage_logs FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
