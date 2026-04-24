-- Funções RPC para Otimização do Painel Administrativo

-- 1. Métricas Globais do Dashboard (Total de usuários, Pro, Requisições, Custos)
DROP FUNCTION IF EXISTS get_admin_dashboard_metrics();
CREATE OR REPLACE FUNCTION get_admin_dashboard_metrics()
RETURNS TABLE (
  total_users BIGINT,
  pro_subscribers BIGINT,
  total_requests BIGINT,
  total_cost_brl NUMERIC
) AS $$
DECLARE
  v_total_users BIGINT;
  v_pro_subscribers BIGINT;
  v_total_requests BIGINT;
  v_total_cost_brl NUMERIC;
BEGIN
  -- Contar usuários
  SELECT count(*) INTO v_total_users FROM profiles;
  
  -- Contar assinantes PRO
  SELECT count(*) INTO v_pro_subscribers FROM profiles WHERE plan_tier != 'free' OR mp_subscription_id IS NOT NULL;

  -- Contar requisições totais de IA (todas as features)
  SELECT count(*) INTO v_total_requests FROM api_usage_logs;

  -- Somar custos reais
  SELECT COALESCE(sum(cost_brl), 0) INTO v_total_cost_brl FROM api_usage_logs;

  RETURN QUERY SELECT v_total_users, v_pro_subscribers, v_total_requests, v_total_cost_brl;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Estatísticas de Uso de APIs
CREATE OR REPLACE FUNCTION get_admin_api_stats()
RETURNS TABLE (
  model_used TEXT,
  request_count BIGINT,
  total_cost_brl NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.model_used,
    count(*) as request_count,
    sum(a.cost_brl) as total_cost_brl
  FROM api_usage_logs a
  GROUP BY a.model_used
  ORDER BY total_cost_brl DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


DROP FUNCTION IF EXISTS get_admin_users_ranked(BOOLEAN, INT, INT);
CREATE OR REPLACE FUNCTION get_admin_users_ranked(filter_pro BOOLEAN, limit_val INT, offset_val INT)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  email TEXT,
  plan_tier TEXT,
  created_at TIMESTAMPTZ,
  request_count BIGINT,
  total_cost_brl NUMERIC,
  total_count BIGINT
) AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  WITH filtered_profiles AS (
    SELECT p.id, p.nome_completo, p.email, p.plan_tier, p.created_at
    FROM profiles p
    WHERE (filter_pro = FALSE OR p.plan_tier != 'free')
  ),
  total_records AS (
    SELECT count(*) as cnt FROM filtered_profiles
  )
  SELECT 
    fp.id,
    COALESCE(fp.nome_completo, fp.email, 'Usuário sem nome') as display_name,
    fp.email,
    fp.plan_tier,
    fp.created_at,
    COALESCE(logs.req_count, 0)::BIGINT as request_count,
    COALESCE(logs.total_cost, 0)::NUMERIC as total_cost_brl,
    (SELECT cnt FROM total_records) as total_count
  FROM filtered_profiles fp
  LEFT JOIN (
    SELECT a.user_id, count(*) as req_count, sum(a.cost_brl) as total_cost 
    FROM api_usage_logs a
    GROUP BY a.user_id
  ) logs ON logs.user_id = fp.id
  ORDER BY COALESCE(logs.total_cost, 0) DESC, COALESCE(logs.req_count, 0) DESC, fp.created_at DESC
  LIMIT limit_val OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
