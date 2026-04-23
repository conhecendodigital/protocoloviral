-- Adicionar a coluna cost_brl (custo exato do roteiro gerado em Reais)
ALTER TABLE roteiros 
ADD COLUMN IF NOT EXISTS cost_brl NUMERIC(10, 4) DEFAULT 0.0000;

-- Opcional: Para ter um tracking inicial para usuários antigos
-- Podemos preencher roteiros existentes com um valor estimado retroativo 
-- baseado nos modelos free e pro (mas deixaremos zero para priorizar os custos em tempo real daqui em diante)
UPDATE roteiros SET cost_brl = 0.0000 WHERE cost_brl IS NULL;
